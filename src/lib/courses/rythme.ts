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

// ---------------------------------------------------------------------------
// Période de budget : du jour J d'un mois au jour J-1 du mois suivant.
// J = 1 correspond au mois calendaire habituel ; J = 25 à "du 25 au 24",
// pour caler le budget sur le jour de paie. J est limité à 28 pour exister
// dans tous les mois.
// ---------------------------------------------------------------------------

export const JOUR_DEBUT_MAX = 28;

export function normaliserJourDebut(jour: unknown): number {
  const n = Math.trunc(Number(jour));
  return Number.isFinite(n) && n >= 1 && n <= JOUR_DEBUT_MAX ? n : 1;
}

export function debutPeriode(reference = new Date(), jourDebut = 1): Date {
  const jour = normaliserJourDebut(jourDebut);
  const annee = reference.getFullYear();
  const mois = reference.getMonth();
  return reference.getDate() >= jour ? new Date(annee, mois, jour) : new Date(annee, mois - 1, jour);
}

export function debutPeriodeSuivante(debut: Date): Date {
  return new Date(debut.getFullYear(), debut.getMonth() + 1, debut.getDate());
}

/** Dernier jour inclus de la période. */
export function finPeriode(debut: Date): Date {
  return new Date(debut.getFullYear(), debut.getMonth() + 1, debut.getDate() - 1);
}

/** Date au format AAAA-MM-JJ, en heure locale (pas de décalage UTC). */
export function dateISO(date: Date): string {
  const mois = String(date.getMonth() + 1).padStart(2, "0");
  const jour = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mois}-${jour}`;
}

export function debutPeriodeISO(reference = new Date(), jourDebut = 1): string {
  return dateISO(debutPeriode(reference, jourDebut));
}

/** "du 25/09 au 24/10", ou "de septembre 2026" pour un mois calendaire. */
export function libellePeriode(debut: Date): string {
  const fin = finPeriode(debut);
  if (debut.getDate() === 1) {
    return `de ${debut.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`;
  }
  const court = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `du ${court(debut)} au ${court(fin)}`;
}

const MS_PAR_JOUR = 24 * 60 * 60 * 1000;

function joursEntre(debut: Date, fin: Date): number {
  // Arrondi : absorbe les changements d'heure été/hiver.
  return Math.round((fin.getTime() - debut.getTime()) / MS_PAR_JOUR);
}

export function calculerRythme(params: {
  budgetAmount: number;
  totalDepense: number;
  debut: Date;
  aujourdHui?: Date;
}) {
  const aujourdHui = params.aujourdHui ?? new Date();
  const totalJours = joursEntre(params.debut, debutPeriodeSuivante(params.debut));
  const aujourdHuiMinuit = new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), aujourdHui.getDate());
  const jourCourant = Math.min(Math.max(joursEntre(params.debut, aujourdHuiMinuit) + 1, 1), totalJours);

  const depenseIdeale = (params.budgetAmount * jourCourant) / totalJours;
  const ratio = depenseIdeale > 0 ? params.totalDepense / depenseIdeale : 0;

  let statut: StatutRythme = "serein";
  if (ratio > SEUIL_ATTENTION) statut = "attention";
  else if (ratio > SEUIL_VIGILANT) statut = "vigilant";

  // La cagnotte est le budget du mois amputé de chaque achat au fur et à
  // mesure — pas un écart théorique par rapport à un rythme idéal.
  // Exemple donné par Medy : 200 € de budget, premier achat à 59 € →
  // cagnotte à 141 €, quel que soit le jour du mois où cet achat a lieu.
  const cagnotteBrute = params.budgetAmount - params.totalDepense;
  const cagnotte = Math.max(0, cagnotteBrute);
  const palierAtteint = [...PALIERS_CAGNOTTE].reverse().find((palier) => cagnotte >= palier.min);

  const conseilCagnotte = palierAtteint
    ? palierAtteint.conseil
    : cagnotteBrute < 0
      ? "Budget dépassé ce mois-ci — pas de cagnotte pour l'instant."
      : "Il te reste de quoi voir venir, continue comme ça.";

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
