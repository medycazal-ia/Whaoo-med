"use server";

// Lecture par IA (Claude) d'une phrase dictée, en secours du parseur par
// règles (parse-vocal.ts) — utilisée UNIQUEMENT quand la phrase semble
// contenir plusieurs articles ("ajoute du lait, des pommes et du pain"),
// que les règles simples ne savent pas découper (elles ne gèrent qu'un
// seul article par phrase). La dictée étant le mode de saisie le plus
// utilisé de l'appli, ce recours à l'IA reste l'exception plutôt que la
// règle, pour ne pas ajouter un coût et une latence réseau à chaque
// dictée — voir saisie-vocale.tsx pour l'heuristique de déclenchement.
// Réutilise la même clé que le scan de ticket/document
// (ANTHROPIC_TICKET_API_KEY) : même compte, pas de configuration
// supplémentaire.
const ENDPOINT = "https://api.anthropic.com/v1/messages";
const MODELE = "claude-sonnet-5";

export type ArticleVocalClaude = { label: string; quantity: number; price: number };

export type ResultatVocalClaude =
  | { ok: true; articles: ArticleVocalClaude[] }
  | { ok: false; raison: "pas_de_cle" | "erreur_api" | "aucun_article"; details?: string };

const PROMPT_SYSTEME = `Tu entends une phrase dictée à voix haute par quelqu'un qui fait sa liste de courses. La phrase peut mentionner PLUSIEURS articles à la suite (ex. "ajoute du lait, des pommes et du pain" → 3 articles). Extrait chaque article distinct.

Règles :
1. Ignore les mots de commande qui ne sont pas des articles ("ajoute", "mets", "note", "j'ai besoin de").
2. Pour chaque article : "label" (le nom, sans quantité ni prix), "quantity" (nombre, 1 par défaut si non précisé), "price" (en euros si un prix est mentionné pour cet article précis, sinon 0 — n'invente jamais un prix).
3. Ne crée jamais un article à partir d'un mot qui n'en nomme pas un précisément.

Réponds UNIQUEMENT avec un objet JSON, sans aucun texte autour :
{"articles": [{"label": "lait", "quantity": 1, "price": 0}, {"label": "pommes", "quantity": 1, "price": 0}]}

Si aucun article n'est identifiable, réponds {"articles": []}.`;

function extraireJson(texte: string): unknown {
  const nettoye = texte
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  const debut = nettoye.indexOf("{");
  const fin = nettoye.lastIndexOf("}");
  const objet = debut !== -1 && fin > debut ? nettoye.slice(debut, fin + 1) : nettoye;

  return JSON.parse(objet);
}

export async function analyserPhraseVocaleClaude(phrase: string): Promise<ResultatVocalClaude> {
  const cle = process.env.ANTHROPIC_TICKET_API_KEY;
  if (!cle) {
    return { ok: false, raison: "pas_de_cle" };
  }
  if (!phrase.trim()) {
    return { ok: false, raison: "aucun_article" };
  }

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
        system: PROMPT_SYSTEME,
        messages: [{ role: "user", content: phrase.slice(0, 2000) }],
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
    return { ok: false, raison: "erreur_api", details: `JSON invalide : ${bloc.text.slice(-300)}` };
  }

  if (typeof brut !== "object" || brut === null || !Array.isArray((brut as { articles?: unknown }).articles)) {
    return { ok: false, raison: "erreur_api", details: "Réponse JSON invalide" };
  }

  const articles: ArticleVocalClaude[] = [];
  for (const item of (brut as { articles: unknown[] }).articles) {
    if (typeof item !== "object" || item === null) continue;
    const { label, quantity, price } = item as { label?: unknown; quantity?: unknown; price?: unknown };
    if (typeof label !== "string" || !label.trim()) continue;
    const quantiteNum = typeof quantity === "number" && Number.isFinite(quantity) ? Math.max(1, Math.round(quantity)) : 1;
    const prixNum = typeof price === "number" && Number.isFinite(price) && price > 0 ? price : 0;
    articles.push({ label: label.trim(), quantity: quantiteNum, price: prixNum });
  }

  if (articles.length === 0) {
    return { ok: false, raison: "aucun_article" };
  }

  return { ok: true, articles };
}
