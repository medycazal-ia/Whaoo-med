"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { calculerRythme, premierJourDuMois } from "@/lib/courses/rythme";
import { nomSessionParDefaut } from "@/lib/courses/session";
import type { ArticleCourse } from "@/lib/courses/types";
import { SaisieVocale } from "@/components/saisie-vocale";
import { ChampsArticlePrix } from "@/components/champs-article-prix";
import { AjouterDepuisDocument } from "@/components/ajouter-depuis-document";
import { AideVocale } from "@/components/aide-vocale";
import { BudgetFlottant } from "@/components/budget-flottant";
import { BudgetImmediat } from "@/components/budget-immediat";
import { FaqPanel } from "@/components/faq-panel";
import { ScannerTicket } from "@/components/scanner-ticket";
import { PromotionsLocales } from "@/components/promotions-locales";
import { LigneAttenteArticle } from "@/components/ligne-attente-article";
import { CarteArticle } from "@/components/carte-article";
import type { IngredientParse } from "@/lib/courses/parse-recette";
import type { IndexCommunautaire } from "@/lib/prix-estimes";

export type { ArticleCourse };

type CoursesActions = {
  ajouterArticle: (formData: FormData) => Promise<void>;
  basculerStatutArticle: (formData: FormData) => Promise<void>;
  supprimerArticle: (formData: FormData) => Promise<void>;
  supprimerListeNommee: (formData: FormData) => Promise<void>;
  definirBudget: (formData: FormData) => Promise<void>;
  ajouterArticlesEnLot: (items: IngredientParse[], listeNom: string | null) => Promise<void>;
  contribuerPrixTicket?: (lignes: { label: string; price: number }[]) => Promise<void>;
  ajouterArticlesAcheteesTicket?: (
    lignes: { label: string; price: number }[],
    sessionCourses: string | null,
  ) => Promise<void>;
  ajouterArticleAvecRetour?: (formData: FormData) => Promise<string | null>;
  modifierArticle?: (formData: FormData) => Promise<void>;
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
  sessionActive,
  sessionsAujourdHui = [],
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
  // "Budget immédiat" (section demandée par Medy) : nom de la session de
  // courses en cours, rattaché automatiquement à chaque achat validé
  // (case cochée, scan de ticket, dictée) tant que l'utilisateur n'en
  // choisit pas un autre — voir <BudgetImmediat>.
  sessionActive?: string;
  sessionsAujourdHui?: string[];
}) {
  const [aideOuverte, setAideOuverte] = useState(false);
  // Repliées par défaut à l'ouverture : un seul bouton "Voir mes listes"
  // les révèle toutes d'un coup, mis en valeur tant qu'elles sont cachées.
  const [listesReveleesUneFois, setListesReveleesUneFois] = useState(false);
  // Une fois révélées, chaque liste peut être masquée individuellement
  // (plutôt que tout ou rien) — son nom est ajouté ici tant qu'elle est
  // repliée.
  const [listesMasquees, setListesMasquees] = useState<Set<string>>(new Set());
  const [nomSessionActive, setNomSessionActive] = useState(
    sessionActive ?? nomSessionParDefaut(),
  );

  function basculerMasquageListe(nom: string) {
    setListesMasquees((precedent) => {
      const suivant = new Set(precedent);
      if (suivant.has(nom)) suivant.delete(nom);
      else suivant.add(nom);
      return suivant;
    });
  }

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

  // Au sein d'une même liste nommée, plusieurs imports successifs le même
  // jour (ex. deux recettes collées sous le même nom par défaut) partagent
  // un nom mais pas un horodatage : les articles d'un même ajout partagent
  // exactement le même `createdAt` (un seul appel serveur, un seul
  // horodatage). On les sous-groupe donc par horodatage, avec un sous-titre
  // numéroté à partir de 1 dès qu'il y a plus d'un ajout — invisible s'il
  // n'y en a qu'un, pour ne pas surcharger l'affichage.
  function sousGroupesParAjout(itemsDuGroupe: ArticleCourse[]): [string | null, ArticleCourse[]][] {
    const parHorodatage = Array.from(
      itemsDuGroupe.reduce((groupes, item) => {
        const cle = item.createdAt ?? "";
        const liste = groupes.get(cle) ?? [];
        liste.push(item);
        groupes.set(cle, liste);
        return groupes;
      }, new Map<string, ArticleCourse[]>()),
    ).sort(([a], [b]) => a.localeCompare(b));

    if (parHorodatage.length <= 1) return [[null, itemsDuGroupe]];
    return parHorodatage.map(([, itemsAjout], i) => [`Ajout ${i + 1}`, itemsAjout]);
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

      <section className="mx-auto w-full max-w-lg md:max-w-2xl lg:max-w-4xl px-4 sm:px-6">
        <BudgetImmediat
          valeur={nomSessionActive}
          onChanger={setNomSessionActive}
          sessionsRecentes={sessionsAujourdHui}
        />
      </section>

      <section className="mx-auto flex w-full max-w-lg md:max-w-2xl lg:max-w-4xl flex-col gap-4 px-4 sm:px-6 pt-6">
        <SaisieVocale
          ajouterArticleAction={actions.ajouterArticle}
          ajouterArticleAvecRetourAction={actions.ajouterArticleAvecRetour}
          supprimerArticleAction={actions.supprimerArticle}
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
                {itemsSansNom.map((item) => (
                  <LigneAttenteArticle
                    key={item.id}
                    item={item}
                    sessionActive={nomSessionActive}
                    basculerStatutAction={actions.basculerStatutArticle}
                    supprimerAction={actions.supprimerArticle}
                    modifierAction={actions.modifierArticle}
                  />
                ))}
              </ul>
            )}

            {groupesNommes.length > 0 && !listesReveleesUneFois && (
              <button
                type="button"
                onClick={() => setListesReveleesUneFois(true)}
                className="mt-3 w-full rounded-lg bg-ambre px-3 py-2 text-sm font-semibold text-ardoise shadow hover:opacity-90"
              >
                👀 Voir mes listes ({groupesNommes.length})
              </button>
            )}

            {listesReveleesUneFois &&
              groupesNommes.map(([nom, itemsDuGroupe]) => {
                const masquee = listesMasquees.has(nom);
                return (
                  <div key={nom} className="mt-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-ambre">📋 {nom}</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => basculerMasquageListe(nom)}
                          className="text-xs text-ardoise/60 underline"
                        >
                          {masquee ? "👁️ Afficher" : "🙈 Masquer"}
                        </button>
                        <form action={actions.supprimerListeNommee}>
                          <input type="hidden" name="listeNom" value={nom} />
                          <button type="submit" className="text-xs text-tomate underline">
                            Supprimer cette liste
                          </button>
                        </form>
                      </div>
                    </div>
                    {!masquee &&
                      sousGroupesParAjout(itemsDuGroupe).map(([sousTitre, itemsAjout], i) => (
                        <div key={sousTitre ?? i}>
                          {sousTitre && (
                            <p className="mt-1.5 text-[11px] font-medium text-ardoise/40">
                              {sousTitre}
                            </p>
                          )}
                          <ul className="mt-1 flex flex-col divide-y divide-ardoise/10">
                            {itemsAjout.map((item) => (
                              <LigneAttenteArticle
                                key={item.id}
                                item={item}
                                sessionActive={nomSessionActive}
                                basculerStatutAction={actions.basculerStatutArticle}
                                supprimerAction={actions.supprimerArticle}
                                modifierAction={actions.modifierArticle}
                              />
                            ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                );
              })}
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
          <input type="hidden" name="sessionCourses" value={nomSessionActive} />
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
          <ScannerTicket
            contribuerAction={actions.contribuerPrixTicket}
            ajouterAuBudgetAction={actions.ajouterArticlesAcheteesTicket}
            sessionCourses={nomSessionActive}
          />
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
            <CarteArticle
              key={item.id}
              item={item}
              sessionActive={nomSessionActive}
              basculerStatutAction={actions.basculerStatutArticle}
              supprimerAction={actions.supprimerArticle}
              modifierAction={actions.modifierArticle}
            />
          ))}
        </ul>
      </section>

      {footer}
    </>
  );
}
