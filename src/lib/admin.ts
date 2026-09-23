import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Pas de "use server" ici volontairement : ces fonctions ne doivent jamais
// devenir des Server Actions appelables depuis le navigateur. Les actions
// (admin-actions.ts) et la page les appellent après exigerAdminDeverrouille.

export function estAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.trim().toLowerCase());
}

// ---------------------------------------------------------------------------
// Déverrouillage par mot de passe : en plus d'être connecté avec un compte
// administrateur, il faut saisir ADMIN_PASSWORD. Le déverrouillage est
// mémorisé 8 h dans un cookie signé, lié au compte (inutilisable par un
// autre utilisateur) et invalidé automatiquement si le mot de passe change.
// ---------------------------------------------------------------------------

export const COOKIE_BACK_OFFICE = "whaoo_back_office";
export const DUREE_DEVERROUILLAGE_S = 8 * 60 * 60;

function cleSignature(): string | null {
  const motDePasse = process.env.ADMIN_PASSWORD;
  const secretServeur = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!motDePasse || !secretServeur) return null;
  return `${motDePasse}:${secretServeur}`;
}

function signer(contenu: string, cle: string): string {
  return createHmac("sha256", cle).update(contenu).digest("base64url");
}

function egalConstant(a: string, b: string): boolean {
  // Comparaison sur des empreintes de même longueur, pour ne rien révéler
  // de la longueur ni du contenu via le temps de réponse.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function motDePasseConfigure(): boolean {
  return cleSignature() !== null;
}

export function motDePasseCorrect(saisie: string): boolean {
  const attendu = process.env.ADMIN_PASSWORD;
  if (!attendu) return false;
  return egalConstant(saisie, attendu);
}

export function creerJetonBackOffice(userId: string): string | null {
  const cle = cleSignature();
  if (!cle) return null;
  const expiration = Math.floor(Date.now() / 1000) + DUREE_DEVERROUILLAGE_S;
  const contenu = `${userId}.${expiration}`;
  return `${contenu}.${signer(contenu, cle)}`;
}

function jetonValide(jeton: string | undefined, userId: string): boolean {
  const cle = cleSignature();
  if (!cle || !jeton) return false;
  const [id, expiration, signature] = jeton.split(".");
  if (!id || !expiration || !signature) return false;
  if (id !== userId) return false;
  if (Number(expiration) < Math.floor(Date.now() / 1000)) return false;
  return egalConstant(signature, signer(`${id}.${expiration}`, cle));
}

export type EtatAdmin =
  | { statut: "non_connecte" }
  | { statut: "non_admin" }
  | { statut: "verrouille"; userId: string; email: string }
  | { statut: "deverrouille"; userId: string; email: string };

export async function etatAdmin(): Promise<EtatAdmin> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { statut: "non_connecte" };
  if (!estAdmin(user.email)) return { statut: "non_admin" };

  const email = user.email as string;
  const jeton = (await cookies()).get(COOKIE_BACK_OFFICE)?.value;
  return jetonValide(jeton, user.id)
    ? { statut: "deverrouille", userId: user.id, email }
    : { statut: "verrouille", userId: user.id, email };
}

export async function exigerAdminDeverrouille(): Promise<{ userId: string; email: string }> {
  const etat = await etatAdmin();
  if (etat.statut !== "deverrouille") {
    throw new Error("Accès réservé à l'administrateur");
  }
  return { userId: etat.userId, email: etat.email };
}

export const CHAMPS_RECHERCHE = [
  { id: "nom", label: "Nom" },
  { id: "prenom", label: "Prénom" },
  { id: "telephone", label: "Téléphone" },
  { id: "email", label: "Email" },
] as const;

export type ChampRecherche = (typeof CHAMPS_RECHERCHE)[number]["id"];

export function estChampRecherche(valeur: string | undefined): valeur is ChampRecherche {
  return CHAMPS_RECHERCHE.some((c) => c.id === valeur);
}

export type ProfilTrouve = {
  id: string;
  prenom: string;
  nom: string;
  email: string | null;
  telephone: string | null;
  referral_code: string;
  created_at: string;
};

const LIMITE = 50;

function motifRecherche(champ: ChampRecherche, texte: string): string | null {
  if (champ === "telephone") {
    // Les numéros sont stockés tels que saisis ("0696 12 34 56",
    // "+596696123456"…) : on cherche la suite de chiffres en tolérant
    // n'importe quel séparateur entre eux.
    const chiffres = texte.replace(/\D/g, "");
    return chiffres ? `%${chiffres.split("").join("%")}%` : null;
  }
  // % et _ sont des jokers pour ILIKE, * aussi côté API Supabase.
  const nettoye = texte.trim().replace(/[\\%_*]/g, "");
  return nettoye ? `%${nettoye}%` : null;
}

export async function rechercherProfils(
  champ: ChampRecherche | null,
  texte: string,
): Promise<{ profils: ProfilTrouve[]; total: number }> {
  await exigerAdminDeverrouille();

  const admin = createAdminClient();

  const { count } = await admin.from("profiles").select("*", { count: "exact", head: true });

  let requete = admin
    .from("profiles")
    .select("id, prenom, nom, email, telephone, referral_code, created_at")
    .order("created_at", { ascending: false })
    .limit(LIMITE);

  const motif = champ ? motifRecherche(champ, texte) : null;
  if (champ && motif) {
    requete = requete.ilike(champ, motif);
  }

  const { data } = await requete;
  return { profils: (data ?? []) as ProfilTrouve[], total: count ?? 0 };
}
