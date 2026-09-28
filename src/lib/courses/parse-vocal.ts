export type ArticleParse = {
  label: string;
  price: number;
  quantity: number;
};

export type CommandeVocale =
  // montant null : budget demandé sans montant compris ("change mon
  // budget") — l'écran de confirmation s'ouvre avec le champ vide.
  | { type: "budget"; montant: number | null }
  | { type: "article"; article: ArticleParse };

const VALEURS_NOMBRES: Record<string, number> = {
  zero: 0, zéro: 0, un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5,
  six: 6, sept: 7, huit: 8, neuf: 9, dix: 10, onze: 11, douze: 12,
  treize: 13, quatorze: 14, quinze: 15, seize: 16, vingt: 20, vingts: 20,
  trente: 30, quarante: 40, cinquante: 50, soixante: 60,
};

/**
 * Convertit un nombre dicté en toutes lettres ("cinq cents", "mille deux
 * cent cinquante", "quatre-vingt-dix") en valeur, quand la reconnaissance
 * vocale n'a pas écrit les chiffres. Renvoie la plus longue suite de mots
 * de nombre trouvée dans la phrase, ou null.
 */
export function nombreEnLettres(phrase: string): number | null {
  // Un mot inconnu (sentinelle finale comprise) clôt la suite en cours.
  const mots = [...phrase.toLowerCase().split(/[\s-]+/).filter(Boolean), ""];
  let meilleurValeur: number | null = null;
  let meilleureLongueur = 0;

  let total = 0;
  let courant = 0;
  let longueur = 0;
  let precedent = "";

  for (const mot of mots) {
    if (mot === "et" && longueur > 0) continue;

    if (mot in VALEURS_NOMBRES) {
      const valeur = VALEURS_NOMBRES[mot];
      // "quatre-vingt(s)" = 4 × 20, pas 4 + 20.
      courant += valeur === 20 && precedent === "quatre" ? 80 - 4 : valeur;
    } else if (mot === "cent" || mot === "cents") {
      courant = (courant || 1) * 100;
    } else if (mot === "mille") {
      total += (courant || 1) * 1000;
      courant = 0;
    } else {
      if (longueur > meilleureLongueur) {
        meilleurValeur = total + courant;
        meilleureLongueur = longueur;
      }
      total = 0;
      courant = 0;
      longueur = 0;
      precedent = "";
      continue;
    }
    longueur++;
    precedent = mot;
  }

  return meilleurValeur;
}

function montantBudget(lower: string): number | null {
  // "1 200" / "1.200" dictés avec séparateur de milliers.
  const texte = lower.replace(/(\d)[\s.](?=\d{3}\b)/g, "$1");
  const enEuros = texte.match(/(\d+(?:,\d{1,2})?)\s*(?:€|euros?)/);
  const apresBudget = texte.match(/budgets?[^0-9]*(\d+(?:,\d{1,2})?)/);
  const nImporteOu = texte.match(/(\d+(?:,\d{1,2})?)/);
  const chiffres = enEuros?.[1] ?? apresBudget?.[1] ?? nImporteOu?.[1];
  if (chiffres) return parseFloat(chiffres.replace(",", "."));

  const lettres = nombreEnLettres(texte);
  return lettres !== null && lettres > 0 ? lettres : null;
}

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

  // Toute phrase qui parle du budget est une commande de budget, jamais un
  // article ("change mon budget", "mets 400 euros de budget", "mon budget
  // passe à cinq cents euros").
  if (/\bbudgets?\b/.test(lower)) {
    return { type: "budget", montant: montantBudget(lower) };
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
    // \b ne reconnaît pas "à" (lettre accentuée) comme un mot en
    // JavaScript : on délimite par les espaces.
    .replace(/(^|\s)à(?=\s|$)/gi, "$1")
    .replace(/\s+/g, " ")
    .trim();

  return { label: label || phrase.trim(), price, quantity };
}

/**
 * Analyse une courte phrase dictée pour corriger un prix seul (ex. après
 * avoir cliqué sur le micro à côté du champ prix : « trois euros
 * cinquante », « 2 euros », ou juste « 2,50 »). Contrairement à
 * parserPhraseVocale, ne s'occupe que du prix, pas de l'article.
 */
export function parserPrixVocal(phrase: string): number | null {
  const lower = phrase.trim().toLowerCase();

  const matchPrix = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:€|euros?)(?:\s*(\d{1,2}))?/i);
  if (matchPrix) {
    const entier = parseFloat(matchPrix[1].replace(",", "."));
    const centimes = matchPrix[2] ? parseInt(matchPrix[2], 10) / 100 : 0;
    return Math.round((entier + centimes) * 100) / 100;
  }

  const matchNombre = lower.match(/(\d+(?:[.,]\d+)?)/);
  if (matchNombre) {
    return parseFloat(matchNombre[1].replace(",", "."));
  }

  return null;
}
