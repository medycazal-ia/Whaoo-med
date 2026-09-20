"use client";

import { useState } from "react";
import { nomSessionParDefaut } from "@/lib/courses/session";
import { getSpeechRecognition } from "@/lib/voice/speech-recognition";

/**
 * "Budget immédiat" : la session de courses en cours (distincte du budget
 * mensuel), à laquelle sont rattachés les achats validés — coche d'un
 * article, scan de ticket, dictée. Un titre avec la date du jour est
 * proposé automatiquement ; l'utilisateur peut le changer en cliquant
 * (texte) ou en dictant (micro), ou repartir sur une nouvelle session
 * (utile pour un deuxième passage en caisse le même jour, qui reçoit
 * alors l'heure pour rester identifiable).
 */
export function BudgetImmediat({
  valeur,
  onChanger,
  sessionsRecentes = [],
}: {
  valeur: string;
  onChanger: (nom: string) => void;
  sessionsRecentes?: string[];
}) {
  const [edition, setEdition] = useState(false);
  const [texte, setTexte] = useState(valeur);
  const [ecoute, setEcoute] = useState(false);

  function valider() {
    const nom = texte.trim();
    onChanger(nom || nomSessionParDefaut());
    setEdition(false);
  }

  function dicterNom() {
    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) return;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "fr-FR";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      if (transcript) onChanger(transcript);
      setEcoute(false);
    };
    recognition.onerror = () => setEcoute(false);
    recognition.onend = () => setEcoute(false);
    setEcoute(true);
    recognition.start();
  }

  const autresSessions = sessionsRecentes.filter((nom) => nom !== valeur);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-ardoise/10 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-ardoise/50">🛍️ Budget immédiat</p>
        <button
          type="button"
          onClick={() => onChanger(nomSessionParDefaut(new Date(), true))}
          className="text-xs text-basilic underline"
          title="Démarrer une nouvelle session de courses"
        >
          + Nouvelle session
        </button>
      </div>

      {edition ? (
        <div className="flex items-center gap-1.5">
          <input
            autoFocus
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") valider();
              if (e.key === "Escape") {
                setTexte(valeur);
                setEdition(false);
              }
            }}
            className="flex-1 rounded-lg border border-ardoise/20 px-2 py-1 text-sm text-ardoise"
          />
          <button
            type="button"
            onClick={valider}
            className="rounded-lg bg-basilic px-2 py-1 text-xs font-medium text-craie"
          >
            OK
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setTexte(valeur);
              setEdition(true);
            }}
            className="flex-1 truncate rounded-lg border border-ardoise/20 px-2 py-1 text-left text-sm text-ardoise"
            title="Cliquer pour renommer cette session"
          >
            {valeur}
          </button>
          <button
            type="button"
            onClick={dicterNom}
            title="Nommer cette session à voix haute"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm ${
              ecoute ? "border-tomate bg-tomate/10 text-tomate" : "border-ardoise/20 text-ardoise/60"
            }`}
          >
            🎙️
          </button>
        </div>
      )}

      {autresSessions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-ardoise/40">Aujourd&apos;hui :</span>
          {autresSessions.map((nom) => (
            <button
              key={nom}
              type="button"
              onClick={() => onChanger(nom)}
              className="rounded-full bg-ardoise/5 px-2 py-0.5 text-[11px] text-ardoise/70 hover:bg-ardoise/10"
            >
              {nom}
            </button>
          ))}
        </div>
      )}

      <p className="text-[11px] text-ardoise/40">
        Chaque achat validé (case cochée, ticket scanné, dicté) sera rattaché à
        cette session, pour la retrouver facilement sur ta facture du mois.
      </p>
    </div>
  );
}
