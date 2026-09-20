// "Budget immédiat" : nom par défaut d'une session de courses (distincte
// du budget mensuel), utilisé pour rattacher les achats effectifs d'un
// même passage en caisse. Sans heure tant qu'une seule session existe ce
// jour-là ; avec l'heure dès qu'on en démarre une deuxième, pour que
// l'utilisateur puisse les distinguer et les retrouver facilement.
export function nomSessionParDefaut(reference: Date = new Date(), avecHeure = false): string {
  const jour = String(reference.getDate()).padStart(2, "0");
  const mois = String(reference.getMonth() + 1).padStart(2, "0");
  const base = `Courses du ${jour}/${mois}`;
  if (!avecHeure) return base;

  const heures = String(reference.getHours()).padStart(2, "0");
  const minutes = String(reference.getMinutes()).padStart(2, "0");
  return `${base} à ${heures}h${minutes}`;
}

function estAujourdHui(dateISO: string, reference: Date): boolean {
  const date = new Date(dateISO);
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
}

/**
 * Détermine la session de courses active à partir des achats déjà
 * enregistrés aujourd'hui : reprend la dernière utilisée (pour continuer
 * le même passage en caisse), ou en propose une nouvelle par défaut s'il
 * n'y en a pas encore. Fournit aussi la liste des sessions du jour, pour
 * permettre à l'utilisateur d'y revenir facilement.
 */
export function calculerSessionActive(
  achats: { sessionCourses?: string | null; createdAt?: string | null }[],
  reference: Date = new Date(),
): { sessionActive: string; sessionsAujourdHui: string[] } {
  const achatsAujourdHui = achats
    .filter((a) => a.createdAt && estAujourdHui(a.createdAt, reference) && a.sessionCourses)
    .reverse(); // du plus ancien au plus récent si la source est triée desc

  const sessionsAujourdHui = Array.from(
    new Set(achatsAujourdHui.map((a) => a.sessionCourses as string)),
  );

  const derniere = sessionsAujourdHui[sessionsAujourdHui.length - 1];

  return {
    sessionActive: derniere ?? nomSessionParDefaut(reference),
    sessionsAujourdHui,
  };
}
