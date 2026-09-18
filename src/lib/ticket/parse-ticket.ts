export type LigneTicket = {
  label: string;
  price: number;
};

// Lignes de ticket de caisse qui ne sont jamais un article (total, TVA,
// moyen de paiement, etc.) — on les écarte pour ne garder que les lignes
// qui ressemblent vraiment à "nom de produit ... prix".
const MOTS_EXCLUS =
  /\b(total|sous.total|tva|especes?|esp[eè]ces|carte\s*bancaire|cb\b|monnaie|rendu|ticket|caisse|merci|remise|reduction|r[ée]duction|solde|change|a\s*payer|net\s*a\s*payer)\b/i;

const LIGNE_PRIX_REGEX = /^(.{2,40}?)\s{1,}(\d{1,4}[.,]\d{2})\s*(?:€|eur)?\s*$/i;

/**
 * Analyse le texte brut extrait par OCR d'un ticket de caisse pour en
 * tirer des paires (article, prix) plausibles. Heuristique volontairement
 * simple : l'OCR sur un ticket est rarement parfait, le résultat est
 * toujours présenté à l'utilisateur pour vérification/édition avant tout
 * enregistrement, jamais utilisé tel quel.
 */
export function parserTicket(texteBrut: string): LigneTicket[] {
  const lignes = texteBrut
    .split("\n")
    .map((ligne) => ligne.trim())
    .filter(Boolean);

  const resultats: LigneTicket[] = [];

  for (const ligne of lignes) {
    if (MOTS_EXCLUS.test(ligne)) continue;

    const match = ligne.match(LIGNE_PRIX_REGEX);
    if (!match) continue;

    const label = match[1]
      .replace(/[.*_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const price = parseFloat(match[2].replace(",", "."));

    if (!label || !Number.isFinite(price) || price <= 0 || price > 500) continue;

    resultats.push({ label, price });
  }

  return resultats;
}
