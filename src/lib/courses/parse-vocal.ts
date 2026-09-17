export type ArticleParse = {
  label: string;
  price: number;
  quantity: number;
};

/**
 * Extraction très simple d'un prix et d'une quantité depuis une phrase dictée
 * (ex. "2 yaourts à 1 euro 50"). La reconnaissance vocale n'étant jamais
 * fiable à 100 %, le résultat est toujours présenté dans un écran de
 * confirmation modifiable avant enregistrement (section 3.1 du cahier des
 * charges) — cette fonction ne fait que fournir un premier brouillon.
 */
export function parserPhraseVocale(phrase: string): ArticleParse {
  let reste = phrase.trim();

  let quantity = 1;
  const matchQuantite = reste.match(/^(\d+)\s+/);
  if (matchQuantite) {
    quantity = parseInt(matchQuantite[1], 10);
    reste = reste.slice(matchQuantite[0].length);
  }

  let price = 0;
  const matchPrix = reste.match(
    /(\d+(?:[.,]\d+)?)\s*(?:€|euros?)(?:\s*(\d{1,2}))?/i,
  );
  if (matchPrix) {
    const entier = parseFloat(matchPrix[1].replace(",", "."));
    const centimes = matchPrix[2] ? parseInt(matchPrix[2], 10) / 100 : 0;
    price = Math.round((entier + centimes) * 100) / 100;
    reste = reste.replace(matchPrix[0], "");
  }

  const label = reste
    .replace(/\bà\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return { label: label || phrase.trim(), price, quantity };
}
