"use server";

// Lecture de ticket de caisse via l'API vision de Claude (Anthropic). Un
// modèle de vision généraliste comme Claude lit en général très bien du
// texte flou/mal cadré, et le prompt est directement ajustable ici si
// besoin, sans dépendre d'un tableau de bord externe. Nécessite
// ANTHROPIC_TICKET_API_KEY ; tant qu'elle n'est pas configurée,
// analyserTicketClaude renvoie { ok: false, raison: "pas_de_cle" } et
// l'appelant retombe sur l'OCR local (Tesseract).
const ENDPOINT = "https://api.anthropic.com/v1/messages";
// Sonnet plutôt que Haiku : la précision (nom ET prix corrects) est
// critique pour la confiance des utilisateurs sur cette fonctionnalité —
// le coût par ticket scanné reste très faible en valeur absolue.
const MODELE = "claude-sonnet-5";

export type LigneClaude = { label: string; price: number };

export type ResultatClaude =
  | { ok: true; lignes: LigneClaude[] }
  | { ok: false; raison: "pas_de_cle" | "erreur_api" | "aucun_article"; details?: string };

const PROMPT = `Tu lis un ticket de caisse français pour une application où une erreur de nom ou de prix ferait immédiatement perdre confiance à l'utilisateur. La précision prime sur la vitesse — procède en deux étapes, dans cet ordre.

ÉTAPE 1 — Transcription brute : recopie, ligne par ligne, EXACTEMENT ce qui est imprimé dans le tableau d'articles (nom, quantité, prix unitaire, montant), sans en sauter aucune. Ne remplace jamais un mot imprimé par un autre mot plausible ou plus courant qui lui ressemble (par exemple, si le ticket imprime "GIGOT", n'écris jamais "PAIN" même si "pain" semble plus fréquent dans un supermarché). Si une lettre est vraiment illisible, mets un "?" à sa place plutôt que de deviner un mot entier différent.

ÉTAPE 2 — Résultat structuré : à partir UNIQUEMENT de ta transcription de l'étape 1 (ne réinterprète pas depuis l'image à ce stade), donne le résultat final précédé exactement de la ligne "RESULTAT_JSON:" (rien d'autre sur cette ligne), suivie d'un tableau JSON :
RESULTAT_JSON:
[{"label": "nom de l'article", "price": 4.3}, {"label": "autre article", "price": 2.16}]

Règles du JSON final :
- "label" : le nom exactement comme transcrit à l'étape 1.
- "price" : le prix FINAL de la ligne (colonne montant, pas le prix unitaire s'ils diffèrent), en nombre décimal exact.
- Ignore les lignes de total, sous-total, TVA, mode de paiement, monnaie rendue, coordonnées du magasin et messages de fin de ticket.
- Si vraiment aucun article n'est lisible sur la photo, le tableau est vide : [].`;

function extraireJson(texte: string): unknown {
  const marqueur = "RESULTAT_JSON:";
  const indexMarqueur = texte.indexOf(marqueur);
  const apresMarqueur = indexMarqueur !== -1 ? texte.slice(indexMarqueur + marqueur.length) : texte;

  const nettoye = apresMarqueur
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  const debut = nettoye.indexOf("[");
  const fin = nettoye.lastIndexOf("]");
  const tableau = debut !== -1 && fin > debut ? nettoye.slice(debut, fin + 1) : nettoye;

  return JSON.parse(tableau);
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
        max_tokens: 2048,
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
    return { ok: false, raison: "erreur_api", details: `JSON invalide : ${bloc.text.slice(-300)}` };
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
