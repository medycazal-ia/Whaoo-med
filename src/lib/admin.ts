import { createAdminClient } from "@/lib/supabase/admin";

// Pas de "use server" ici volontairement : ces fonctions ne doivent jamais
// devenir des Server Actions appelables depuis le navigateur. Elles ne sont
// utilisées que depuis des Server Components, après vérification estAdmin.

export function estAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.trim().toLowerCase());
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
  emailDemandeur: string | null | undefined,
  champ: ChampRecherche | null,
  texte: string,
): Promise<{ profils: ProfilTrouve[]; total: number }> {
  if (!estAdmin(emailDemandeur)) {
    throw new Error("Accès réservé à l'administrateur");
  }

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
