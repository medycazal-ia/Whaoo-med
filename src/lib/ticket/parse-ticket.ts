export type LigneTicket = {
  label: string;
  price: number;
};

// Lignes de ticket de caisse qui ne sont jamais un article (total, TVA,
// moyen de paiement, etc.) — on les écarte pour ne garder que les lignes
// qui ressemblent vraiment à "nom de produit ... prix".
const MOTS_EXCLUS =
  /\b(total|sous.total|tva|especes?|esp[eè]ces|carte\s*bancaire|cb\b|monnaie|rendu|ticket|caisse|merci|remise|reduction|r[ée]duction|solde|change|a\s*payer|net\s*a\s*payer)\b/i;

const NOMBRE_REGEX = /\d{1,4}[.,]\d{2}/g;

/**
 * Analyse le texte brut extrait par OCR d'un ticket de caisse pour en
 * tirer des paires (article, prix) plausibles. Heuristique volontairement
 * simple : l'OCR sur un ticket est rarement parfait, le résultat est
 * toujours présenté à l'utilisateur pour vérification/édition avant tout
 * enregistrement, jamais utilisé tel quel.
 *
 * Les tickets à colonnes (ex. Carrefour : "ARTICLE   1x   4,30   4,30 2",
 * le dernier chiffre isolé étant une classe de taux de TVA collée au
 * montant) sont pris en charge : on retient le DERNIER nombre décimal de
 * la ligne comme prix, et tout ce qui précède le premier nombre comme nom
 * d'article.
 */
export function parserTicket(texteBrut: string): LigneTicket[] {
  const lignes = texteBrut
    .split("\n")
    .map((ligne) => ligne.trim())
    .filter(Boolean);

  const resultats: LigneTicket[] = [];

  for (const ligneBrute of lignes) {
    if (MOTS_EXCLUS.test(ligneBrute)) continue;

    // Retire un chiffre isolé de classe de TVA collé juste après le
    // dernier montant (ex. "4,30 2" -> "4,30").
    const ligne = ligneBrute.replace(/(\d[.,]\d{2})\s*\d\s*$/, "$1");

    const nombres = ligne.match(NOMBRE_REGEX);
    if (!nombres || nombres.length === 0) continue;

    const price = parseFloat(nombres[nombres.length - 1].replace(",", "."));
    if (!Number.isFinite(price) || price <= 0 || price > 500) continue;

    const indexPremierChiffre = ligne.search(/\d/);
    const partieLabel = indexPremierChiffre > 0 ? ligne.slice(0, indexPremierChiffre) : "";
    const label = partieLabel
      .replace(/[.*_]+/g, " ")
      .replace(/\s+/g, " ")
      .replace(/[-:\s]+$/, "")
      .trim();

    if (label.length < 2) continue;

    resultats.push({ label, price });
  }

  return resultats;
}
