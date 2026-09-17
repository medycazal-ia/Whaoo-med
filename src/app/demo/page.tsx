import Link from "next/link";
import { cookies } from "next/headers";
import {
  ajouterArticleDemo,
  basculerStatutArticleDemo,
  definirBudgetDemo,
  reinitialiserDemo,
  supprimerArticleDemo,
} from "@/lib/demo/actions";
import { historiqueDemo, lireEtatDemo } from "@/lib/demo/state";
import { CoursesDashboard } from "@/components/courses-dashboard";

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string }>;
}) {
  const { vue } = await searchParams;
  const vueActive = vue === "achete" ? "achete" : "a_acheter";

  const cookieStore = await cookies();
  const state = lireEtatDemo(cookieStore);

  return (
    <main className="flex flex-1 flex-col bg-craie">
      <div className="bg-ambre px-6 py-2 text-center text-sm font-medium text-ardoise">
        Mode démo — tes modifications ne seront pas conservées
      </div>

      <header className="flex flex-wrap items-center justify-between gap-2 bg-ardoise px-6 py-4">
        <h1 className="font-heading text-xl font-semibold text-craie">
          Bienvenue dans la démo
        </h1>
        <div className="flex gap-2">
          <form action={reinitialiserDemo}>
            <button
              type="submit"
              className="rounded-lg border border-craie/30 px-3 py-1.5 text-sm text-craie hover:bg-craie/10"
            >
              Réinitialiser
            </button>
          </form>
          <Link
            href="/inscription"
            className="rounded-lg bg-basilic px-3 py-1.5 text-sm font-medium text-craie hover:opacity-90"
          >
            Créer mon compte
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-lg px-6 pt-4">
        <form action={definirBudgetDemo} className="flex items-center gap-2 text-sm text-ardoise/70">
          Budget du mois :
          <input
            type="number"
            name="budgetAmount"
            step="0.01"
            min={0}
            defaultValue={state.budgetAmount}
            className="w-24 rounded-lg border border-ardoise/20 bg-white px-2 py-1"
          />
          <button type="submit" className="underline">
            Modifier
          </button>
        </form>
      </div>

      <CoursesDashboard
        baseHref="/demo"
        budgetAmount={state.budgetAmount}
        items={state.items}
        vueActive={vueActive}
        actions={{
          ajouterArticle: ajouterArticleDemo,
          basculerStatutArticle: basculerStatutArticleDemo,
          supprimerArticle: supprimerArticleDemo,
        }}
        footer={
          <section className="mx-auto w-full max-w-lg px-6 pb-10">
            <h2 className="font-heading text-lg font-semibold text-ardoise">
              Historique (démo)
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {historiqueDemo().map((mois) => (
                <li
                  key={mois.mois}
                  className="flex items-center justify-between rounded-lg bg-white p-3 text-sm text-ardoise"
                >
                  <span>{mois.mois}</span>
                  <span className="font-mono">
                    {mois.totalDepense.toFixed(2)} € / {mois.budgetAmount.toFixed(2)} €
                  </span>
                </li>
              ))}
            </ul>
          </section>
        }
      />
    </main>
  );
}
