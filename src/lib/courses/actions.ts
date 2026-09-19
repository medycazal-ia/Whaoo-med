"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { premierJourDuMois } from "@/lib/courses/rythme";
import { estimerPrix, normaliserLabel, type IndexCommunautaire, type SourcePrix } from "@/lib/prix-estimes";

function lireSourcePrix(formData: FormData): SourcePrix {
  const valeur = formData.get("prixSource");
  return valeur === "communaute" || valeur === "statique" ? valeur : "manuel";
}

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
  const partagerPrix = formData.get("partagerPrix") === "on";
  const enseigne = String(formData.get("enseigne") ?? "").trim();
  const prixSource = lireSourcePrix(formData);

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
    prix_source: prixSource,
  });

  // Contribution communautaire de prix (section "prix estimés", inspirée
  // de Kiprix) : uniquement si l'utilisateur l'a explicitement choisi et
  // qu'il s'agit d'un prix réellement payé.
  if (partagerPrix && price > 0) {
    await supabase.from("prix_communautaires").insert({
      user_id: user.id,
      label_normalise: normaliserLabel(label),
      enseigne: enseigne || null,
      price,
    });
  }

  revalidatePath("/app");
}

export async function recupererIndexCommunautaire(): Promise<IndexCommunautaire> {
  const { supabase } = await requireUser();
  const { data } = await supabase.rpc("prix_communautaires_stats");

  const index: IndexCommunautaire = {};
  for (const ligne of data ?? []) {
    index[ligne.label_normalise] = ligne.prix_moyen;
  }
  return index;
}

export type IngredientALotter = { label: string; detail: string | null; quantity: number };

// Ajout en lot depuis une liste d'ingrédients collée (ex. recette) —
// appelé directement depuis un composant client, pas via un <form>.
// Chaque ingrédient reçoit une estimation de prix automatique (communauté
// puis table statique), comme pour un ajout manuel ou vocal — le prix ne
// doit pas être proposé seulement quand l'utilisateur tape lui-même.
export async function ajouterArticlesEnLot(
  items: IngredientALotter[],
  listeNom: string | null = null,
): Promise<void> {
  const { supabase, user } = await requireUser();
  if (items.length === 0) return;

  const indexCommunautaire = await recupererIndexCommunautaire();

  await supabase.from("items").insert(
    items.map((item) => {
      const estimation = estimerPrix(item.label, indexCommunautaire);
      return {
        user_id: user.id,
        label: item.label,
        detail: item.detail,
        price: estimation?.prix ?? 0,
        prix_source: estimation?.source ?? null,
        quantity: item.quantity,
        status: "a_acheter" as const,
        achat_mois: null,
        liste_nom: listeNom,
      };
    }),
  );

  revalidatePath("/app");
}

export type LigneTicketAContribuer = { label: string; price: number };

// Contribution en lot de prix repérés sur un ticket de caisse scanné
// (OCR côté navigateur, jamais envoyé à un serveur tiers). Alimente
// uniquement l'index communautaire, ne touche pas la liste de courses de
// l'utilisateur.
export async function contribuerPrixDepuisTicket(
  lignes: LigneTicketAContribuer[],
): Promise<void> {
  const { supabase, user } = await requireUser();
  if (lignes.length === 0) return;

  await supabase.from("prix_communautaires").insert(
    lignes.map((ligne) => ({
      user_id: user.id,
      label_normalise: normaliserLabel(ligne.label),
      enseigne: null,
      price: ligne.price,
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

// Efface en bloc tous les articles "à acheter" d'une liste nommée (ex. une
// recette ou un régime importé) — ne touche jamais les articles déjà achetés.
export async function supprimerListeNommee(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const listeNom = String(formData.get("listeNom") ?? "");
  if (!listeNom) return;

  await supabase
    .from("items")
    .delete()
    .eq("user_id", user.id)
    .eq("status", "a_acheter")
    .eq("liste_nom", listeNom);

  revalidatePath("/app");
}
