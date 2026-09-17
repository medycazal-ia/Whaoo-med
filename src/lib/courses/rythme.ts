export type StatutRythme = "serein" | "vigilant" | "attention";

// Seuils et textes repris tels quels du prototype validé (section 3 du
// cahier des charges) — ne pas réinventer sans repasser par une validation UX.
const SEUIL_VIGILANT = 0.95;
const SEUIL_ATTENTION = 1.15;

export const PALIERS_CAGNOTTE = [
  { label: "Petit plaisir", min: 15, conseil: "De quoi un petit plaisir (café, dessert, extra) si tu veux." },
  { label: "Sortie", min: 50, conseil: "De quoi t'offrir un resto ou une sortie sans culpabiliser." },
  { label: "Voyage", min: 150, conseil: "Tu as de quoi commencer à regarder un billet d'avion ou un week-end." },
] as const;

const STATUT_LABELS: Record<StatutRythme, string> = {
  attention: "Ralentis un peu — tu dépenses plus vite que prévu ce mois-ci.",
  vigilant: "Rythme correct, reste vigilant jusqu'à la fin du mois.",
  serein: "Tu es en avance sur ton budget, tu peux y aller sereinement.",
};

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
  const palierAtteint = [...PALIERS_CAGNOTTE].reverse().find((palier) => cagnotte >= palier.min);

  const conseilCagnotte = palierAtteint
    ? palierAtteint.conseil
    : ecart < 0
      ? "Budget dépassé ce mois-ci — pas de cagnotte pour l'instant."
      : "Continue, la cagnotte se remplira si tu restes sous ton rythme.";

  return {
    jourCourant,
    totalJours,
    depenseIdeale,
    statut,
    statutLabel: STATUT_LABELS[statut],
    cagnotte,
    palierAtteint: palierAtteint ?? null,
    conseilCagnotte,
  };
}
