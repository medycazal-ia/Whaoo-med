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
import { nomListeParDefaut } from "@/lib/courses/listes";

function lireSessionCoursesDemo(formData: FormData): string | null {
  const valeur = String(formData.get("sessionCourses") ?? "").trim();
  return valeur || null;
}

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
  const sessionCourses = lireSessionCoursesDemo(formData);

  state.items.unshift({
    id: crypto.randomUUID(),
    label,
    detail: detail || null,
    price,
    quantity,
    status,
    sessionCourses,
    createdAt: new Date().toISOString(),
    acheteLe: status === "achete" ? new Date().toISOString() : null,
  });

  await ecrireEtatDemo(state);
  revalidatePath("/demo");
}

// Variante démo qui renvoie l'id créé — voir ajouterArticleAvecRetour
// dans lib/courses/actions.ts (dictée vocale en écoute continue).
export async function ajouterArticleAvecRetourDemo(formData: FormData): Promise<string | null> {
  const cookieStore = await cookies();
  const state = lireEtatDemo(cookieStore);

  const label = String(formData.get("label") ?? "").trim();
  if (!label) return null;

  const detail = String(formData.get("detail") ?? "").trim();
  const price = Number(formData.get("price") ?? 0) || 0;
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1) || 1);
  const status = formData.get("status") === "achete" ? "achete" : "a_acheter";
  const sessionCourses = lireSessionCoursesDemo(formData);
  const id = crypto.randomUUID();

  state.items.unshift({
    id,
    label,
    detail: detail || null,
    price,
    quantity,
    status,
    sessionCourses,
    createdAt: new Date().toISOString(),
    acheteLe: status === "achete" ? new Date().toISOString() : null,
  });

  await ecrireEtatDemo(state);
  revalidatePath("/demo");
  return id;
}

export type IngredientALotter = { label: string; detail: string | null; quantity: number };

export async function ajouterArticlesEnLotDemo(
  items: IngredientALotter[],
  listeNom: string | null = null,
): Promise<void> {
  const cookieStore = await cookies();
  const state = lireEtatDemo(cookieStore);

  // Toujours nommée (voir ajouterArticlesEnLot dans lib/courses/actions.ts)
  // et un horodatage commun à tout l'appel, pour permettre de sous-grouper
  // par ajout si la même liste reçoit plusieurs imports le même jour.
  const nom = listeNom?.trim() || nomListeParDefaut();
  const createdAt = new Date().toISOString();

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
      listeNom: nom,
      createdAt,
    });
  }

  await ecrireEtatDemo(state);
  revalidatePath("/demo");
}

export async function modifierArticleDemo(formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  const state = lireEtatDemo(cookieStore);
  const id = String(formData.get("id") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  if (!id || !label) return;

  const detail = String(formData.get("detail") ?? "").trim();
  const price = Number(formData.get("price") ?? 0) || 0;
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1) || 1);

  state.items = state.items.map((item) =>
    item.id === id ? { ...item, label, detail: detail || null, price, quantity } : item,
  );

  await ecrireEtatDemo(state);
  revalidatePath("/demo");
}

export async function basculerStatutArticleDemo(formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  const state = lireEtatDemo(cookieStore);
  const id = String(formData.get("id") ?? "");
  const nouveauStatut = formData.get("status") === "achete" ? "achete" : "a_acheter";

  // Comme dans l'appli : un article remis "à acheter" garde sa session.
  state.items = state.items.map((item) =>
    item.id !== id
      ? item
      : nouveauStatut === "achete"
        ? {
            ...item,
            status: nouveauStatut,
            sessionCourses: lireSessionCoursesDemo(formData),
            acheteLe: new Date().toISOString(),
          }
        : { ...item, status: nouveauStatut, acheteLe: null },
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

export async function supprimerListeNommeeDemo(formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  const state = lireEtatDemo(cookieStore);
  const listeNom = String(formData.get("listeNom") ?? "");
  if (!listeNom) return;

  state.items = state.items.filter(
    (item) => !(item.status === "a_acheter" && item.listeNom === listeNom),
  );

  await ecrireEtatDemo(state);
  revalidatePath("/demo");
}

export async function marquerSessionAcheteeDemo(formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  const state = lireEtatDemo(cookieStore);
  const session = lireSessionCoursesDemo(formData);
  if (!session) return;

  const maintenant = new Date().toISOString();
  state.items = state.items.map((item) =>
    item.status === "a_acheter" && item.sessionCourses === session
      ? { ...item, status: "achete", acheteLe: maintenant }
      : item,
  );

  await ecrireEtatDemo(state);
  revalidatePath("/demo");
}

export async function supprimerSessionAAcheterDemo(formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  const state = lireEtatDemo(cookieStore);
  const session = lireSessionCoursesDemo(formData);
  if (!session) return;

  state.items = state.items.filter(
    (item) => !(item.status === "a_acheter" && item.sessionCourses === session),
  );

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
