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
  const price = Number(formData.get("price") ?? 0) || 0;
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1) || 1);
  const status = formData.get("status") === "achete" ? "achete" : "a_acheter";

  if (!label) {
    redirect("/app?error=article_invalide");
  }

  const { data: periode } = await supabase
    .from("budget_periods")
    .select("id")
    .eq("user_id", user.id)
    .eq("month", moisEnDateISO())
    .single();

  if (!periode) {
    redirect("/app?error=budget_manquant");
  }

  await supabase.from("items").insert({
    user_id: user.id,
    budget_period_id: periode.id,
    label,
    price,
    quantity,
    status,
  });

  revalidatePath("/app");
}

export async function basculerStatutArticle(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const nouveauStatut = formData.get("status") === "achete" ? "achete" : "a_acheter";

  await supabase
    .from("items")
    .update({ status: nouveauStatut, updated_at: new Date().toISOString() })
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
