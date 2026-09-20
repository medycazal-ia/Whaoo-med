import type { SourcePrix } from "@/lib/prix-estimes";

export type ArticleCourse = {
  id: string;
  label: string;
  detail?: string | null;
  price: number;
  quantity: number;
  status: "achete" | "a_acheter";
  prixSource?: SourcePrix | null;
  listeNom?: string | null;
  sessionCourses?: string | null;
  // Utilisé pour regrouper les articles d'un même import (recette/document)
  // ajoutés en un seul lot — tous les articles d'un même appel partagent
  // exactement le même horodatage côté base de données.
  createdAt?: string | null;
};
