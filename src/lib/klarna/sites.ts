// Sites autorisés à envoyer leurs visiteurs sur la page de paiement Klarna
// partagée (https://whaoo.site/paiement/klarna?site=<id>&montant=<euros>).
// Pour brancher un nouveau site : ajouter une entrée ici, puis mettre sur ce
// site un lien vers la page avec son identifiant. Seules les adresses de
// retour listées ici sont utilisées (pas de redirection vers une adresse
// passée dans l'URL).

export type SiteKlarna = {
  id: string;
  nom: string;
  // Ligne affichée sur la page Klarna et sur le relevé du client.
  libelle: string;
  // Page où revient le visiteur après un paiement réussi.
  urlMerci: string;
  // Page où revient le visiteur s'il annule.
  urlRetour: string;
  montantMin: number; // en euros
  montantMax: number; // en euros
  montantPropose: number; // en euros
};

export const SITES_KLARNA: SiteKlarna[] = [
  {
    id: "whaoo",
    nom: "whaoo",
    libelle: "Contribution libre whaoo",
    urlMerci: "https://whaoo.site/merci",
    urlRetour: "https://whaoo.site/",
    montantMin: 1,
    montantMax: 500,
    montantPropose: 5,
  },
  {
    id: "medy",
    nom: "medy.site",
    libelle: "Paiement medy.site",
    urlMerci: "https://medy.site/",
    urlRetour: "https://medy.site/",
    montantMin: 1,
    montantMax: 500,
    montantPropose: 5,
  },
];

export function siteKlarna(id: string | null | undefined): SiteKlarna {
  return SITES_KLARNA.find((s) => s.id === id) ?? SITES_KLARNA[0];
}

// Montant en euros saisi ou passé dans l'URL → centimes, ou null s'il est
// invalide ou hors des bornes du site.
export function montantEnCentimes(valeur: string | null | undefined, site: SiteKlarna): number | null {
  if (!valeur) return null;
  const euros = Number(valeur.replace(",", "."));
  if (!Number.isFinite(euros) || euros < site.montantMin || euros > site.montantMax) return null;
  return Math.round(euros * 100);
}
