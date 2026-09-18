"use server";

// Solution de repli pour la dictée sur Safari (iOS/iPadOS), qui n'a jamais
// implémenté l'API SpeechRecognition des navigateurs. Le navigateur peut
// tout de même enregistrer l'audio (MediaRecorder, supporté par Safari),
// on l'envoie ici à l'API de transcription d'OpenAI (Whisper), et le texte
// obtenu repasse ensuite par le même analyseur de phrase que la dictée
// native (parserPhraseVocale) — aucune différence pour la suite du flux.
export async function transcrireAudio(formData: FormData): Promise<string> {
  const fichier = formData.get("audio");
  if (!(fichier instanceof File)) {
    throw new Error("Aucun fichier audio reçu");
  }

  const apiFormData = new FormData();
  apiFormData.append("file", fichier);
  apiFormData.append("model", "whisper-1");
  apiFormData.append("language", "fr");

  const reponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: apiFormData,
  });

  if (!reponse.ok) {
    throw new Error(`Échec de la transcription (${reponse.status})`);
  }

  const data = (await reponse.json()) as { text: string };
  return data.text;
}
