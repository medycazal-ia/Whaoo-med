"use server";

// Lecture de ticket de caisse via l'API vision de Claude (Anthropic) —
// alternative à Mindee, dont le débogage s'est avéré long et opaque
// (service tiers non testable depuis l'environnement de développement).
// Un modèle de vision généraliste comme Claude lit en général très bien
// du texte flou/mal cadré, et le prompt est directement ajustable ici si
// besoin, sans dépendre d'un tableau de bord externe. Nécessite
// ANTHROPIC_TICKET_API_KEY ; tant qu'elle n'est pas configurée,
// analyserTicketClaude renvoie { ok: false, raison: "pas_de_cle" } et
// l'appelant retombe sur Mindee puis, en dernier recours, sur l'OCR local
// (Tesseract).
const ENDPOINT = "https://api.anthropic.com/v1/messages";
const MODELE = "claude-haiku-4-5-20251001";

export type LigneClaude = { label: string; price: number };

export type ResultatClaude =
  | { ok: true; lignes: LigneClaude[] }
  | { ok: false; raison: "pas_de_cle" | "erreur_api" | "aucun_article"; details?: string };

const PROMPT = `Tu regardes la photo d'un ticket de caisse français. Extrais chaque article acheté avec son prix final (en euros), en ignorant les lignes de total, sous-total, TVA, mode de paiement, monnaie rendue, coordonnées du magasin et messages de fin de ticket.

Réponds UNIQUEMENT avec un tableau JSON, sans aucun texte ni explication autour, exactement dans ce format :
[{"label": "nom de l'article", "price": 4.3}, {"label": "autre article", "price": 2.16}]

Si le prix exact d'un article est difficile à lire, fais ta meilleure estimation à partir du contexte (colonnes quantité / prix unitaire / montant) plutôt que d'omettre l'article. Si vraiment aucun article n'est lisible sur la photo, réponds [].`;

function extraireJson(texte: string): unknown {
  const nettoye = texte
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  return JSON.parse(nettoye);
}

export async function analyserTicketClaude(formData: FormData): Promise<ResultatClaude> {
  const cle = process.env.ANTHROPIC_TICKET_API_KEY;
  if (!cle) {
    return { ok: false, raison: "pas_de_cle" };
  }

  const fichier = formData.get("ticket");
  if (!(fichier instanceof File)) {
    return { ok: false, raison: "erreur_api", details: "Aucune image reçue" };
  }

  const buffer = await fichier.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mediaType = fichier.type || "image/jpeg";

  // Une clé API organisation (par opposition à une clé rattachée à un
  // workspace précis) exige cet en-tête supplémentaire, sans quoi
  // l'API répond 400 "not scoped to a workspace" — observé en test réel.
  const workspaceId = process.env.ANTHROPIC_TICKET_WORKSPACE_ID;

  let reponse: Response;
  try {
    reponse = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "x-api-key": cle,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        ...(workspaceId ? { "anthropic-workspace-id": workspaceId } : {}),
      },
      body: JSON.stringify({
        model: MODELE,
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
              { type: "text", text: PROMPT },
            ],
          },
        ],
      }),
    });
  } catch (erreur) {
    return {
      ok: false,
      raison: "erreur_api",
      details: erreur instanceof Error ? erreur.message : String(erreur),
    };
  }

  const data = (await reponse.json().catch(() => null)) as {
    content?: { type: string; text?: string }[];
    error?: { message?: string };
  } | null;

  if (!reponse.ok) {
    return {
      ok: false,
      raison: "erreur_api",
      details: `HTTP ${reponse.status}${data?.error?.message ? ` — ${data.error.message}` : ""}`,
    };
  }

  const bloc = data?.content?.find((c) => c.type === "text");
  if (!bloc?.text) {
    return { ok: false, raison: "erreur_api", details: "Réponse sans texte" };
  }

  let brut: unknown;
  try {
    brut = extraireJson(bloc.text);
  } catch {
    return { ok: false, raison: "erreur_api", details: `JSON invalide : ${bloc.text.slice(0, 200)}` };
  }

  if (!Array.isArray(brut)) {
    return { ok: false, raison: "erreur_api", details: "Réponse JSON pas un tableau" };
  }

  const lignes: LigneClaude[] = [];
  for (const item of brut) {
    if (typeof item !== "object" || item === null) continue;
    const { label, price } = item as { label?: unknown; price?: unknown };
    if (typeof label !== "string" || !label.trim()) continue;
    if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) continue;
    lignes.push({ label: label.trim(), price });
  }

  if (lignes.length === 0) {
    return { ok: false, raison: "aucun_article" };
  }

  return { ok: true, lignes };
}
