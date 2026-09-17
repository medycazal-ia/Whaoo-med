export type ArticleParse = {
  label: string;
  price: number;
  quantity: number;
};

export type CommandeVocale =
  | { type: "budget"; montant: number }
  | { type: "article"; article: ArticleParse };

/**
 * Extraction très simple d'une phrase dictée : soit une commande de budget
 * ("budget du mois 250 euros"), soit un article ("2 yaourts à 1 euro 50").
 * La reconnaissance vocale n'étant jamais fiable à 100 %, le résultat est
 * toujours présenté dans un écran de confirmation modifiable avant
 * enregistrement (section 3.1 du cahier des charges) — cette fonction ne
 * fait que fournir un premier brouillon. Reprend la logique du prototype
 * validé (section 3 du cahier des charges).
 */
export function parserPhraseVocale(phrase: string): CommandeVocale {
  const lower = phrase.trim().toLowerCase();

  const matchBudget = lower.match(/budget[^0-9]*(\d+(?:[.,]\d{1,2})?)/);
  if (matchBudget && lower.includes("budget")) {
    return { type: "budget", montant: parseFloat(matchBudget[1].replace(",", ".")) };
  }

  return { type: "article", article: parserArticle(phrase) };
}

function parserArticle(phrase: string): ArticleParse {
  let reste = phrase.trim();

  let quantity = 1;
  const matchQuantite = reste.match(/^(\d+)\s+/);
  if (matchQuantite) {
    quantity = parseInt(matchQuantite[1], 10);
    reste = reste.slice(matchQuantite[0].length);
  }

  let price = 0;
  const matchPrix = reste.match(/(\d+(?:[.,]\d+)?)\s*(?:€|euros?)(?:\s*(\d{1,2}))?/i);
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
