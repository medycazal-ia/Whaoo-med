import type { ReactNode } from "react";
import Link from "next/link";
import { calculerRythme, premierJourDuMois } from "@/lib/courses/rythme";
import { SaisieVocale } from "@/components/saisie-vocale";

export type ArticleCourse = {
  id: string;
  label: string;
  price: number;
  quantity: number;
  status: "achete" | "a_acheter";
};

type CoursesActions = {
  ajouterArticle: (formData: FormData) => Promise<void>;
  basculerStatutArticle: (formData: FormData) => Promise<void>;
  supprimerArticle: (formData: FormData) => Promise<void>;
};

const STATUT_STYLES: Record<string, string> = {
  serein: "bg-basilic/15 text-basilic",
  vigilant: "bg-ambre/15 text-ambre",
  attention: "bg-tomate/15 text-tomate",
};

const STATUT_LABELS: Record<string, string> = {
  serein: "Serein, tu tiens le rythme",
  vigilant: "Vigilant, ça se resserre",
  attention: "Attention, tu dépenses trop vite",
};

export function CoursesDashboard({
  baseHref,
  budgetAmount,
  items,
  vueActive,
  actions,
  banner,
  footer,
}: {
  baseHref: string;
  budgetAmount: number;
  items: ArticleCourse[];
  vueActive: "achete" | "a_acheter";
  actions: CoursesActions;
  banner?: ReactNode;
  footer?: ReactNode;
}) {
  const totalDepense = items
    .filter((item) => item.status === "achete")
    .reduce((total, item) => total + item.price * item.quantity, 0);

  const rythme = calculerRythme({
    budgetAmount,
    totalDepense,
    mois: premierJourDuMois(),
  });

  const itemsAffiches = items.filter((item) => item.status === vueActive);

  return (
    <>
      {banner}

      <section className="bg-ardoise px-6 pb-6">
        <div className="mx-auto flex max-w-lg flex-col gap-3 rounded-2xl bg-ardoise-light p-5">
          <div className="flex items-baseline justify-between font-mono text-craie">
            <span className="text-2xl font-semibold">
              {totalDepense.toFixed(2)} €
            </span>
            <span className="text-sm text-craie/60">
              / {budgetAmount.toFixed(2)} € ce mois-ci
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-craie/20">
            <div
              className="h-full rounded-full bg-basilic"
              style={{
                width: `${Math.min(100, (totalDepense / Math.max(budgetAmount, 1)) * 100)}%`,
              }}
            />
          </div>
          <span
            className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${STATUT_STYLES[rythme.statut]}`}
          >
            {STATUT_LABELS[rythme.statut]}
          </span>
          {rythme.cagnotte > 0 && (
            <p className="text-sm text-craie/80">
              Cagnotte du mois : <strong>{rythme.cagnotte.toFixed(2)} €</strong>
              {rythme.palierAtteint && (
                <> — de quoi te faire plaisir : {rythme.palierAtteint.label} 🎉</>
              )}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-6 py-6">
        <SaisieVocale ajouterArticleAction={actions.ajouterArticle} />

        <form
          action={actions.ajouterArticle}
          className="flex flex-wrap gap-2 rounded-xl border border-ardoise/10 bg-white p-4"
        >
          <input
            name="label"
            placeholder="Article"
            required
            className="flex-1 rounded-lg border border-ardoise/20 px-3 py-2 text-ardoise"
          />
          <input
            name="price"
            type="number"
            step="0.01"
            min={0}
            placeholder="Prix"
            className="w-24 rounded-lg border border-ardoise/20 px-3 py-2 text-ardoise"
          />
          <input
            name="quantity"
            type="number"
            min={1}
            defaultValue={1}
            className="w-20 rounded-lg border border-ardoise/20 px-3 py-2 text-ardoise"
          />
          <select
            name="status"
            defaultValue={vueActive}
            className="rounded-lg border border-ardoise/20 px-3 py-2 text-ardoise"
          >
            <option value="a_acheter">À acheter plus tard</option>
            <option value="achete">Déjà acheté</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-ardoise px-4 py-2 font-medium text-craie hover:bg-ardoise-light"
          >
            Ajouter
          </button>
        </form>

        <div className="flex gap-2">
          <Link
            href={`${baseHref}?vue=a_acheter`}
            className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium ${
              vueActive === "a_acheter" ? "bg-ardoise text-craie" : "bg-white text-ardoise"
            }`}
          >
            À acheter
          </Link>
          <Link
            href={`${baseHref}?vue=achete`}
            className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium ${
              vueActive === "achete" ? "bg-ardoise text-craie" : "bg-white text-ardoise"
            }`}
          >
            Acheté
          </Link>
        </div>

        <ul className="flex flex-col gap-2">
          {itemsAffiches.length === 0 && (
            <p className="rounded-lg bg-white p-4 text-center text-sm text-ardoise/60">
              Rien ici pour l&apos;instant.
            </p>
          )}
          {itemsAffiches.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-white p-3"
            >
              <div>
                <p className="text-ardoise">
                  {item.quantity > 1 ? `${item.quantity} × ` : ""}
                  {item.label}
                </p>
                <p className="font-mono text-sm text-ardoise/60">
                  {(item.price * item.quantity).toFixed(2)} €
                </p>
              </div>
              <div className="flex gap-1">
                <form action={actions.basculerStatutArticle}>
                  <input type="hidden" name="id" value={item.id} />
                  <input
                    type="hidden"
                    name="status"
                    value={item.status === "achete" ? "a_acheter" : "achete"}
                  />
                  <button
                    type="submit"
                    className="rounded-lg border border-basilic/40 px-2 py-1 text-xs text-basilic"
                  >
                    {item.status === "achete" ? "Remettre en attente" : "Marquer acheté"}
                  </button>
                </form>
                <form action={actions.supprimerArticle}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-tomate/40 px-2 py-1 text-xs text-tomate"
                  >
                    Supprimer
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {footer}
    </>
  );
}
