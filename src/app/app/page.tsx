import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccueilVocal } from "@/components/accueil-vocal";
import { BoutonDeconnexion } from "@/components/bouton-deconnexion";
import {
  ajouterArticle,
  ajouterArticleAvecRetour,
  ajouterArticlesAchetesDepuisTicket,
  ajouterArticlesEnLot,
  basculerStatutArticle,
  contribuerPrixDepuisTicket,
  definirBudgetMensuel,
  marquerSessionAchetee,
  modifierArticle,
  recupererIndexCommunautaire,
  supprimerArticle,
  supprimerListeNommee,
  supprimerSessionAAcheter,
} from "@/lib/courses/actions";
import { debutPeriode, dateISO, libellePeriode, normaliserJourDebut } from "@/lib/courses/rythme";
import { calculerSessionActive } from "@/lib/courses/session";
import { CoursesDashboard } from "@/components/courses-dashboard";
import { avatarSrc } from "@/lib/avatars";
import { estAdmin } from "@/lib/admin";
import { SoutienVideo } from "@/components/soutien-video";

export default async function AppHomePage({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string }>;
}) {
  const { vue } = await searchParams;
  const vueActive = vue === "achete" ? "achete" : "a_acheter";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("prenom, avatar_id, jour_debut_periode")
    .eq("id", user.id)
    .single();

  // Période de budget en cours, selon le jour de début choisi par
  // l'utilisateur (1er du mois par défaut) — voir Paramètres.
  const debut = debutPeriode(new Date(), normaliserJourDebut(profile?.jour_debut_periode));
  const moisISO = dateISO(debut);

  const { data: periode } = await supabase
    .from("budget_periods")
    .select("id, budget_amount")
    .eq("user_id", user.id)
    .eq("month", moisISO)
    .maybeSingle();

  // La liste "à acheter" est un pense-bête permanent (pas lié à une
  // période) ; seuls les achats de la période en cours comptent dans le
  // budget affiché.
  const [{ data: itemsAAcheter }, { data: itemsAchetesCeMois }] = await Promise.all([
    supabase
      .from("items")
      .select("id, label, detail, price, quantity, status, prix_source, liste_nom, session_courses, created_at, achete_le")
      .eq("user_id", user.id)
      .eq("status", "a_acheter")
      .order("created_at", { ascending: false }),
    periode
      ? supabase
          .from("items")
          .select("id, label, detail, price, quantity, status, prix_source, liste_nom, session_courses, created_at, achete_le")
          .eq("user_id", user.id)
          .eq("status", "achete")
          .eq("achat_mois", moisISO)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as never[] }),
  ]);

  const items = [...(itemsAAcheter ?? []), ...(itemsAchetesCeMois ?? [])].map(
    (item) => ({
      ...item,
      prixSource: item.prix_source,
      listeNom: item.liste_nom,
      sessionCourses: item.session_courses,
      createdAt: item.created_at,
      acheteLe: item.achete_le,
    }),
  );
  const indexCommunautaire = await recupererIndexCommunautaire();

  // "Budget immédiat" : reprend la session utilisée pour le dernier achat
  // d'aujourd'hui (pour continuer le même passage en caisse), ou en
  // propose une nouvelle par défaut sinon.
  const { sessionActive, sessionsAujourdHui } = calculerSessionActive(
    (itemsAchetesCeMois ?? []).map((item) => ({
      sessionCourses: item.session_courses,
      // Date réelle d'achat (création de la ligne pour les anciens achats).
      createdAt: item.achete_le ?? item.created_at,
    })),
  );

  const stripeUrl = process.env.STRIPE_SUPPORT_LINK_URL || null;

  return (
    <main className="flex flex-1 flex-col fond-marche">
      {stripeUrl && (
        <div className="flex justify-end bg-gradient-to-r from-menthe to-rose">
          <SoutienVideo stripeUrl={stripeUrl} variante="coin" />
        </div>
      )}
      <header className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-menthe to-rose px-3 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Image
            src={avatarSrc(profile?.avatar_id)}
            alt=""
            width={36}
            height={36}
            className="h-8 w-8 shrink-0 rounded-full sm:h-9 sm:w-9"
          />
          <h1 className="truncate font-heading text-base font-semibold text-ardoise sm:text-xl">
            Bonjour {profile?.prenom ?? ""}
          </h1>
          <AccueilVocal prenom={profile?.prenom ?? ""} />
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {estAdmin(user.email) && (
            <Link
              href="/app/admin"
              title="Back-office"
              className="rounded-lg border border-ardoise/20 px-2 py-1.5 text-xs text-ardoise hover:bg-ardoise/5 sm:px-3 sm:text-sm"
            >
              <span aria-hidden className="sm:hidden">🛠️</span>
              <span className="hidden sm:inline">Back-office</span>
            </Link>
          )}
          <Link
            href="/app/parrainage"
            title="Parrainage"
            className="rounded-lg border border-ardoise/20 px-2 py-1.5 text-xs text-ardoise hover:bg-ardoise/5 sm:px-3 sm:text-sm"
          >
            <span aria-hidden className="sm:hidden">🎁</span>
            <span className="hidden sm:inline">Parrainage</span>
          </Link>
          <Link
            href="/app/parametres"
            title="Paramètres"
            className="rounded-lg border border-ardoise/20 px-2 py-1.5 text-xs text-ardoise hover:bg-ardoise/5 sm:px-3 sm:text-sm"
          >
            <span aria-hidden className="sm:hidden">⚙️</span>
            <span className="hidden sm:inline">Paramètres</span>
          </Link>
          <BoutonDeconnexion
            prenom={profile?.prenom ?? ""}
            className="rounded-lg border border-ardoise/20 px-2 py-1.5 text-xs text-ardoise hover:bg-ardoise/5 sm:px-3 sm:text-sm disabled:opacity-60"
          />
        </div>
      </header>

      {!periode ? (
        <section className="mx-auto mt-8 w-full max-w-sm md:max-w-md rounded-2xl bg-white p-6 shadow">
          <h2 className="font-heading text-lg font-semibold text-ardoise">
            Nouvelle période, quel budget ?
          </h2>
          <p className="mt-1 text-sm text-ardoise/75">
            Indique ton budget pour la période {libellePeriode(debut)}. La
            période précédente reste consultable dans ton historique.
          </p>
          <form action={definirBudgetMensuel} className="mt-4 flex gap-2">
            <input
              type="number"
              name="budgetAmount"
              step="0.01"
              min={0}
              required
              placeholder="Ex. 350"
              className="flex-1 rounded-lg border border-ardoise/20 px-3 py-2 text-ardoise"
            />
            <button
              type="submit"
              className="rounded-lg bg-ardoise px-4 py-2 font-medium text-craie hover:bg-ardoise-light"
            >
              Valider
            </button>
          </form>
        </section>
      ) : (
        <CoursesDashboard
          baseHref="/app"
          budgetAmount={periode.budget_amount}
          debutPeriode={moisISO}
          items={items}
          vueActive={vueActive}
          actions={{
            ajouterArticle,
            basculerStatutArticle,
            supprimerArticle,
            supprimerListeNommee,
            definirBudget: definirBudgetMensuel,
            ajouterArticlesEnLot,
            contribuerPrixTicket: contribuerPrixDepuisTicket,
            ajouterArticlesAcheteesTicket: ajouterArticlesAchetesDepuisTicket,
            ajouterArticleAvecRetour,
            modifierArticle,
            marquerSessionAchetee,
            supprimerSessionAAcheter,
          }}
          pdfHref="/app/export-pdf"
          listePdfHref="/app/export-liste-pdf"
          indexCommunautaire={indexCommunautaire}
          proposerPartagePrix
          sessionActive={sessionActive}
          sessionsAujourdHui={sessionsAujourdHui}
        />
      )}

      {stripeUrl && (
        <div className="flex flex-col items-center gap-2 px-4 pb-10 pt-4 text-center">
          <SoutienVideo stripeUrl={stripeUrl} variante="bouton" />
          <p className="text-xs text-ardoise/75">
            Entièrement facultatif — whaoo reste gratuite.
          </p>
        </div>
      )}
    </main>
  );
}
