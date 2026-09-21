"use client";

import { useState } from "react";
import { FAQ, chercherFaq, type QuestionFaq } from "@/lib/faq";
import { getSpeechRecognition } from "@/lib/voice/speech-recognition";

const EMAIL_CONTACT = "contact@medy.site";
const EMAIL_SUGGESTIONS = "suggestions@whaoo.site";

/**
 * Lien discret proposé sous chaque réponse de la FAQ, pour que
 * l'utilisateur puisse aller plus loin s'il n'est pas satisfait.
 */
function RelanceAide() {
  return (
    <p className="mt-2 text-xs text-ardoise/60">
      Pas satisfait de cette réponse ?{" "}
      <a
        href={`mailto:${EMAIL_CONTACT}`}
        className="font-medium text-basilic underline underline-offset-2"
      >
        Contacte le fondateur
      </a>
      .
    </p>
  );
}

export function FaqPanel({ onFermer }: { onFermer: () => void }) {
  const [recherche, setRecherche] = useState("");
  const [ouverte, setOuverte] = useState<QuestionFaq | null>(null);
  const [ecoute, setEcoute] = useState(false);

  const resultat = recherche.trim() ? chercherFaq(recherche) : null;

  function dicterQuestion() {
    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) return;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "fr-FR";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setRecherche(transcript);
      const trouvee = chercherFaq(transcript);
      if (trouvee) setOuverte(trouvee);
    };
    recognition.onerror = () => setEcoute(false);
    recognition.onend = () => setEcoute(false);
    setEcoute(true);
    recognition.start();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ardoise/40 sm:items-center"
      onClick={onFermer}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-craie sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ardoise/10 bg-ardoise px-4 py-3">
          <h2 className="font-heading text-lg font-semibold text-craie">
            ❓ Besoin d&apos;aide ?
          </h2>
          <button
            type="button"
            onClick={onFermer}
            aria-label="Fermer"
            className="rounded-lg px-2 py-1 text-craie hover:bg-craie/10"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2 border-b border-ardoise/10 p-3">
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Pose ta question…"
            className="flex-1 rounded-lg border border-ardoise/20 px-3 py-2 text-sm text-ardoise"
          />
          <button
            type="button"
            onClick={dicterQuestion}
            title="Poser la question à voix haute"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm ${
              ecoute ? "border-tomate bg-tomate/10 text-tomate" : "border-ardoise/20 text-ardoise/60"
            }`}
          >
            🎙️
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {recherche.trim() && (
            <div className="mb-3 rounded-xl border border-basilic/40 bg-basilic/10 p-3">
              {resultat ? (
                <>
                  <p className="text-sm font-semibold text-ardoise">{resultat.question}</p>
                  <p className="mt-1 text-sm text-ardoise/80">{resultat.reponse}</p>
                </>
              ) : (
                <p className="text-sm text-ardoise/80">
                  Aucune réponse trouvée dans la FAQ pour cette question.
                </p>
              )}
              <RelanceAide />
            </div>
          )}

          <ul className="flex flex-col divide-y divide-ardoise/10">
            {FAQ.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setOuverte(ouverte?.id === item.id ? null : item)}
                  className="w-full py-2.5 text-left text-sm text-ardoise"
                >
                  {item.question}
                </button>
                {ouverte?.id === item.id && (
                  <div className="pb-2.5">
                    <p className="text-sm text-ardoise/70">{item.reponse}</p>
                    <RelanceAide />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2 border-t border-ardoise/10 bg-white p-3">
          <a
            href={`mailto:${EMAIL_SUGGESTIONS}?subject=${encodeURIComponent("Suggestions Whaoo")}`}
            className="rounded-lg bg-basilic px-4 py-2 text-center text-sm font-medium text-craie hover:opacity-90"
          >
            ✉️ Envoyer une suggestion
          </a>
          <a
            href={`mailto:${EMAIL_CONTACT}`}
            className="rounded-lg border border-ardoise/20 px-4 py-2 text-center text-sm text-ardoise hover:bg-ardoise/5"
          >
            Contacter le fondateur
          </a>
        </div>
      </div>
    </div>
  );
}
