"use client";

import { useRef, useState } from "react";
import { parserPhraseVocale } from "@/lib/courses/parse-vocal";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function SaisieVocale({
  ajouterArticleAction,
}: {
  ajouterArticleAction: (formData: FormData) => Promise<void>;
}) {
  const [ecoute, setEcoute] = useState(false);
  const [brouillon, setBrouillon] = useState<{
    label: string;
    price: number;
    quantity: number;
    status: "achete" | "a_acheter";
  } | null>(null);
  const [nonSupporte, setNonSupporte] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  function demarrerEcoute() {
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
      const parsed = parserPhraseVocale(transcript);
      setBrouillon({ ...parsed, status: "a_acheter" });
    };
    recognition.onerror = () => setEcoute(false);
    recognition.onend = () => setEcoute(false);

    recognitionRef.current = recognition;
    setEcoute(true);
    recognition.start();
  }

  if (nonSupporte) {
    return (
      <p className="text-sm text-ardoise/60">
        La saisie vocale n&apos;est pas disponible sur ce navigateur — utilise
        la saisie manuelle ci-dessous.
      </p>
    );
  }

  if (brouillon) {
    return (
      <form
        action={ajouterArticleAction}
        className="flex flex-col gap-2 rounded-xl border border-ambre/40 bg-ambre/10 p-4"
        onSubmit={() => setBrouillon(null)}
      >
        <p className="text-xs font-medium text-ambre">
          Vérifie avant d&apos;enregistrer — la reconnaissance vocale n&apos;est
          jamais fiable à 100 %
        </p>
        <input
          name="label"
          defaultValue={brouillon.label}
          className="rounded-lg border border-ardoise/20 bg-white px-3 py-2 text-ardoise"
        />
        <div className="flex gap-2">
          <input
            name="price"
            type="number"
            step="0.01"
            defaultValue={brouillon.price}
            className="w-24 rounded-lg border border-ardoise/20 bg-white px-3 py-2 text-ardoise"
          />
          <input
            name="quantity"
            type="number"
            min={1}
            defaultValue={brouillon.quantity}
            className="w-20 rounded-lg border border-ardoise/20 bg-white px-3 py-2 text-ardoise"
          />
          <select
            name="status"
            defaultValue={brouillon.status}
            className="flex-1 rounded-lg border border-ardoise/20 bg-white px-3 py-2 text-ardoise"
          >
            <option value="a_acheter">À acheter plus tard</option>
            <option value="achete">Déjà acheté</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-basilic px-3 py-2 font-medium text-craie"
          >
            Confirmer
          </button>
          <button
            type="button"
            onClick={() => setBrouillon(null)}
            className="rounded-lg border border-ardoise/20 px-3 py-2 text-ardoise"
          >
            Annuler
          </button>
        </div>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={demarrerEcoute}
      className="flex items-center justify-center gap-2 rounded-xl border border-ardoise/20 bg-white px-4 py-3 font-medium text-ardoise hover:bg-ardoise/5"
    >
      {ecoute ? "Je t'écoute…" : "🎙️ Dicter un article"}
    </button>
  );
}
