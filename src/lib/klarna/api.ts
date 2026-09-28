import type { Commande, SiteKlarna } from "./sites";

// Paiement Klarna direct par la page de paiement hébergée par Klarna (Hosted
// Payment Page, API « HPP merchant ») : on crée une session Klarna Payments,
// puis une session HPP qui renvoie l'adresse de la page Klarna où le
// visiteur paie. Aucun formulaire de paiement n'est hébergé chez nous.
//
// Nécessite un contrat marchand Klarna (identifiants API dans le portail
// marchand Klarna → Paramètres → Identifiants API). Tant que les variables
// ne sont pas définies, la page affiche « bientôt disponible ».

const URL_API_DEFAUT = "https://api.klarna.com"; // Europe, production

export function klarnaConfigure() {
  return Boolean(process.env.KLARNA_API_USERNAME && process.env.KLARNA_API_PASSWORD);
}

function urlApi() {
  return (process.env.KLARNA_API_URL || URL_API_DEFAUT).replace(/\/$/, "");
}

async function appelKlarna<T>(chemin: string, init: { method: "GET" | "POST"; corps?: unknown }): Promise<T> {
  const identifiants = Buffer.from(
    `${process.env.KLARNA_API_USERNAME}:${process.env.KLARNA_API_PASSWORD}`,
  ).toString("base64");

  const reponse = await fetch(`${urlApi()}${chemin}`, {
    method: init.method,
    headers: {
      authorization: `Basic ${identifiants}`,
      "content-type": "application/json",
    },
    body: init.corps === undefined ? undefined : JSON.stringify(init.corps),
    cache: "no-store",
  });

  if (!reponse.ok) {
    const detail = await reponse.text().catch(() => "");
    throw new Error(`Klarna ${init.method} ${chemin} : ${reponse.status} ${detail.slice(0, 300)}`);
  }
  return (await reponse.json()) as T;
}

// Crée la session de paiement et renvoie l'adresse de la page Klarna.
// `urlApp` : adresse publique de cette application (retours de Klarna) ;
// `page` : adresse de /paiement/klarna à rouvrir en cas d'annulation.
export async function creerPaiementKlarna(site: SiteKlarna, commande: Commande, urlApp: string, page: string) {
  const paiement = await appelKlarna<{ session_id: string }>("/payments/v1/sessions", {
    method: "POST",
    corps: {
      acquiring_channel: "ECOMMERCE",
      intent: "buy",
      purchase_country: "FR",
      purchase_currency: "EUR",
      locale: "fr-FR",
      order_amount: commande.total,
      order_tax_amount: 0,
      order_lines: commande.lignes,
      merchant_reference1: `${site.id}-${Date.now()}`,
      merchant_reference2: commande.lignes[0].reference,
    },
  });

  const hpp = await appelKlarna<{ session_id: string; redirect_url: string }>("/hpp/v1/sessions", {
    method: "POST",
    corps: {
      payment_session_url: `${urlApi()}/payments/v1/sessions/${paiement.session_id}`,
      merchant_urls: {
        // {{session_id}} est remplacé par Klarna par l'identifiant de la
        // session HPP.
        success: `${urlApp}/api/klarna/retour?site=${encodeURIComponent(site.id)}&sid={{session_id}}`,
        cancel: `${page}&etat=annule`,
        back: `${page}&etat=annule`,
        failure: `${page}&etat=refuse`,
        error: `${page}&etat=erreur`,
      },
      // Commande créée et débitée directement, sans étape de notre côté.
      options: { place_order_mode: "CAPTURE_ORDER", page_title: `${site.nom} — ${commande.titre}` },
    },
  });

  return hpp.redirect_url;
}

// État d'une session HPP (WAITING, IN_PROGRESS, COMPLETED, CANCELLED,
// FAILED, ERROR…). Sert à ne rediriger vers « merci » qu'après un vrai
// paiement.
export async function etatPaiementKlarna(sessionHpp: string) {
  const session = await appelKlarna<{ status?: string; order_id?: string }>(
    `/hpp/v1/sessions/${encodeURIComponent(sessionHpp)}`,
    { method: "GET" },
  );
  return { statut: session.status ?? "INCONNU", commande: session.order_id ?? null };
}
