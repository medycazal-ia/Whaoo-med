"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  DEMO_COOKIE,
  etatDemoParDefaut,
  lireEtatDemo,
  type DemoState,
} from "@/lib/demo/state";
import { estimerPrix } from "@/lib/prix-estimes";

async function ecrireEtatDemo(state: DemoState) {
  const cookieStore = await cookies();
  // Cookie de session (pas de maxAge) : réinitialisé à la fermeture du
  // navigateur, jamais synchronisé avec la vraie base de données.
  cookieStore.set(DEMO_COOKIE, JSON.stringify(state), { path: "/demo" });
}

export async function ajouterArticleDemo(formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  const state = lireEtatDemo(cookieStore);

  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;

  const detail = String(formData.get("detail") ?? "").trim();
  const price = Number(formData.get("price") ?? 0) || 0;
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1) || 1);
  const status = formData.get("status") === "achete" ? "achete" : "a_acheter";

  state.items.unshift({
    id: crypto.randomUUID(),
    label,
    detail: detail || null,
    price,
    quantity,
    status,
  });

  await ecrireEtatDemo(state);
  revalidatePath("/demo");
}

export type IngredientALotter = { label: string; detail: string | null; quantity: number };

export async function ajouterArticlesEnLotDemo(items: IngredientALotter[]): Promise<void> {
  const cookieStore = await cookies();
  const state = lireEtatDemo(cookieStore);

  for (const item of items) {
    const estimation = estimerPrix(item.label);
    state.items.unshift({
      id: crypto.randomUUID(),
      label: item.label,
      detail: item.detail,
      price: estimation?.prix ?? 0,
      prixSource: estimation?.source ?? null,
      quantity: item.quantity,
      status: "a_acheter",
    });
  }

  await ecrireEtatDemo(state);
  revalidatePath("/demo");
}

export async function basculerStatutArticleDemo(formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  const state = lireEtatDemo(cookieStore);
  const id = String(formData.get("id") ?? "");
  const nouveauStatut = formData.get("status") === "achete" ? "achete" : "a_acheter";

  state.items = state.items.map((item) =>
    item.id === id ? { ...item, status: nouveauStatut } : item,
  );

  await ecrireEtatDemo(state);
  revalidatePath("/demo");
}

export async function supprimerArticleDemo(formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  const state = lireEtatDemo(cookieStore);
  const id = String(formData.get("id") ?? "");

  state.items = state.items.filter((item) => item.id !== id);

  await ecrireEtatDemo(state);
  revalidatePath("/demo");
}

export async function definirBudgetDemo(formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  const state = lireEtatDemo(cookieStore);
  const budgetAmount = Number(formData.get("budgetAmount"));

  if (Number.isFinite(budgetAmount) && budgetAmount >= 0) {
    state.budgetAmount = budgetAmount;
    await ecrireEtatDemo(state);
    revalidatePath("/demo");
  }
}

export async function reinitialiserDemo(): Promise<void> {
  await ecrireEtatDemo(etatDemoParDefaut());
  revalidatePath("/demo");
}
