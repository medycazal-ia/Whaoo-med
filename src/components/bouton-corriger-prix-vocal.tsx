"use client";

import { useState } from "react";
import { parserPrixVocal } from "@/lib/courses/parse-vocal";
import { getSpeechRecognition } from "@/lib/voice/speech-recognition";

/**
 * Petit bouton micro à poser à côté d'un champ prix : permet de corriger
 * un prix (estimé ou saisi) en le disant à voix haute, sans repasser par
 * toute la commande vocale d'ajout d'article.
 */
export function BoutonCorrigerPrixVocal({
  onPrixCorrige,
}: {
  onPrixCorrige: (prix: number) => void;
}) {
  const [ecoute, setEcoute] = useState(false);
  const [nonSupporte, setNonSupporte] = useState(false);

  if (nonSupporte) return null;

  function demarrer() {
    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) {
      setNonSupporte(true);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "fr-FR";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const prix = parserPrixVocal(transcript);
      if (prix !== null) {
        onPrixCorrige(prix);
      }
    };
    recognition.onerror = () => setEcoute(false);
    recognition.onend = () => setEcoute(false);

    setEcoute(true);
    recognition.start();
  }

  return (
    <button
      type="button"
      onClick={demarrer}
      title="Corriger le prix à voix haute"
      aria-label="Corriger le prix à voix haute"
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm ${
        ecoute
          ? "border-tomate bg-tomate/10 text-tomate"
          : "border-ardoise/20 text-ardoise/60 hover:bg-ardoise/5"
      }`}
    >
      🎙️
    </button>
  );
}
