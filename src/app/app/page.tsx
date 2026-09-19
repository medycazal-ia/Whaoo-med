import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";
import {
  ajouterArticle,
  ajouterArticlesEnLot,
  basculerStatutArticle,
  contribuerPrixDepuisTicket,
  definirBudgetMensuel,
  recupererIndexCommunautaire,
  supprimerArticle,
  supprimerListeNommee,
} from "@/lib/courses/actions";
import { premierJourDuMois } from "@/lib/courses/rythme";
import { CoursesDashboard } from "@/components/courses-dashboard";
import { avatarSrc } from "@/lib/avatars";

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

  const moisISO = premierJourDuMois().toISOString().slice(0, 10);
  const { data: profile } = await supabase
    .from("profiles")
    .select("prenom, avatar_id")
    .eq("id", user.id)
    .single();

  const { data: periode } = await supabase
    .from("budget_periods")
    .select("id, budget_amount")
    .eq("user_id", user.id)
    .eq("month", moisISO)
    .maybeSingle();

  // La liste "à acheter" est un pense-bête permanent (pas lié à un mois) ;
  // seuls les achats du mois en cours comptent dans le budget affiché.
  const [{ data: itemsAAcheter }, { data: itemsAchetesCeMois }] = await Promise.all([
    supabase
      .from("items")
      .select("id, label, detail, price, quantity, status, prix_source, liste_nom")
      .eq("user_id", user.id)
      .eq("status", "a_acheter")
      .order("created_at", { ascending: false }),
    periode
      ? supabase
          .from("items")
          .select("id, label, detail, price, quantity, status, prix_source, liste_nom")
          .eq("user_id", user.id)
          .eq("status", "achete")
          .eq("achat_mois", moisISO)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as never[] }),
  ]);

  const items = [...(itemsAAcheter ?? []), ...(itemsAchetesCeMois ?? [])].map(
    (item) => ({ ...item, prixSource: item.prix_source, listeNom: item.liste_nom }),
  );
  const indexCommunautaire = await recupererIndexCommunautaire();

  return (
    <main className="flex flex-1 flex-col bg-craie">
      <header className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-kaki to-basilic px-3 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Image
            src={avatarSrc(profile?.avatar_id)}
            alt=""
            width={36}
            height={36}
            className="h-8 w-8 shrink-0 rounded-full sm:h-9 sm:w-9"
          />
          <h1 className="truncate font-heading text-base font-semibold text-craie sm:text-xl">
            Bonjour {profile?.prenom ?? ""}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="/app/parrainage"
            title="Parrainage"
            className="rounded-lg border border-craie/30 px-2 py-1.5 text-xs text-craie hover:bg-craie/10 sm:px-3 sm:text-sm"
          >
            <span aria-hidden className="sm:hidden">🎁</span>
            <span className="hidden sm:inline">Parrainage</span>
          </Link>
          <Link
            href="/app/parametres"
            title="Paramètres"
            className="rounded-lg border border-craie/30 px-2 py-1.5 text-xs text-craie hover:bg-craie/10 sm:px-3 sm:text-sm"
          >
            <span aria-hidden className="sm:hidden">⚙️</span>
            <span className="hidden sm:inline">Paramètres</span>
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              title="Se déconnecter"
              className="rounded-lg border border-craie/30 px-2 py-1.5 text-xs text-craie hover:bg-craie/10 sm:px-3 sm:text-sm"
            >
              <span aria-hidden className="sm:hidden">🚪</span>
              <span className="hidden sm:inline">Se déconnecter</span>
            </button>
          </form>
        </div>
      </header>

      {!periode ? (
        <section className="mx-auto mt-8 w-full max-w-sm md:max-w-md rounded-2xl bg-white p-6 shadow">
          <h2 className="font-heading text-lg font-semibold text-ardoise">
            Nouveau mois, quel budget ?
          </h2>
          <p className="mt-1 text-sm text-ardoise/70">
            Le mois précédent reste consultable dans ton historique — indique
            ton budget pour démarrer celui-ci.
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
          }}
          pdfHref="/app/export-pdf"
          listePdfHref="/app/export-liste-pdf"
          indexCommunautaire={indexCommunautaire}
          proposerPartagePrix
        />
      )}
    </main>
  );
}
