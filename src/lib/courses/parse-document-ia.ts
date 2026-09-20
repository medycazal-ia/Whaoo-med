"use server";

// Lecture d'un document (recette, régime, menu de la semaine...) par IA
// (Claude), en complément du parseur par règles (parse-document.ts). Le
// parseur par règles ne reconnaît que des formulations précises ("ou",
// virgule, "/") et une liste figée de formules génériques à ignorer — il
// ne généralise pas à une phrase tournée différemment. Un modèle de
// langage comprend l'intention quelle que soit la formulation (choix
// alternatifs, instructions de préparation à ignorer, etc.).
// Réutilise la même clé que la lecture de ticket (ANTHROPIC_TICKET_API_KEY) :
// même compte Anthropic, pas de configuration supplémentaire à demander.
const ENDPOINT = "https://api.anthropic.com/v1/messages";
const MODELE = "claude-sonnet-5";

export type IngredientClaude = { label: string; quantity: number; detail: string | null };

export type ResultatDocumentClaude =
  | { ok: true; items: IngredientClaude[]; nomSuggere: string | null }
  | { ok: false; raison: "pas_de_cle" | "erreur_api" | "aucun_article"; details?: string };

const PROMPT_SYSTEME = `Tu lis un document collé par un utilisateur d'une application de liste de courses. Le document peut être n'importe quoi qui mentionne des articles à acheter : une recette, un menu de la semaine, un régime alimentaire, mais aussi une liste de courses classique, une liste de fournitures, un mot laissé par quelqu'un ("prends du pain et des piles en rentrant"), ou tout autre texte listant des choses à acheter — alimentaire ou non (produits ménagers, hygiène, papeterie, bricolage, etc.). Ton but : en extraire UNIQUEMENT les articles à acheter, jamais autre chose.

Règles :
1. Si une partie du texte présente plusieurs choix pour une même ligne — quelle que soit la façon dont c'est écrit : "ou", "soit... soit", "au choix entre", une liste séparée par virgules ou barres obliques, etc. — crée UN ARTICLE DISTINCT PAR ALTERNATIVE. Exemple : "potage ou carotte, ou miel/fromage/yaourt" donne 5 articles (potage, carotte, miel, fromage, yaourt).
2. N'invente jamais un article à partir de texte qui n'en nomme pas un précisément : titres de jour ("Dimanche"), noms de repas ("Midi", "Soir", "Collation"), instructions de préparation ("faire cuire 10 minutes", "mélanger", "servir chaud"), remarques génériques ("au choix", "selon le goût", "autres alternatives", "à volonté", "en accompagnement"), notes ou commentaires qui ne nomment pas un produit précis. Ignore-les silencieusement.
3. Reconnais le format "Nom du plat (ingrédient 1, ingrédient 2, ...)" : suggère le nom du plat comme nom de liste, et donne un article par ingrédient de la parenthèse.
4. Pour chaque article, sépare la quantité numérique du nom quand elle est donnée (ex. "3 œufs" → label "œufs", quantity 3). Sans quantité précisée, quantity vaut 1. "detail" sert à une unité/précision non numérique (ex. "200g", "1 sachet") — sinon null.

Réponds UNIQUEMENT avec un objet JSON, sans aucun texte autour, exactement dans ce format :
{"items": [{"label": "farine", "quantity": 1, "detail": "200g"}, {"label": "œufs", "quantity": 3, "detail": null}], "nomSuggere": "Nom du plat ou null"}

Si vraiment aucun article n'est identifiable dans le texte, réponds {"items": [], "nomSuggere": null}.`;

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

type ContenuMessage =
  | string
  | ({ type: "image"; source: { type: "base64"; media_type: string; data: string } } | { type: "text"; text: string })[];

async function appellerClaudeDocument(contenu: ContenuMessage): Promise<ResultatDocumentClaude> {
  const cle = process.env.ANTHROPIC_TICKET_API_KEY;
  if (!cle) {
    return { ok: false, raison: "pas_de_cle" };
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
        max_tokens: 4096,
        system: PROMPT_SYSTEME,
        messages: [{ role: "user", content: contenu }],
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

  if (typeof brut !== "object" || brut === null || !Array.isArray((brut as { items?: unknown }).items)) {
    return { ok: false, raison: "erreur_api", details: "Réponse JSON invalide" };
  }

  const brutType = brut as { items: unknown[]; nomSuggere?: unknown };

  const items: IngredientClaude[] = [];
  for (const item of brutType.items) {
    if (typeof item !== "object" || item === null) continue;
    const { label, quantity, detail } = item as { label?: unknown; quantity?: unknown; detail?: unknown };
    if (typeof label !== "string" || !label.trim()) continue;
    const quantiteNum = typeof quantity === "number" && Number.isFinite(quantity) ? Math.max(1, Math.round(quantity)) : 1;
    items.push({
      label: label.trim(),
      quantity: quantiteNum,
      detail: typeof detail === "string" && detail.trim() ? detail.trim() : null,
    });
  }

  if (items.length === 0) {
    return { ok: false, raison: "aucun_article" };
  }

  const nomSuggere = typeof brutType.nomSuggere === "string" && brutType.nomSuggere.trim() ? brutType.nomSuggere.trim() : null;

  return { ok: true, items, nomSuggere };
}

export async function analyserDocumentClaude(texteDocument: string): Promise<ResultatDocumentClaude> {
  if (!texteDocument.trim()) {
    return { ok: false, raison: "aucun_article" };
  }
  return appellerClaudeDocument(texteDocument.slice(0, 20000));
}

// Lecture d'une photo (liste de courses manuscrite, capture d'écran de
// SMS/notes, page d'un carnet, etc.) — même moteur que la lecture de
// texte, avec une image en entrée au lieu d'un texte collé.
export async function analyserDocumentPhotoClaude(formData: FormData): Promise<ResultatDocumentClaude> {
  const fichier = formData.get("document");
  if (!(fichier instanceof File)) {
    return { ok: false, raison: "erreur_api", details: "Aucune image reçue" };
  }

  const buffer = await fichier.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mediaType = fichier.type || "image/jpeg";

  return appellerClaudeDocument([
    { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
    { type: "text", text: "Voici la photo à analyser." },
  ]);
}
