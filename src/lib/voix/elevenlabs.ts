"use server";

// Synthèse vocale (voix humaine) via l'API ElevenLabs, utilisée pour dire
// "Bonjour {prénom}" à la connexion et "Au revoir {prénom}" à la
// déconnexion. Le prénom change à chaque appel, donc impossible de
// pré-enregistrer le son à l'avance : chaque phrase est générée à la volée.
// Nécessite ELEVENLABS_API_KEY ; tant qu'elle n'est pas configurée,
// genererVoix renvoie null et l'appelant reste silencieux (pas d'erreur
// visible pour l'utilisateur).
const ENDPOINT_BASE = "https://api.elevenlabs.io/v1/text-to-speech";
const VOIX_PAR_DEFAUT = "21m00Tcm4TlvDq8ikWAM";

export async function genererVoix(texte: string): Promise<ArrayBuffer | null> {
  const cle = process.env.ELEVENLABS_API_KEY;
  if (!cle) return null;

  const voixId = process.env.ELEVENLABS_VOICE_ID || VOIX_PAR_DEFAUT;

  let reponse: Response;
  try {
    reponse = await fetch(`${ENDPOINT_BASE}/${voixId}`, {
      method: "POST",
      headers: {
        "xi-api-key": cle,
        "content-type": "application/json",
        accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: texte,
        // Seul modèle ElevenLabs à bien gérer le français ; les modèles
        // "anglais uniquement" prononcent les prénoms français de travers.
        model_id: "eleven_multilingual_v2",
      }),
    });
  } catch {
    return null;
  }

  if (!reponse.ok) return null;

  return reponse.arrayBuffer();
}
