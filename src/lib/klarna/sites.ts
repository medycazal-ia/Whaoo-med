// Sites autorisés à envoyer leurs visiteurs sur la page de paiement Klarna
// partagée, et ce qu'ils vendent :
//   produit du catalogue : https://whaoo.site/paiement/klarna?site=<id>&produit=<id>&quantite=1
//   montant libre        : https://whaoo.site/paiement/klarna?site=<id>&montant=<euros>
// Les prix sont fixés ici et jamais lus dans l'adresse (impossible de payer
// un produit moins cher en modifiant le lien). Seules les pages de retour
// listées ici sont utilisées.
//
// Ajouter un produit : une entrée dans `produits` du site, par exemple
//   { id: "guide-budget", nom: "Guide budget (PDF)", type: "digital", prix: 9.9 },
//   { id: "tote-bag", nom: "Tote bag whaoo", type: "physical", prix: 15, fraisPort: 4.9, quantiteMax: 5 },
// Prix TTC en euros (non assujetti à la TVA : taux 0 envoyé à Klarna).

export type ProduitKlarna = {
  id: string;
  nom: string;
  // "digital" : produit numérique (rien à expédier) ; "physical" : produit
  // expédié (l'adresse de livraison figure dans la commande sur le portail
  // marchand Klarna).
  type: "digital" | "physical";
  prix: number; // euros, par unité
  fraisPort?: number; // euros, une fois par commande
  quantiteMax?: number; // 1 par défaut
  urlProduit?: string;
  urlImage?: string; // adresse https complète, affichée par Klarna
};

export type SiteKlarna = {
  id: string;
  nom: string;
  // Page où revient le visiteur après un paiement réussi.
  urlMerci: string;
  // Page où revient le visiteur s'il annule.
  urlRetour: string;
  produits: ProduitKlarna[];
  // Montant libre (contribution, don, acompte…) ; null pour le désactiver.
  montantLibre: { libelle: string; min: number; max: number; propose: number } | null;
};

export const SITES_KLARNA: SiteKlarna[] = [
  {
    id: "whaoo",
    nom: "whaoo",
    urlMerci: "https://whaoo.site/merci",
    urlRetour: "https://whaoo.site/",
    produits: [],
    montantLibre: { libelle: "Contribution libre whaoo", min: 1, max: 500, propose: 5 },
  },
  {
    id: "medy",
    nom: "medy.site",
    urlMerci: "https://medy.site/",
    urlRetour: "https://medy.site/",
    produits: [],
    montantLibre: null,
  },
];

export function siteKlarna(id: string | null | undefined): SiteKlarna {
  return SITES_KLARNA.find((s) => s.id === id) ?? SITES_KLARNA[0];
}

// Ligne de commande au format Klarna (montants en centimes).
export type LigneKlarna = {
  type: "digital" | "physical" | "shipping_fee";
  reference: string;
  name: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total_amount: number;
  total_tax_amount: number;
  product_url?: string;
  image_url?: string;
};

const centimes = (euros: number) => Math.round(euros * 100);

function ligne(
  type: LigneKlarna["type"],
  reference: string,
  name: string,
  quantite: number,
  prixUnitaire: number,
): LigneKlarna {
  return {
    type,
    reference,
    name,
    quantity: quantite,
    unit_price: prixUnitaire,
    tax_rate: 0,
    total_amount: prixUnitaire * quantite,
    total_tax_amount: 0,
  };
}

export type Commande = { titre: string; lignes: LigneKlarna[]; total: number };

// Construit la commande à partir des paramètres du lien ou du formulaire,
// ou renvoie le code d'erreur à afficher.
export function construireCommande(
  site: SiteKlarna,
  params: { produit?: string | null; quantite?: string | null; montant?: string | null },
): Commande | { erreur: "produit" | "quantite" | "montant" } {
  if (params.produit) {
    const produit = site.produits.find((p) => p.id === params.produit);
    if (!produit) return { erreur: "produit" };
    const quantite = Number(params.quantite ?? "1");
    if (!Number.isInteger(quantite) || quantite < 1 || quantite > (produit.quantiteMax ?? 1)) {
      return { erreur: "quantite" };
    }
    const lignePrincipale = ligne(produit.type, produit.id, produit.nom, quantite, centimes(produit.prix));
    if (produit.urlProduit) lignePrincipale.product_url = produit.urlProduit;
    if (produit.urlImage) lignePrincipale.image_url = produit.urlImage;
    const lignes = [lignePrincipale];
    if (produit.type === "physical" && produit.fraisPort) {
      lignes.push(ligne("shipping_fee", "livraison", "Livraison", 1, centimes(produit.fraisPort)));
    }
    return { titre: produit.nom, lignes, total: lignes.reduce((s, l) => s + l.total_amount, 0) };
  }

  const libre = site.montantLibre;
  if (!libre) return { erreur: "produit" };
  const euros = Number((params.montant ?? "").replace(",", "."));
  if (!params.montant || !Number.isFinite(euros) || euros < libre.min || euros > libre.max) {
    return { erreur: "montant" };
  }
  const total = centimes(euros);
  return { titre: libre.libelle, lignes: [ligne("digital", "montant-libre", libre.libelle, 1, total)], total };
}

export const formatEuros = (centimesMontant: number) =>
  (centimesMontant / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
