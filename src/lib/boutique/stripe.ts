// Boutique « Bons plans » (/boutique) : les produits viennent directement du
// compte Stripe WHAOO. Medy les crée dans Stripe → Catalogue de produits, et
// ils apparaissent ici (sous une minute) s'ils portent la métadonnée
// `boutique` = `whaoo`. Autres métadonnées facultatives du produit :
//   type          physique | numerique (défaut : numerique)
//   frais_port    frais de livraison en euros, ex. 4.90 (produits physiques)
//   quantite_max  quantité maximale par commande (défaut : 1)
//   prix_barre    ancien prix en euros, affiché barré (promotion)
//   partenaire    nom du partenaire qui propose le produit
//   lien          adresse d'une offre externe : bouton « Voir l'offre » au
//                 lieu d'un paiement Stripe (bon plan chez un partenaire)
//   ordre         nombre pour trier l'affichage (plus petit en premier)
// Le prix est le « prix par défaut » du produit (paiement unique, en EUR).
//
// Nécessite sur Render une clé restreinte Stripe (STRIPE_BOUTIQUE_KEY) avec
// les droits : Products (lecture), Prices (lecture), Checkout Sessions
// (écriture), Shipping Rates (écriture). Sans elle, la boutique est masquée.

const API = "https://api.stripe.com/v1";
export const ID_BOUTIQUE = "whaoo";

export function boutiqueActive() {
  return Boolean(process.env.STRIPE_BOUTIQUE_KEY);
}

type PrixStripe = {
  id: string;
  active: boolean;
  type: "one_time" | "recurring";
  currency: string;
  unit_amount: number | null;
};

type ProduitStripe = {
  id: string;
  active: boolean;
  name: string;
  description: string | null;
  images: string[];
  metadata: Record<string, string>;
  default_price: PrixStripe | string | null;
};

export type ProduitBoutique = {
  id: string;
  nom: string;
  description: string | null;
  image: string | null;
  physique: boolean;
  prix: number | null; // centimes
  prixBarre: number | null; // centimes
  fraisPort: number | null; // centimes
  quantiteMax: number;
  partenaire: string | null;
  lien: string | null;
  prixId: string | null;
  ordre: number;
};

async function appelStripe<T>(chemin: string, init?: { corps?: URLSearchParams; revalidate?: number }): Promise<T> {
  const reponse = await fetch(`${API}${chemin}`, {
    method: init?.corps ? "POST" : "GET",
    headers: {
      authorization: `Bearer ${process.env.STRIPE_BOUTIQUE_KEY}`,
      ...(init?.corps ? { "content-type": "application/x-www-form-urlencoded" } : {}),
    },
    body: init?.corps,
    ...(init?.revalidate ? { next: { revalidate: init.revalidate } } : { cache: "no-store" as const }),
  });
  if (!reponse.ok) {
    const detail = await reponse.text().catch(() => "");
    throw new Error(`Stripe ${chemin} : ${reponse.status} ${detail.slice(0, 300)}`);
  }
  return (await reponse.json()) as T;
}

const enCentimes = (euros: string | undefined) => {
  const n = Number((euros ?? "").replace(",", "."));
  return euros && Number.isFinite(n) && n > 0 ? Math.round(n * 100) : null;
};

const lienHttps = (url: string | undefined) => {
  try {
    return url && new URL(url).protocol === "https:" ? url : null;
  } catch {
    return null;
  }
};

// Produit Stripe → produit affichable, ou null s'il n'est pas dans la
// boutique ou n'a ni prix utilisable ni lien externe.
function versProduitBoutique(p: ProduitStripe): ProduitBoutique | null {
  const m = p.metadata ?? {};
  if (!p.active || m.boutique !== ID_BOUTIQUE) return null;
  const prix = typeof p.default_price === "object" ? p.default_price : null;
  const prixValide =
    prix && prix.active && prix.type === "one_time" && prix.currency === "eur" && prix.unit_amount
      ? prix
      : null;
  const lien = lienHttps(m.lien);
  if (!prixValide && !lien) return null;

  const quantiteMax = Number(m.quantite_max);
  return {
    id: p.id,
    nom: p.name,
    description: p.description,
    image: lienHttps(p.images?.[0]),
    physique: m.type === "physique",
    prix: prixValide?.unit_amount ?? null,
    prixBarre: enCentimes(m.prix_barre),
    fraisPort: enCentimes(m.frais_port),
    quantiteMax: Number.isInteger(quantiteMax) && quantiteMax > 1 ? Math.min(quantiteMax, 99) : 1,
    partenaire: m.partenaire?.trim() || null,
    lien,
    prixId: prixValide?.id ?? null,
    ordre: Number.isFinite(Number(m.ordre)) && m.ordre ? Number(m.ordre) : 1000,
  };
}

export async function produitsBoutique(): Promise<ProduitBoutique[]> {
  if (!boutiqueActive()) return [];
  const liste = await appelStripe<{ data: ProduitStripe[] }>(
    "/products?active=true&limit=100&expand[]=data.default_price",
    { revalidate: 60 },
  );
  return liste.data
    .map(versProduitBoutique)
    .filter((p): p is ProduitBoutique => p !== null)
    .sort((a, b) => a.ordre - b.ordre || a.nom.localeCompare(b.nom, "fr"));
}

async function produitBoutique(id: string) {
  const p = await appelStripe<ProduitStripe>(
    `/products/${encodeURIComponent(id)}?expand[]=default_price`,
  );
  return versProduitBoutique(p);
}

// Crée la page de paiement Stripe (Checkout) d'un produit de la boutique et
// renvoie son adresse, ou null si le produit ne se paie pas ici. Prix,
// frais de port et quantité maximale sont relus chez Stripe, jamais pris du
// formulaire.
export async function creerAchat(idProduit: string, quantiteDemandee: number, urlApp: string) {
  const produit = await produitBoutique(idProduit);
  if (!produit?.prixId) return null;
  const quantite = Math.min(Math.max(1, Math.floor(quantiteDemandee) || 1), produit.quantiteMax);

  const corps = new URLSearchParams({
    mode: "payment",
    locale: "fr",
    "line_items[0][price]": produit.prixId,
    "line_items[0][quantity]": String(quantite),
    success_url: `${urlApp}/merci?achat=1`,
    cancel_url: `${urlApp}/boutique`,
    allow_promotion_codes: "true",
    "metadata[boutique]": ID_BOUTIQUE,
    "metadata[produit]": produit.id,
  });
  if (produit.quantiteMax > 1) {
    corps.set("line_items[0][adjustable_quantity][enabled]", "true");
    corps.set("line_items[0][adjustable_quantity][minimum]", "1");
    corps.set("line_items[0][adjustable_quantity][maximum]", String(produit.quantiteMax));
  }
  if (produit.physique) {
    corps.set("shipping_address_collection[allowed_countries][0]", "FR");
    corps.set("phone_number_collection[enabled]", "true");
    if (produit.fraisPort) {
      corps.set("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
      corps.set("shipping_options[0][shipping_rate_data][display_name]", "Livraison");
      corps.set("shipping_options[0][shipping_rate_data][fixed_amount][amount]", String(produit.fraisPort));
      corps.set("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "eur");
    }
  }

  const session = await appelStripe<{ url: string }>("/checkout/sessions", { corps });
  return session.url;
}

export const formatEuros = (centimes: number) =>
  (centimes / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
