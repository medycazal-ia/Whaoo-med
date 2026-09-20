"use server";

// Lecture de ticket de caisse via l'API Receipt OCR de Mindee, spécialisée
// dans les tickets (contrairement à Tesseract, un OCR généraliste tournant
// dans le navigateur, dont la résolution effective d'une photo de ticket
// "normale" reste souvent trop juste pour le petit texte du tableau
// d'articles — voir redimensionner-image.ts). Nécessite MINDEE_API_KEY ;
// tant qu'elle n'est pas configurée, analyserTicketMindee renvoie
// { ok: false, raison: "pas_de_cle" } et l'appelant retombe sur Tesseract.
const ENDPOINT = "https://api.mindee.net/v1/products/mindee/expense_receipts/v5/predict";

export type LigneMindee = { label: string; price: number };

export type ResultatMindee =
  | { ok: true; lignes: LigneMindee[] }
  | { ok: false; raison: "pas_de_cle" | "erreur_api" | "aucun_article"; details?: string };

type MindeeLineItem = {
  description?: string | null;
  total_amount?: number | null;
  unit_price?: number | null;
  quantity?: number | null;
};

type MindeeReponse = {
  document?: {
    inference?: {
      prediction?: {
        line_items?: MindeeLineItem[];
      };
    };
  };
  api_request?: {
    error?: { message?: string };
  };
};

export async function analyserTicketMindee(formData: FormData): Promise<ResultatMindee> {
  const cle = process.env.MINDEE_API_KEY;
  if (!cle) {
    return { ok: false, raison: "pas_de_cle" };
  }

  const fichier = formData.get("ticket");
  if (!(fichier instanceof File)) {
    return { ok: false, raison: "erreur_api", details: "Aucune image reçue" };
  }

  const apiFormData = new FormData();
  apiFormData.append("document", fichier);

  let reponse: Response;
  try {
    reponse = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Token ${cle}` },
      body: apiFormData,
    });
  } catch (erreur) {
    return {
      ok: false,
      raison: "erreur_api",
      details: erreur instanceof Error ? erreur.message : String(erreur),
    };
  }

  const data = (await reponse.json().catch(() => null)) as MindeeReponse | null;

  if (!reponse.ok) {
    return {
      ok: false,
      raison: "erreur_api",
      details: `HTTP ${reponse.status}${data?.api_request?.error?.message ? ` — ${data.api_request.error.message}` : ""}`,
    };
  }

  const items = data?.document?.inference?.prediction?.line_items ?? [];

  const lignes: LigneMindee[] = [];
  for (const item of items) {
    const label = typeof item.description === "string" ? item.description.trim() : "";
    if (!label) continue;

    const price =
      typeof item.total_amount === "number"
        ? item.total_amount
        : typeof item.unit_price === "number" && typeof item.quantity === "number"
          ? item.unit_price * item.quantity
          : null;
    if (price === null || !Number.isFinite(price) || price <= 0) continue;

    lignes.push({ label, price });
  }

  if (lignes.length === 0) {
    return { ok: false, raison: "aucun_article" };
  }

  return { ok: true, lignes };
}
