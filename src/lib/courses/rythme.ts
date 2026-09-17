export type StatutRythme = "serein" | "vigilant" | "attention";

export const PALIERS_CAGNOTTE = [
  { label: "Petit plaisir", min: 5 },
  { label: "Sortie", min: 20 },
  { label: "Voyage", min: 100 },
] as const;

const SEUIL_VIGILANT = 1.0;
const SEUIL_ATTENTION = 1.15;

export function joursDansLeMois(mois: Date): number {
  return new Date(mois.getFullYear(), mois.getMonth() + 1, 0).getDate();
}

export function premierJourDuMois(reference = new Date()): Date {
  return new Date(reference.getFullYear(), reference.getMonth(), 1);
}

export function calculerRythme(params: {
  budgetAmount: number;
  totalDepense: number;
  mois: Date;
  aujourdHui?: Date;
}) {
  const aujourdHui = params.aujourdHui ?? new Date();
  const totalJours = joursDansLeMois(params.mois);
  const jourCourant = Math.min(aujourdHui.getDate(), totalJours);

  const depenseIdeale = (params.budgetAmount * jourCourant) / totalJours;
  const ecart = depenseIdeale - params.totalDepense;
  const ratio = depenseIdeale > 0 ? params.totalDepense / depenseIdeale : 0;

  let statut: StatutRythme = "serein";
  if (ratio > SEUIL_ATTENTION) statut = "attention";
  else if (ratio > SEUIL_VIGILANT) statut = "vigilant";

  const cagnotte = Math.max(0, ecart);
  const palierAtteint = [...PALIERS_CAGNOTTE]
    .reverse()
    .find((palier) => cagnotte >= palier.min);

  return {
    jourCourant,
    totalJours,
    depenseIdeale,
    statut,
    cagnotte,
    palierAtteint: palierAtteint ?? null,
  };
}
