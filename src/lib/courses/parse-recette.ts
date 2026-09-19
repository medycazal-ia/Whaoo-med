export type IngredientParse = {
  label: string;
  detail: string | null;
  quantity: number;
};

const UNITE_REGEX =
  /^(\d+(?:[.,]\d+)?)\s*(g|kg|ml|cl|l|sachets?|bo[iî]tes?|paquets?|tranches?|gousses?|pinc[ée]es?|cuill[eè]res?)?\.?\s*(?:de\s+|d')?(.+)$/i;

export function parserLigne(ligne: string): IngredientParse {
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
