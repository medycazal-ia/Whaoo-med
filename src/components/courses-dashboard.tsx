"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { calculerRythme, premierJourDuMois } from "@/lib/courses/rythme";
import { SaisieVocale } from "@/components/saisie-vocale";
import { ChampsArticlePrix } from "@/components/champs-article-prix";
import { AjouterDepuisRecette } from "@/components/ajouter-depuis-recette";
import { AideVocale } from "@/components/aide-vocale";
import { BudgetFlottant } from "@/components/budget-flottant";
import { FaqPanel } from "@/components/faq-panel";
import { ScannerTicket } from "@/components/scanner-ticket";
import { PromotionsLocales } from "@/components/promotions-locales";
import type { IngredientParse } from "@/lib/courses/parse-recette";
import { LABEL_SOURCE_PRIX, type IndexCommunautaire, type SourcePrix } from "@/lib/prix-estimes";

export type ArticleCourse = {
  id: string;
  label: string;
  detail?: string | null;
  price: number;
  quantity: number;
  status: "achete" | "a_acheter";
  prixSource?: SourcePrix | null;
};

type CoursesActions = {
  ajouterArticle: (formData: FormData) => Promise<void>;
  basculerStatutArticle: (formData: FormData) => Promise<void>;
  supprimerArticle: (formData: FormData) => Promise<void>;
  definirBudget: (formData: FormData) => Promise<void>;
  ajouterArticlesEnLot: (items: IngredientParse[]) => Promise<void>;
  contribuerPrixTicket?: (lignes: { label: string; price: number }[]) => Promise<void>;
};

const STATUT_STYLES: Record<string, string> = {
  serein: "bg-basilic/15 text-basilic",
  vigilant: "bg-ambre/15 text-ambre",
  attention: "bg-tomate/15 text-tomate",
};

export function CoursesDashboard({
  baseHref,
  budgetAmount,
  items,
  vueActive,
  actions,
  banner,
  footer,
  pdfHref,
  listePdfHref,
  indexCommunautaire,
  proposerPartagePrix = false,
}: {
  baseHref: string;
  budgetAmount: number;
  items: ArticleCourse[];
  vueActive: "achete" | "a_acheter";
  actions: CoursesActions;
  banner?: ReactNode;
  pdfHref?: string;
  listePdfHref?: string;
  footer?: ReactNode;
  indexCommunautaire?: IndexCommunautaire;
  proposerPartagePrix?: boolean;
}) {
  const [aideOuverte, setAideOuverte] = useState(false);

  const totalDepense = items
    .filter((item) => item.status === "achete")
    .reduce((total, item) => total + item.price * item.quantity, 0);

  const rythme = calculerRythme({
    budgetAmount,
    totalDepense,
    mois: premierJourDuMois(),
  });

  const itemsAffiches = items.filter((item) => item.status === vueActive);
  const itemsEnAttente = items.filter((item) => item.status === "a_acheter");

  return (
    <>
      {banner}

      <BudgetFlottant totalDepense={totalDepense} budgetAmount={budgetAmount} />

      <section className="px-4 sm:px-6 pt-6 pb-6">
        <div className="mx-auto flex max-w-lg md:max-w-2xl lg:max-w-4xl flex-col gap-3 rounded-2xl bg-ardoise p-5">
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
            {rythme.statutLabel}
          </span>
          <p className="text-sm text-craie/80">
            🐷 Cagnotte estimée : <strong>{rythme.cagnotte.toFixed(2)} €</strong>
          </p>
          <p className="text-xs text-craie/60">{rythme.conseilCagnotte}</p>
        </div>
      </section>

      {itemsEnAttente.length > 0 && (
        <section className="mx-auto w-full max-w-lg md:max-w-2xl lg:max-w-4xl px-4 sm:px-6 pt-6">
          <div className="rounded-xl border border-ambre bg-ambre/15 p-4">
            <p className="font-heading text-sm font-semibold text-ardoise">
              🔔 À ne pas oublier
            </p>
            <ul className="mt-2 flex flex-col divide-y divide-ardoise/10">
              {itemsEnAttente.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2 py-2 text-sm text-ardoise">
                  <span>
                    {item.label}
                    {item.detail ? ` (${item.detail})` : ""}
                  </span>
                  <form action={actions.basculerStatutArticle}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value="achete" />
                    <button type="submit" className="rounded-lg bg-basilic px-2 py-1 text-xs font-medium text-craie">
                      Acheté ✓
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="mx-auto flex w-full max-w-lg md:max-w-2xl lg:max-w-4xl flex-1 flex-col gap-4 px-4 sm:px-6 py-6">
        <SaisieVocale
          ajouterArticleAction={actions.ajouterArticle}
          definirBudgetAction={actions.definirBudget}
          indexCommunautaire={indexCommunautaire}
          proposerPartage={proposerPartagePrix}
          onAide={() => setAideOuverte(true)}
        />
        <AideVocale />
        {aideOuverte && <FaqPanel onFermer={() => setAideOuverte(false)} />}

        <form
          action={actions.ajouterArticle}
          className="flex flex-wrap gap-2 rounded-xl border border-ardoise/10 bg-white p-4"
        >
          <ChampsArticlePrix
            defaultStatus={vueActive}
            indexCommunautaire={indexCommunautaire}
            proposerPartage={proposerPartagePrix}
          />
          <button
            type="submit"
            className="rounded-lg bg-ardoise px-4 py-2 font-medium text-craie hover:bg-ardoise-light"
          >
            Ajouter
          </button>
        </form>

        <AjouterDepuisRecette
          ajouterEnLotAction={actions.ajouterArticlesEnLot}
          indexCommunautaire={indexCommunautaire}
        />

        {actions.contribuerPrixTicket && (
          <ScannerTicket contribuerAction={actions.contribuerPrixTicket} />
        )}

        <PromotionsLocales />

        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {pdfHref && (
            <a href={pdfHref} className="text-sm text-ardoise/60 underline">
              🖨️ Facture PDF du mois
            </a>
          )}
          {listePdfHref && (
            <a href={listePdfHref} className="text-sm text-ardoise/60 underline">
              🖨️ Liste de courses PDF
            </a>
          )}
        </div>

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

        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          {itemsAffiches.length === 0 && (
            <p className="col-span-full rounded-lg bg-white p-4 text-center text-sm text-ardoise/60">
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
                <p className="text-xs text-ardoise/50">{item.detail}</p>
                <p className="font-mono text-sm text-ardoise/60">
                  {(item.price * item.quantity).toFixed(2)} €
                  {item.prixSource && item.prixSource !== "manuel" && (
                    <span className="ml-2 rounded-full bg-basilic/10 px-2 py-0.5 font-sans text-[11px] font-medium text-basilic">
                      {LABEL_SOURCE_PRIX[item.prixSource]}
                    </span>
                  )}
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
