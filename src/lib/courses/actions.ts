"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { premierJourDuMois } from "@/lib/courses/rythme";

function moisEnDateISO(reference = new Date()): string {
  return premierJourDuMois(reference).toISOString().slice(0, 10);
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");
  return { supabase, user };
}

export async function definirBudgetMensuel(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const budgetAmount = Number(formData.get("budgetAmount"));

  if (!Number.isFinite(budgetAmount) || budgetAmount < 0) {
    redirect("/app?error=budget_invalide");
  }

  await supabase.from("budget_periods").upsert(
    {
      user_id: user.id,
      month: moisEnDateISO(),
      budget_amount: budgetAmount,
    },
    { onConflict: "user_id,month" },
  );

  revalidatePath("/app");
}

export async function ajouterArticle(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();

  const label = String(formData.get("label") ?? "").trim();
  const detail = String(formData.get("detail") ?? "").trim();
  const price = Number(formData.get("price") ?? 0) || 0;
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1) || 1);
  const status = formData.get("status") === "achete" ? "achete" : "a_acheter";

  if (!label) {
    redirect("/app?error=article_invalide");
  }

  await supabase.from("items").insert({
    user_id: user.id,
    label,
    detail: detail || null,
    price,
    quantity,
    status,
    achat_mois: status === "achete" ? moisEnDateISO() : null,
  });

  revalidatePath("/app");
}

export type IngredientALotter = { label: string; detail: string | null; quantity: number };

// Ajout en lot depuis une liste d'ingrédients collée (ex. recette) —
// appelé directement depuis un composant client, pas via un <form>.
export async function ajouterArticlesEnLot(items: IngredientALotter[]): Promise<void> {
  const { supabase, user } = await requireUser();
  if (items.length === 0) return;

  await supabase.from("items").insert(
    items.map((item) => ({
      user_id: user.id,
      label: item.label,
      detail: item.detail,
      price: 0,
      quantity: item.quantity,
      status: "a_acheter" as const,
      achat_mois: null,
    })),
  );

  revalidatePath("/app");
}

export async function basculerStatutArticle(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const nouveauStatut = formData.get("status") === "achete" ? "achete" : "a_acheter";

  await supabase
    .from("items")
    .update({
      status: nouveauStatut,
      achat_mois: nouveauStatut === "achete" ? moisEnDateISO() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/app");
}

export async function supprimerArticle(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") ?? "");

  await supabase.from("items").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/app");
}
