export type IngredientParse = {
  label: string;
  detail: string | null;
  quantity: number;
};

const UNITE_REGEX =
  /^(\d+(?:[.,]\d+)?)\s*(g|kg|ml|cl|l|sachets?|bo[iî]tes?|paquets?|tranches?|gousses?|pinc[ée]es?|cuill[eè]res?)?\.?\s*(?:de\s+|d')?(.+)$/i;

function parserLigne(ligne: string): IngredientParse {
  const match = ligne.match(UNITE_REGEX);
  if (!match) {
    return { label: ligne, detail: null, quantity: 1 };
  }

  const [, nombreStr, unite, reste] = match;
  const label = reste.trim();
  if (!label) {
    return { label: ligne, detail: null, quantity: 1 };
  }

  if (unite) {
    return { label, detail: `${nombreStr}${unite}`, quantity: 1 };
  }

  const nombre = parseFloat(nombreStr.replace(",", "."));
  return { label, detail: null, quantity: Math.max(1, Math.round(nombre) || 1) };
}

/**
 * Analyse une liste d'ingrédients collée en vrac (une ligne par ingrédient,
 * ex. "200g farine", "3 oeufs", "1 sachet de levure") pour les ajouter en
 * une fois à la liste de courses. Heuristique simple, toujours présentée
 * en aperçu modifiable avant ajout réel.
 */
export function parserListeIngredients(texte: string): IngredientParse[] {
  return texte
    .split("\n")
    .map((ligne) => ligne.trim())
    .filter(Boolean)
    .map(parserLigne);
}
