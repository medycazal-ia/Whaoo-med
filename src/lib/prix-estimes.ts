// Estimations de prix moyens constatés en supermarché en France (ordre de
// grandeur indicatif, pas des prix réels ni actualisés en temps réel — à
// utiliser uniquement comme suggestion de départ, jamais comme donnée
// fiable). Aucune donnée récupérée automatiquement (pas de scraping, pas
// d'API tierce) : voir la discussion produit sur les limites de ce qu'on
// peut faire ici sans partenariat avec une enseigne.
const PRIX_MOYENS: Record<string, number> = {
  "pain": 1.1,
  "baguette": 1.1,
  "lait": 1.1,
  "oeufs": 2.5,
  "beurre": 2.3,
  "farine": 1.2,
  "sucre": 1.5,
  "riz": 1.8,
  "pates": 1.0,
  "huile d'olive": 6.5,
  "huile": 3.5,
  "pommes": 2.5,
  "bananes": 1.8,
  "oranges": 2.2,
  "pommes de terre": 1.5,
  "tomates": 3.0,
  "carottes": 1.3,
  "oignons": 1.5,
  "salade": 1.2,
  "yaourt": 2.2,
  "yaourts": 2.2,
  "fromage": 3.5,
  "poulet": 9.0,
  "steak hache": 5.0,
  "saumon": 8.0,
  "jambon": 2.8,
  "cafe": 3.5,
  "the": 2.5,
  "chocolat": 1.8,
  "eau": 0.5,
  "jus d'orange": 1.8,
  "vin": 5.0,
  "biere": 4.5,
  "papier toilette": 6.5,
  "lessive": 8.0,
  "savon": 2.5,
  "gel douche": 2.5,
  "dentifrice": 2.2,
  "shampoing": 3.0,
  "cereales": 3.5,
  "confiture": 2.5,
  "miel": 4.0,
  "moutarde": 1.8,
  "ketchup": 2.0,
  "mayonnaise": 2.2,
  "chips": 2.0,
  "biscuits": 2.2,
  "glace": 3.5,
  "pizza": 3.0,
  "epinards": 1.8,
  "haricots verts": 1.2,
  "thon": 1.8,
  "sardines": 1.5,
};

export function normaliserLabel(texte: string): string {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export type IndexCommunautaire = Record<string, number>;

// Origine d'un prix affiché dans l'app : saisi à la main par l'utilisateur,
// calculé à partir des contributions anonymes d'autres utilisateurs, ou
// repris de la table statique indicative ci-dessus.
export type SourcePrix = "manuel" | "communaute" | "statique";

export const LABEL_SOURCE_PRIX: Record<SourcePrix, string> = {
  manuel: "Prix saisi",
  communaute: "Moyenne communauté",
  statique: "Prix indicatif",
};

/**
 * Cherche une estimation de prix pour un article à partir de son nom, et
 * indique d'où elle vient. Priorité aux prix remontés par la communauté
 * (plus fiables, réels) s'ils existent pour cet article, sinon repli sur la
 * table statique indicative. Correspondance approximative (sous-chaîne dans
 * un sens ou dans l'autre) — ne renvoie qu'une suggestion, jamais un prix
 * garanti exact.
 */
export function estimerPrix(
  label: string,
  indexCommunautaire?: IndexCommunautaire,
): { prix: number; source: SourcePrix } | null {
  const normalise = normaliserLabel(label);
  if (!normalise) return null;

  if (indexCommunautaire) {
    for (const [cle, prix] of Object.entries(indexCommunautaire)) {
      if (normalise.includes(cle) || cle.includes(normalise)) {
        return { prix, source: "communaute" };
      }
    }
  }

  for (const [cle, prix] of Object.entries(PRIX_MOYENS)) {
    if (normalise.includes(cle) || cle.includes(normalise)) {
      return { prix, source: "statique" };
    }
  }
  return null;
}
