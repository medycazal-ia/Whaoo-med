"use client";

import { useState } from "react";
import { parserListeIngredients, type IngredientParse } from "@/lib/courses/parse-recette";
import { estimerPrix, type IndexCommunautaire } from "@/lib/prix-estimes";

export function AjouterDepuisRecette({
  ajouterEnLotAction,
  indexCommunautaire,
}: {
  ajouterEnLotAction: (items: IngredientParse[]) => Promise<void>;
  indexCommunautaire?: IndexCommunautaire;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [texte, setTexte] = useState("");
  const [apercu, setApercu] = useState<IngredientParse[] | null>(null);
  const [enCours, setEnCours] = useState(false);

  function fermer() {
    setOuvert(false);
    setTexte("");
    setApercu(null);
  }

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="self-start text-sm text-ardoise/60 underline"
      >
        + Ajouter depuis une recette
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-ardoise/10 bg-white p-4">
      <p className="text-sm text-ardoise/70">
        Colle ou tape la liste d&apos;ingrédients, une ligne par ingrédient
        (ex. « 200g farine », « 3 oeufs », « 1 sachet de levure »).
      </p>
      <textarea
        value={texte}
        onChange={(e) => {
          setTexte(e.target.value);
          setApercu(null);
        }}
        rows={5}
        placeholder={"200g farine\n3 oeufs\n1 sachet de levure"}
        className="rounded-lg border border-ardoise/20 px-3 py-2 text-ardoise"
      />

      {apercu === null ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setApercu(parserListeIngredients(texte))}
            disabled={!texte.trim()}
            className="rounded-lg bg-ardoise px-4 py-2 text-sm font-medium text-craie disabled:opacity-50"
          >
            Analyser
          </button>
          <button
            type="button"
            onClick={fermer}
            className="rounded-lg border border-ardoise/20 px-4 py-2 text-sm text-ardoise"
          >
            Annuler
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs font-medium text-ambre">
            Vérifie avant d&apos;ajouter :
          </p>
          <ul className="flex flex-col gap-1 text-sm text-ardoise">
            {apercu.map((ingredient, i) => {
              const estimation = estimerPrix(ingredient.label, indexCommunautaire);
              return (
                <li key={i}>
                  {ingredient.quantity > 1 ? `${ingredient.quantity} × ` : ""}
                  {ingredient.label}
                  {ingredient.detail ? ` (${ingredient.detail})` : ""}
                  {estimation && (
                    <span className="ml-1 text-xs text-ardoise/50">
                      (~{estimation.prix.toFixed(2)} €)
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={enCours || apercu.length === 0}
              onClick={async () => {
                setEnCours(true);
                await ajouterEnLotAction(apercu);
                setEnCours(false);
                fermer();
              }}
              className="rounded-lg bg-basilic px-4 py-2 text-sm font-medium text-craie disabled:opacity-50"
            >
              Ajouter {apercu.length} article{apercu.length > 1 ? "s" : ""} à ma liste
            </button>
            <button
              type="button"
              onClick={() => setApercu(null)}
              className="rounded-lg border border-ardoise/20 px-4 py-2 text-sm text-ardoise"
            >
              Modifier le texte
            </button>
          </div>
        </>
      )}
    </div>
  );
}
