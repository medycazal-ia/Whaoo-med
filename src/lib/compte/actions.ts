"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Droit à l'oubli (section 5.1 du cahier des charges) : suppression réelle,
// pas une simple désactivation. Supprime le compte Supabase Auth, ce qui
// entraîne en cascade celle du profil, des budgets et des articles (FK
// "on delete cascade" vers auth.users dans les migrations SQL).
//
// Ne supprime aucune donnée chez un connecteur externe (Airtable/Google
// Sheets/Excel) : ce cas n'existe pas encore tant que ces connecteurs ne
// sont pas implémentés (voir DECISIONS.md) — à traiter au moment de leur
// intégration.
export async function supprimerMonCompte(formData: FormData): Promise<void> {
  const confirmation = String(formData.get("confirmation") ?? "");
  if (confirmation !== "SUPPRIMER") {
    redirect("/app/parametres?error=confirmation");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    redirect("/app/parametres?error=suppression");
  }

  await supabase.auth.signOut();
  redirect("/?compte_supprime=1");
}
