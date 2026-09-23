"use server";

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { connexionLimitee, enregistrerTentativeEchouee } from "@/lib/auth/rate-limit";
import {
  COOKIE_BACK_OFFICE,
  DUREE_DEVERROUILLAGE_S,
  creerJetonBackOffice,
  estChampRecherche,
  etatAdmin,
  exigerAdminDeverrouille,
  motDePasseConfigure,
  motDePasseCorrect,
} from "@/lib/admin";

// Chaque Server Action est un point d'entrée public : l'accès est revérifié
// ici à chaque appel, jamais supposé à partir de la page qui l'affiche.

const OPTIONS_COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/app/admin",
};

export async function deverrouillerBackOffice(formData: FormData): Promise<void> {
  const etat = await etatAdmin();
  if (etat.statut === "non_connecte") redirect("/connexion");
  if (etat.statut === "non_admin") notFound();

  if (!motDePasseConfigure()) redirect("/app/admin?erreur=non_configure");

  const cleLimite = `admin:${etat.email.toLowerCase()}`;
  if (await connexionLimitee(cleLimite)) redirect("/app/admin?erreur=trop_de_tentatives");

  const saisie = String(formData.get("mot_de_passe") ?? "");
  if (!motDePasseCorrect(saisie)) {
    await enregistrerTentativeEchouee(cleLimite);
    redirect("/app/admin?erreur=mot_de_passe");
  }

  const jeton = creerJetonBackOffice(etat.userId);
  if (!jeton) redirect("/app/admin?erreur=non_configure");

  (await cookies()).set(COOKIE_BACK_OFFICE, jeton, {
    ...OPTIONS_COOKIE,
    maxAge: DUREE_DEVERROUILLAGE_S,
  });
  redirect("/app/admin");
}

export async function verrouillerBackOffice(): Promise<void> {
  (await cookies()).set(COOKIE_BACK_OFFICE, "", { ...OPTIONS_COOKIE, maxAge: 0 });
  redirect("/app/admin");
}

const EMAIL_VALIDE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEPHONE_VALIDE = /^[0-9+().\-\s]*$/;

function urlRetour(formData: FormData, extra: Record<string, string>): string {
  const params = new URLSearchParams();
  const champ = String(formData.get("retour_champ") ?? "");
  const q = String(formData.get("retour_q") ?? "");
  if (estChampRecherche(champ) && q) {
    params.set("champ", champ);
    params.set("q", q);
  }
  for (const [cle, valeur] of Object.entries(extra)) params.set(cle, valeur);
  return `/app/admin?${params.toString()}`;
}

export async function modifierProfil(formData: FormData): Promise<void> {
  await exigerAdminDeverrouille();

  const id = String(formData.get("id") ?? "");
  const prenom = String(formData.get("prenom") ?? "").trim();
  const nom = String(formData.get("nom") ?? "").trim();
  const telephone = String(formData.get("telephone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  const erreur = (code: string) => redirect(urlRetour(formData, { erreur: code, id }));

  if (!id) erreur("profil_introuvable");
  if (!prenom || !nom || prenom.length > 100 || nom.length > 100) erreur("nom_invalide");
  if (telephone.length > 30 || !TELEPHONE_VALIDE.test(telephone)) erreur("telephone_invalide");
  if (!EMAIL_VALIDE.test(email) || email.length > 254) erreur("email_invalide");

  const admin = createAdminClient();

  const { data: actuel } = await admin.from("profiles").select("email").eq("id", id).maybeSingle();
  if (!actuel) erreur("profil_introuvable");

  // L'email est d'abord changé sur le compte lui-même (auth.users) : c'est
  // l'identifiant de connexion, et la copie dans profiles suit
  // automatiquement (triggers de la migration 0009).
  if (actuel?.email?.toLowerCase() !== email) {
    const { error } = await admin.auth.admin.updateUserById(id, {
      email,
      email_confirm: true,
    });
    if (error) {
      erreur(/already|registered|exists/i.test(error.message) ? "email_deja_utilise" : "email_echec");
    }
  }

  const { error: erreurProfil } = await admin
    .from("profiles")
    .update({ prenom, nom, telephone: telephone || null, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (erreurProfil) erreur("enregistrement");

  redirect(urlRetour(formData, { ok: id }));
}
