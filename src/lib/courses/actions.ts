"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { debutPeriode, debutPeriodeISO, dateISO, normaliserJourDebut } from "@/lib/courses/rythme";
import { nomListeParDefaut } from "@/lib/courses/listes";
import { estimerPrix, normaliserLabel, type IndexCommunautaire, type SourcePrix } from "@/lib/prix-estimes";

function lireSourcePrix(formData: FormData): SourcePrix {
  const valeur = formData.get("prixSource");
  return valeur === "communaute" || valeur === "statique" ? valeur : "manuel";
}

// "Budget immédiat" : nom de session (ex. "Courses du 20/09"), saisi par
// l'utilisateur (texte ou dictée). Un article "à acheter" ajouté pendant
// une session lui appartient aussi : il apparaît dans le sous-groupe de
// cette date, et la facturette de la session le reprend une fois acheté.
function lireSessionCourses(formData: FormData): string | null {
  const valeur = String(formData.get("sessionCourses") ?? "").trim();
  return valeur || null;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");
  return { supabase, user };
}

type ClientSupabase = Awaited<ReturnType<typeof createClient>>;

async function jourDebutPeriode(supabase: ClientSupabase, userId: string): Promise<number> {
  const { data } = await supabase
    .from("profiles")
    .select("jour_debut_periode")
    .eq("id", userId)
    .maybeSingle();
  return normaliserJourDebut(data?.jour_debut_periode);
}

// Champs d'un achat effectif : date réelle, et premier jour de la période
// de budget qui le contient (achat_mois), selon le jour de début choisi
// par l'utilisateur.
async function champsAchat(supabase: ClientSupabase, userId: string) {
  const maintenant = new Date();
  const jour = await jourDebutPeriode(supabase, userId);
  return { achete_le: maintenant.toISOString(), achat_mois: debutPeriodeISO(maintenant, jour) };
}

const PAS_ACHETE = { achete_le: null, achat_mois: null };

export async function definirBudgetMensuel(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const budgetAmount = Number(formData.get("budgetAmount"));

  if (!Number.isFinite(budgetAmount) || budgetAmount < 0) {
    redirect("/app?error=budget_invalide");
  }

  const jour = await jourDebutPeriode(supabase, user.id);
  await supabase.from("budget_periods").upsert(
    {
      user_id: user.id,
      month: debutPeriodeISO(new Date(), jour),
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
  const sessionCourses = lireSessionCourses(formData);

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
    ...(status === "achete" ? await champsAchat(supabase, user.id) : PAS_ACHETE),
    prix_source: prixSource,
    session_courses: sessionCourses,
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

// Variante qui renvoie l'id de la ligne créée — utilisée par la dictée
// vocale en écoute continue (voir saisie-vocale.tsx), qui ajoute
// automatiquement chaque article reconnu et doit pouvoir le supprimer de
// nouveau si l'utilisateur annule juste après (la reconnaissance vocale
// n'étant jamais fiable à 100 %). ajouterArticle() ci-dessus reste
// utilisée telle quelle par les <form action=...> classiques.
export async function ajouterArticleAvecRetour(formData: FormData): Promise<string | null> {
  const { supabase, user } = await requireUser();

  const label = String(formData.get("label") ?? "").trim();
  const detail = String(formData.get("detail") ?? "").trim();
  const price = Number(formData.get("price") ?? 0) || 0;
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1) || 1);
  const status = formData.get("status") === "achete" ? "achete" : "a_acheter";
  const prixSource = lireSourcePrix(formData);
  const sessionCourses = lireSessionCourses(formData);

  if (!label) return null;

  const { data } = await supabase
    .from("items")
    .insert({
      user_id: user.id,
      label,
      detail: detail || null,
      price,
      quantity,
      status,
      ...(status === "achete" ? await champsAchat(supabase, user.id) : PAS_ACHETE),
      prix_source: prixSource,
      session_courses: sessionCourses,
    })
    .select("id")
    .single();

  revalidatePath("/app");
  return data?.id ?? null;
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
        ...PAS_ACHETE,
        // Toujours nommée : si l'utilisateur ne donne pas de nom, whaoo en
        // propose un daté du jour plutôt que de laisser l'import se
        // perdre parmi les articles sans nom.
        liste_nom: listeNom?.trim() || nomListeParDefaut(),
      };
    }),
  );

  revalidatePath("/app");
}

// Corrige le nom, le détail, la quantité ou le prix d'un article déjà
// ajouté — jamais son statut, sa date d'achat ni sa liste/session
// (gérés par leurs propres actions dédiées).
export async function modifierArticle(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const detail = String(formData.get("detail") ?? "").trim();
  const price = Number(formData.get("price") ?? 0) || 0;
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1) || 1);

  if (!id || !label) return;

  await supabase
    .from("items")
    .update({
      label,
      detail: detail || null,
      price,
      quantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

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

// Ajoute directement les articles d'un ticket scanné au budget du mois de
// l'utilisateur, déjà marqués "achetés" — un ticket de caisse représente
// un achat déjà effectué, pas quelque chose à ajouter à une liste "à
// acheter". Proposé comme option distincte de la contribution à
// l'estimation communautaire (contribuerPrixDepuisTicket), l'utilisateur
// peut choisir l'une, l'autre, ou les deux.
export async function ajouterArticlesAchetesDepuisTicket(
  lignes: LigneTicketAContribuer[],
  sessionCourses: string | null = null,
): Promise<void> {
  const { supabase, user } = await requireUser();
  if (lignes.length === 0) return;

  const achat = await champsAchat(supabase, user.id);
  await supabase.from("items").insert(
    lignes.map((ligne) => ({
      user_id: user.id,
      label: ligne.label,
      detail: null,
      price: ligne.price,
      quantity: 1,
      status: "achete" as const,
      ...achat,
      prix_source: "manuel" as const,
      session_courses: sessionCourses,
    })),
  );

  revalidatePath("/app");
}

export async function basculerStatutArticle(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const nouveauStatut = formData.get("status") === "achete" ? "achete" : "a_acheter";
  // Session envoyée par l'interface : celle de l'article s'il appartient
  // déjà à une date, sinon la session en cours. Un article remis "à
  // acheter" garde sa session, pour retrouver son sous-groupe.
  const sessionCourses = lireSessionCourses(formData);

  await supabase
    .from("items")
    .update({
      status: nouveauStatut,
      ...(nouveauStatut === "achete"
        ? { ...(await champsAchat(supabase, user.id)), session_courses: sessionCourses }
        : PAS_ACHETE),
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

// Jour de début de la période de budget (1 = mois calendaire, 25 = du 25
// au 24). Chaque achat déjà enregistré est reclassé dans la période qui
// le contient selon le nouveau jour, et le budget de la période en cours
// est repris sur la nouvelle période s'il n'y en a pas encore.
export async function definirDebutPeriode(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const nouveauJour = Number(formData.get("jourDebut"));
  if (!Number.isInteger(nouveauJour) || normaliserJourDebut(nouveauJour) !== nouveauJour) {
    redirect("/app/parametres?error=periode");
  }

  const ancienJour = await jourDebutPeriode(supabase, user.id);
  if (ancienJour === nouveauJour) redirect("/app/parametres?ok=periode");

  const { error } = await supabase
    .from("profiles")
    .update({ jour_debut_periode: nouveauJour })
    .eq("id", user.id);
  if (error) redirect("/app/parametres?error=periode");

  const { data: achats } = await supabase
    .from("items")
    .select("id, achete_le")
    .eq("user_id", user.id)
    .eq("status", "achete")
    .not("achete_le", "is", null);

  const parPeriode = new Map<string, string[]>();
  for (const achat of achats ?? []) {
    const periode = dateISO(debutPeriode(new Date(achat.achete_le as string), nouveauJour));
    parPeriode.set(periode, [...(parPeriode.get(periode) ?? []), achat.id]);
  }
  for (const [periode, ids] of parPeriode) {
    for (let i = 0; i < ids.length; i += 200) {
      await supabase
        .from("items")
        .update({ achat_mois: periode })
        .eq("user_id", user.id)
        .in("id", ids.slice(i, i + 200));
    }
  }

  const maintenant = new Date();
  const ancienDebut = debutPeriodeISO(maintenant, ancienJour);
  const nouveauDebut = debutPeriodeISO(maintenant, nouveauJour);
  const { data: budgetActuel } = await supabase
    .from("budget_periods")
    .select("budget_amount")
    .eq("user_id", user.id)
    .eq("month", ancienDebut)
    .maybeSingle();
  if (budgetActuel) {
    const { data: dejaDefini } = await supabase
      .from("budget_periods")
      .select("id")
      .eq("user_id", user.id)
      .eq("month", nouveauDebut)
      .maybeSingle();
    if (!dejaDefini) {
      await supabase.from("budget_periods").insert({
        user_id: user.id,
        month: nouveauDebut,
        budget_amount: budgetActuel.budget_amount,
      });
    }
  }

  revalidatePath("/app");
  redirect("/app/parametres?ok=periode");
}

// Traite d'un coup tous les articles "à acheter" d'une session datée
// (ex. "Courses du 28/09") : ils deviennent la facturette de cette date.
export async function marquerSessionAchetee(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const session = lireSessionCourses(formData);
  if (!session) return;

  await supabase
    .from("items")
    .update({
      status: "achete",
      ...(await champsAchat(supabase, user.id)),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("status", "a_acheter")
    .eq("session_courses", session);

  revalidatePath("/app");
}

// Efface les articles "à acheter" d'une session datée — ne touche jamais
// les articles déjà achetés de cette session (la facturette reste).
export async function supprimerSessionAAcheter(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const session = lireSessionCourses(formData);
  if (!session) return;

  await supabase
    .from("items")
    .delete()
    .eq("user_id", user.id)
    .eq("status", "a_acheter")
    .eq("session_courses", session);

  revalidatePath("/app");
}
