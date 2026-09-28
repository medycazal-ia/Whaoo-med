import type { ArticleCourse } from "@/lib/courses/types";

export type GroupeSession = {
  // null : articles sans session datée (anciens articles, ou ajoutés hors
  // session).
  session: string | null;
  items: ArticleCourse[];
  total: number;
  // Date la plus récente du groupe (achat, sinon ajout), pour trier.
  plusRecent: string;
};

/**
 * Regroupe des articles par session de courses datée ("Courses du 28/09")
 * : un sous-groupe par date dans la liste à acheter, une facturette par
 * date dans les achats. Sessions les plus récentes d'abord, articles sans
 * session en dernier.
 */
export function grouperParSession(items: ArticleCourse[]): GroupeSession[] {
  const groupes = new Map<string | null, ArticleCourse[]>();
  for (const item of items) {
    const cle = item.sessionCourses?.trim() || null;
    groupes.set(cle, [...(groupes.get(cle) ?? []), item]);
  }

  return Array.from(groupes, ([session, itemsDuGroupe]) => ({
    session,
    items: itemsDuGroupe,
    total: Math.round(itemsDuGroupe.reduce((t, i) => t + i.price * i.quantity, 0) * 100) / 100,
    plusRecent: itemsDuGroupe
      .map((i) => i.acheteLe ?? i.createdAt ?? "")
      .reduce((max, d) => (d > max ? d : max), ""),
  })).sort((a, b) => {
    if (a.session === null) return 1;
    if (b.session === null) return -1;
    return b.plusRecent.localeCompare(a.plusRecent);
  });
}
