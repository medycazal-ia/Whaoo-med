"use server";

import { createAdminClient } from "@/lib/supabase/admin";

// Limite le nombre de tentatives de connexion échouées par email sur une
// fenêtre glissante, pour ralentir une attaque par force brute sur le mot
// de passe d'un compte précis. Le client "service role" est utilisé ici
// volontairement : cette table n'a aucune policy RLS (accès service role
// uniquement), donc un client anon/authentifié ne peut ni la lire ni y
// écrire.
const FENETRE_MINUTES = 5;
const MAX_TENTATIVES = 5;

export async function connexionLimitee(email: string): Promise<boolean> {
  const admin = createAdminClient();
  const depuis = new Date(Date.now() - FENETRE_MINUTES * 60_000).toISOString();

  const { count } = await admin
    .from("tentatives_connexion")
    .select("*", { count: "exact", head: true })
    .eq("email", email)
    .gte("cree_le", depuis);

  return (count ?? 0) >= MAX_TENTATIVES;
}

export async function enregistrerTentativeEchouee(email: string): Promise<void> {
  const admin = createAdminClient();
  await admin.from("tentatives_connexion").insert({ email });
}
