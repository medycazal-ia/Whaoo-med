import { parserLigne, type IngredientParse } from "@/lib/courses/parse-recette";

export type ResultatParseDocument = {
  items: IngredientParse[];
  nomSuggere: string | null;
};

// Mots qui introduisent une section ou un repas dans un document de type
// "régime" plutôt qu'un article achetable — on les ignore silencieusement.
const ENTETES_A_IGNORER = new Set([
  "midi",
  "soir",
  "matin",
  "apres-midi",
  "collations",
  "collation",
  "petit-dejeuner",
  "petit dejeuner",
  "dejeuner",
  "diner",
  "gouter",
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
]);

function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

function estEntete(ligne: string): boolean {
  const nettoyee = normaliser(ligne).replace(/[:\s]+$/, "");
  if (ENTETES_A_IGNORER.has(nettoyee)) return true;

  // Ligne courte, tout en majuscules, sans chiffre ni puce : probablement
  // un titre de section (ex. "DIMANCHE") plutôt qu'un article.
  if (
    ligne.length <= 25 &&
    ligne === ligne.toUpperCase() &&
    /[A-ZÀ-Ü]/.test(ligne) &&
    !/\d/.test(ligne) &&
    !/^[-+•*]/.test(ligne)
  ) {
    return true;
  }

  return false;
}

// Retire la puce ("-", "+", "•") et un préfixe générique de type
// "Plat : ", "Accompagnement : " qui ne fait pas partie du nom de l'article.
function nettoyerLigne(ligne: string): string {
  let l = ligne.trim().replace(/^[-+•*]\s*/, "");
  l = l.replace(/^[A-Za-zÀ-ÿ' ]{2,25}\s*:\s*/, "");
  return l.trim();
}

/**
 * Analyse un document collé ou importé (recette, régime alimentaire, liste
 * de repas...) pour en extraire les articles à ajouter à la liste de
 * courses. Ignore les titres de section/jour/repas, et reconnaît le format
 * « Nom du plat (ingrédient 1,
 * ingrédient 2, ...) » en éclatant la parenthèse en articles séparés tout
 * en suggérant le nom du plat comme nom de liste.
 */
export function parserDocumentAliments(texte: string): ResultatParseDocument {
  const items: IngredientParse[] = [];
  let nomSuggere: string | null = null;

  const lignes = texte
    .split("\n")
    .map((ligne) => ligne.trim())
    .filter(Boolean);

  for (const ligneBrute of lignes) {
    if (estEntete(ligneBrute)) continue;

    const ligne = nettoyerLigne(ligneBrute);
    if (!ligne) continue;

    const matchParenthese = ligne.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    if (matchParenthese) {
      const ingredients = matchParenthese[2]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (ingredients.length >= 2) {
        if (!nomSuggere) nomSuggere = matchParenthese[1].trim();
        for (const ingredient of ingredients) {
          items.push(parserLigne(ingredient));
        }
        continue;
      }
    }

    items.push(parserLigne(ligne));
  }

  return { items, nomSuggere };
}
