"use client";

import { useState } from "react";

const EXEMPLES = [
  {
    titre: "Ajouter un article",
    phrases: ["Deux yaourts à un euro cinquante", "Trois pommes", "Pain"],
  },
  {
    titre: "Définir le budget du mois",
    phrases: ["Budget du mois deux cent cinquante euros"],
  },
  {
    titre: "Corriger un prix",
    phrases: ["Trois euros cinquante", "Deux euros"],
  },
];

export function AideVocale() {
  const [ouvert, setOuvert] = useState(false);

  return (
    <div className="text-xs text-ardoise/60">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        className="underline"
      >
        💡 {ouvert ? "Masquer" : "Voir"} des exemples de phrases à dire
      </button>
      {ouvert && (
        <ul className="mt-2 flex flex-col gap-2 rounded-lg bg-white p-3 text-ardoise/80">
          {EXEMPLES.map((groupe) => (
            <li key={groupe.titre}>
              <p className="font-medium text-ardoise">{groupe.titre}</p>
              <ul className="mt-0.5 list-disc pl-4">
                {groupe.phrases.map((phrase) => (
                  <li key={phrase}>« {phrase} »</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
