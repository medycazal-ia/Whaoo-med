// Nom par défaut d'une liste importée (recette, régime, document) quand
// l'utilisateur ne lui en donne pas un lui-même — daté du jour, pour
// rester lisible dans "🔔 À ne pas oublier" sans jamais laisser un tas
// d'articles sans nom ni possibilité de suppression groupée.
export function nomListeParDefaut(reference: Date = new Date()): string {
  const jour = String(reference.getDate()).padStart(2, "0");
  const mois = String(reference.getMonth() + 1).padStart(2, "0");
  return `Liste du ${jour}/${mois}`;
}
