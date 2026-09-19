"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { calculerRythme, premierJourDuMois } from "@/lib/courses/rythme";
import { SaisieVocale } from "@/components/saisie-vocale";
import { ChampsArticlePrix } from "@/components/champs-article-prix";
import { AjouterDepuisDocument } from "@/components/ajouter-depuis-document";
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
  listeNom?: string | null;
};

type CoursesActions = {
  ajouterArticle: (formData: FormData) => Promise<void>;
  basculerStatutArticle: (formData: FormData) => Promise<void>;
  supprimerArticle: (formData: FormData) => Promise<void>;
  supprimerListeNommee: (formData: FormData) => Promise<void>;
  definirBudget: (formData: FormData) => Promise<void>;
  ajouterArticlesEnLot: (items: IngredientParse[], listeNom: string | null) => Promise<void>;
  contribuerPrixTicket?: (lignes: { label: string; price: number }[]) => Promise<void>;
};

// Pastilles pensées pour la carte budget au fond sombre (dégradé
// kaki→ardoise) : un fond clair opaque garantit le contraste, quelle que
// soit la couleur de statut.
const STATUT_STYLES: Record<string, string> = {
  serein: "bg-craie text-basilic",
  vigilant: "bg-craie text-ambre",
  attention: "bg-craie text-tomate",
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
  // Repliées par défaut à l'ouverture : un seul bouton "Voir mes listes"
  // les révèle toutes d'un coup, mis en valeur tant qu'elles sont cachées.
  const [listesVisibles, setListesVisibles] = useState(false);

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

  // Regroupe les articles en attente par nom de liste (ex. une recette ou un
  // régime importé) — les articles sans nom restent affichés à part, sans
  // en-tête ni suppression groupée puisqu'il n'y a rien à nommer.
  const itemsSansNom = itemsEnAttente.filter((item) => !item.listeNom);
  const groupesNommes = Array.from(
    itemsEnAttente.reduce((groupes, item) => {
      if (!item.listeNom) return groupes;
      const liste = groupes.get(item.listeNom) ?? [];
      liste.push(item);
      groupes.set(item.listeNom, liste);
      return groupes;
    }, new Map<string, ArticleCourse[]>()),
  );

  function ligneAttente(item: ArticleCourse) {
    return (
      <li key={item.id} className="flex items-center justify-between gap-2 py-2 text-sm text-ardoise">
        <span>
          {item.label}
          {item.detail ? ` (${item.detail})` : ""}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <form action={actions.basculerStatutArticle}>
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="status" value="achete" />
            <button type="submit" className="rounded-lg bg-basilic px-2 py-1 text-xs font-medium text-craie">
              Acheté ✓
            </button>
          </form>
          <form action={actions.supprimerArticle}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              aria-label="Supprimer cet article"
              className="rounded-lg border border-tomate/40 px-2 py-1 text-xs text-tomate"
            >
              ✕
            </button>
          </form>
        </div>
      </li>
    );
  }

  return (
    <>
      {banner}

      <BudgetFlottant totalDepense={totalDepense} budgetAmount={budgetAmount} />

      <section className="px-4 sm:px-6 pt-6 pb-6">
        <div className="mx-auto flex max-w-lg md:max-w-2xl lg:max-w-4xl flex-col gap-3 rounded-2xl bg-gradient-to-br from-kaki to-ardoise p-5 shadow-lg">
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

      <section className="mx-auto flex w-full max-w-lg md:max-w-2xl lg:max-w-4xl flex-col gap-4 px-4 sm:px-6 pt-6">
        <SaisieVocale
          ajouterArticleAction={actions.ajouterArticle}
          definirBudgetAction={actions.definirBudget}
          indexCommunautaire={indexCommunautaire}
          proposerPartage={proposerPartagePrix}
          onAide={() => setAideOuverte(true)}
        />
        <AideVocale />
        {aideOuverte && <FaqPanel onFermer={() => setAideOuverte(false)} />}
      </section>

      {itemsEnAttente.length > 0 && (
        <section className="mx-auto w-full max-w-lg md:max-w-2xl lg:max-w-4xl px-4 sm:px-6 pt-6">
          <div className="rounded-xl border border-ambre bg-ambre/15 p-4">
            <p className="font-heading text-sm font-semibold text-ardoise">
              🔔 À ne pas oublier
            </p>

            {itemsSansNom.length > 0 && (
              <ul className="mt-2 flex flex-col divide-y divide-ardoise/10">
                {itemsSansNom.map((item) => ligneAttente(item))}
              </ul>
            )}

            {groupesNommes.length > 0 && (
              <button
                type="button"
                onClick={() => setListesVisibles((v) => !v)}
                className={
                  listesVisibles
                    ? "mt-3 text-xs text-ardoise/60 underline"
                    : "mt-3 w-full rounded-lg bg-ambre px-3 py-2 text-sm font-semibold text-ardoise shadow hover:opacity-90"
                }
              >
                {listesVisibles
                  ? "Masquer mes listes"
                  : `👀 Voir mes listes (${groupesNommes.length})`}
              </button>
            )}

            {listesVisibles &&
              groupesNommes.map(([nom, itemsDuGroupe]) => (
                <div key={nom} className="mt-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-ambre">📋 {nom}</p>
                    <form action={actions.supprimerListeNommee}>
                      <input type="hidden" name="listeNom" value={nom} />
                      <button type="submit" className="text-xs text-tomate underline">
                        Supprimer cette liste
                      </button>
                    </form>
                  </div>
                  <ul className="mt-1 flex flex-col divide-y divide-ardoise/10">
                    {itemsDuGroupe.map((item) => ligneAttente(item))}
                  </ul>
                </div>
              ))}
          </div>
        </section>
      )}

      <section className="mx-auto flex w-full max-w-lg md:max-w-2xl lg:max-w-4xl flex-1 flex-col gap-4 px-4 sm:px-6 py-6">
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

        <AjouterDepuisDocument
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
                  {item.listeNom && (
                    <span className="ml-2 rounded-full bg-ambre/10 px-2 py-0.5 font-sans text-[11px] font-medium text-ambre">
                      📋 {item.listeNom}
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
