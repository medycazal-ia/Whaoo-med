// Domaines dédiés à la boutique (ex. boutique.whaoo.site ou un nom de
// domaine de vente), branchés sur ce service Render : la variable
// BOUTIQUE_DOMAINES en donne la liste, séparée par des virgules. Sur ces
// domaines, la page d'accueil est la boutique et le client y revient après
// le paiement ; whaoo.site/boutique reste accessible comme avant.

const URL_APP = (process.env.NEXT_PUBLIC_APP_URL || "https://whaoo.site").replace(/\/$/, "");

function domainesBoutique() {
  return (process.env.BOUTIQUE_DOMAINES || "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}

// `host` : en-tête Host de la requête (le port éventuel est ignoré).
export function estDomaineBoutique(host: string | null | undefined) {
  if (!host) return false;
  return domainesBoutique().includes(host.split(":")[0].toLowerCase());
}

// Adresse de base et chemin de la boutique selon le domaine de la requête.
export function adresseBoutique(host: string | null | undefined) {
  return estDomaineBoutique(host)
    ? { base: `https://${host!.split(":")[0].toLowerCase()}`, chemin: "/" }
    : { base: URL_APP, chemin: "/boutique" };
}
