"use client";

import { useRef, useState } from "react";
import { parserPhraseVocale } from "@/lib/courses/parse-vocal";
import {
  estimerPrix,
  LABEL_SOURCE_PRIX,
  type IndexCommunautaire,
  type SourcePrix,
} from "@/lib/prix-estimes";
import { getSpeechRecognition, type SpeechRecognitionLike } from "@/lib/voice/speech-recognition";
import { BoutonCorrigerPrixVocal } from "@/components/bouton-corriger-prix-vocal";

export function SaisieVocale({
  ajouterArticleAction,
  definirBudgetAction,
  indexCommunautaire,
  proposerPartage = false,
  onAide,
}: {
  ajouterArticleAction: (formData: FormData) => Promise<void>;
  definirBudgetAction: (formData: FormData) => Promise<void>;
  indexCommunautaire?: IndexCommunautaire;
  proposerPartage?: boolean;
  onAide?: () => void;
}) {
  const [ecoute, setEcoute] = useState(false);
  const [brouillon, setBrouillon] = useState<{
    label: string;
    price: number;
    quantity: number;
    status: "achete" | "a_acheter";
  } | null>(null);
  const [budgetDicte, setBudgetDicte] = useState<number | null>(null);
  const [sourcePrix, setSourcePrix] = useState<SourcePrix | null>(null);
  const [nonSupporte, setNonSupporte] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const priceRef = useRef<HTMLInputElement>(null);

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
      if (/\baide\b/i.test(transcript)) {
        onAide?.();
        return;
      }
      const commande = parserPhraseVocale(transcript);
      if (commande.type === "budget") {
        setBudgetDicte(commande.montant);
      } else {
        const article = commande.article;
        if (article.price === 0) {
          const estimation = estimerPrix(article.label, indexCommunautaire);
          if (estimation !== null) {
            article.price = estimation.prix;
            setSourcePrix(estimation.source);
          }
        }
        setBrouillon({ ...article, status: "a_acheter" });
      }
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

  if (budgetDicte !== null) {
    return (
      <form
        action={definirBudgetAction}
        className="flex flex-col gap-2 rounded-xl border border-ambre/40 bg-ambre/10 p-4"
        onSubmit={() => setBudgetDicte(null)}
      >
        <p className="text-xs font-medium text-ambre">
          Confirme le nouveau budget du mois
        </p>
        <input
          name="budgetAmount"
          type="number"
          step="0.01"
          min={0}
          defaultValue={budgetDicte}
          className="rounded-lg border border-ardoise/20 bg-white px-3 py-2 text-ardoise"
        />
        <div className="flex gap-2">
          <button type="submit" className="flex-1 rounded-lg bg-basilic px-3 py-2 font-medium text-craie">
            Confirmer
          </button>
          <button
            type="button"
            onClick={() => setBudgetDicte(null)}
            className="rounded-lg border border-ardoise/20 px-3 py-2 text-ardoise"
          >
            Annuler
          </button>
        </div>
      </form>
    );
  }

  if (brouillon) {
    return (
      <form
        action={ajouterArticleAction}
        className="flex flex-col gap-2 rounded-xl border border-ambre/40 bg-ambre/10 p-4"
        onSubmit={() => {
          setBrouillon(null);
          setSourcePrix(null);
        }}
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
          <div className="flex flex-col gap-1">
            <div className="flex gap-1">
              <input
                ref={priceRef}
                name="price"
                type="number"
                step="0.01"
                defaultValue={brouillon.price}
                onChange={() => setSourcePrix(null)}
                className="w-24 rounded-lg border border-ardoise/20 bg-white px-3 py-2 text-ardoise"
              />
              <BoutonCorrigerPrixVocal
                onPrixCorrige={(prix) => {
                  if (priceRef.current) priceRef.current.value = String(prix);
                  setSourcePrix(null);
                }}
              />
            </div>
            {sourcePrix && (
              <span className="text-xs text-ardoise/50">{LABEL_SOURCE_PRIX[sourcePrix]}</span>
            )}
          </div>
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
        <input type="hidden" name="prixSource" value={sourcePrix ?? "manuel"} />

        {proposerPartage && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-ardoise/70">
            <input
              name="enseigne"
              placeholder="Enseigne (optionnel)"
              className="rounded-lg border border-ardoise/20 bg-white px-2 py-1 text-ardoise"
            />
            <label className="flex items-center gap-1.5">
              <input type="checkbox" name="partagerPrix" />
              Partager ce prix (anonyme) pour aider les estimations
            </label>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-basilic px-3 py-2 font-medium text-craie"
          >
            Confirmer
          </button>
          <button
            type="button"
            onClick={() => {
              setBrouillon(null);
              setSourcePrix(null);
            }}
            className="rounded-lg border border-ardoise/20 px-3 py-2 text-ardoise"
          >
            Annuler
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={demarrerEcoute}
        className="flex items-center justify-center gap-2 rounded-xl border border-ardoise/20 bg-white px-4 py-3 font-medium text-ardoise hover:bg-ardoise/5"
      >
        {ecoute ? "Je t'écoute…" : "🎙️ Dicter un article"}
      </button>
      <p className="text-xs text-ardoise/50">
        Fonctionne aussi pour le budget (« budget du mois 250 euros ») et
        pour l&apos;aide (« aide moi »)
      </p>
    </div>
  );
}
