"use client";

import { useState } from "react";
import type { ArticleCourse } from "@/lib/courses/types";
import { FormulaireEditionArticle } from "@/components/formulaire-edition-article";
import { LABEL_SOURCE_PRIX } from "@/lib/prix-estimes";

export function CarteArticle({
  item,
  sessionActive,
  basculerStatutAction,
  supprimerAction,
  modifierAction,
}: {
  item: ArticleCourse;
  sessionActive: string;
  basculerStatutAction: (formData: FormData) => Promise<void>;
  supprimerAction: (formData: FormData) => Promise<void>;
  modifierAction?: (formData: FormData) => Promise<void>;
}) {
  const [edition, setEdition] = useState(false);

  if (edition && modifierAction) {
    return (
      <li className="flex flex-col gap-2 rounded-lg bg-white p-3">
        <FormulaireEditionArticle
          item={item}
          modifierAction={modifierAction}
          onTermine={() => setEdition(false)}
        />
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-2 rounded-lg bg-white p-3">
      <div className="min-w-0">
        <p className="break-words text-ardoise">
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
          {item.sessionCourses && (
            <span className="ml-2 rounded-full bg-kaki/10 px-2 py-0.5 font-sans text-[11px] font-medium text-kaki">
              🛍️ {item.sessionCourses}
            </span>
          )}
        </p>
      </div>
      {/* Boutons toujours sur leur propre ligne, jamais à côté du label :
          dans la grille à 3 colonnes (277px de large par carte), un label
          + bouton "Remettre en attente" côte à côte pouvait dépasser la
          largeur de la carte et recouvrir silencieusement les boutons de
          la carte voisine (bug déjà reproduit et corrigé). */}
      <div className="flex flex-wrap gap-1">
        {modifierAction && (
          <button
            type="button"
            onClick={() => setEdition(true)}
            className="rounded-lg border border-ardoise/20 px-2 py-1 text-xs text-ardoise/70"
          >
            ✏️ Modifier
          </button>
        )}
        <form action={basculerStatutAction}>
          <input type="hidden" name="id" value={item.id} />
          <input
            type="hidden"
            name="status"
            value={item.status === "achete" ? "a_acheter" : "achete"}
          />
          <input type="hidden" name="sessionCourses" value={sessionActive} />
          <button
            type="submit"
            className="rounded-lg border border-basilic/40 px-2 py-1 text-xs text-basilic"
          >
            {item.status === "achete" ? "Remettre en attente" : "Marquer acheté"}
          </button>
        </form>
        <form action={supprimerAction}>
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
  );
}
