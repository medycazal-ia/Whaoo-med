"use client";

import { useRef, useState } from "react";
import { parserPhraseVocale } from "@/lib/courses/parse-vocal";
import { analyserPhraseVocaleClaude } from "@/lib/courses/parse-vocal-ia";
import {
  estimerPrix,
  LABEL_SOURCE_PRIX,
  type IndexCommunautaire,
  type SourcePrix,
} from "@/lib/prix-estimes";
import { getSpeechRecognition, type SpeechRecognitionLike } from "@/lib/voice/speech-recognition";
import { transcrireAudio } from "@/lib/voice/transcription";
import { BoutonCorrigerPrixVocal } from "@/components/bouton-corriger-prix-vocal";

// Une phrase dictée qui semble énumérer plusieurs articles (connecteurs
// "et"/virgule + assez de mots pour que ce ne soit pas juste "3 œufs")
// n'est pas fiable avec le parseur par règles ci-dessous, qui ne
// reconnaît qu'un seul article par phrase. On ne fait alors appel à
// Claude que pour CE cas précis — la grande majorité des dictées courtes
// ("2 yaourts à 1 euro 50") restent instantanées et gratuites.
function semblePlusieursArticles(phrase: string): boolean {
  return /\bet\b|,/i.test(phrase) && phrase.trim().split(/\s+/).length > 4;
}

const MIME_TYPES_CANDIDATS = ["audio/webm", "audio/mp4", "audio/ogg"];
const DUREE_MAX_ENREGISTREMENT_MS = 15000;

function choisirMimeType(): string {
  for (const type of MIME_TYPES_CANDIDATS) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "";
}

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
  // Plusieurs articles détectés dans une seule phrase dictée (via Claude,
  // en secours des règles simples — voir semblePlusieursArticles) :
  // confirmation simplifiée en liste, séparée du formulaire riche à un
  // seul article ci-dessus (prix/quantité/statut détaillés) qui reste le
  // chemin normal, instantané et gratuit, pour l'immense majorité des
  // dictées courtes.
  const [brouillonsMultiples, setBrouillonsMultiples] = useState<
    { label: string; price: number; quantity: number; inclure: boolean }[] | null
  >(null);
  const [analyseVocaleIA, setAnalyseVocaleIA] = useState(false);
  const [budgetDicte, setBudgetDicte] = useState<number | null>(null);
  const [sourcePrix, setSourcePrix] = useState<SourcePrix | null>(null);
  const [nonSupporte, setNonSupporte] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const priceRef = useRef<HTMLInputElement>(null);

  // Solution de repli pour Safari (iOS/iPadOS), qui n'implémente pas
  // SpeechRecognition mais sait très bien enregistrer de l'audio.
  const [enregistrement, setEnregistrement] = useState(false);
  const [transcriptionEnCours, setTranscriptionEnCours] = useState(false);
  const [erreurAudio, setErreurAudio] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function traiterTranscription(transcript: string) {
    if (/\baide\b/i.test(transcript)) {
      onAide?.();
      return;
    }
    const commande = parserPhraseVocale(transcript);
    if (commande.type === "budget") {
      setBudgetDicte(commande.montant);
      return;
    }

    if (semblePlusieursArticles(transcript)) {
      setAnalyseVocaleIA(true);
      try {
        const resultatIA = await analyserPhraseVocaleClaude(transcript);
        if (resultatIA.ok) {
          setBrouillonsMultiples(
            resultatIA.articles.map((a) => {
              const article = { ...a };
              if (article.price === 0) {
                const estimation = estimerPrix(article.label, indexCommunautaire);
                if (estimation !== null) article.price = estimation.prix;
              }
              return { ...article, inclure: true };
            }),
          );
          return;
        }
      } finally {
        setAnalyseVocaleIA(false);
      }
      // La reconnaissance par IA n'est pas configurée ou a échoué : on
      // retombe sur le résultat des règles simples ci-dessous, comme si
      // la phrase n'avait jamais semblé contenir plusieurs articles.
    }

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
      traiterTranscription(event.results[0][0].transcript);
    };
    recognition.onerror = () => setEcoute(false);
    recognition.onend = () => setEcoute(false);

    recognitionRef.current = recognition;
    setEcoute(true);
    recognition.start();
  }

  async function demarrerEnregistrementAudio() {
    setErreurAudio(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = choisirMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        setEnregistrement(false);
        setTranscriptionEnCours(true);
        try {
          const extension = mimeType.includes("mp4") ? "mp4" : mimeType.includes("ogg") ? "ogg" : "webm";
          const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
          const formData = new FormData();
          formData.append("audio", blob, `dictee.${extension}`);
          const texte = await transcrireAudio(formData);
          if (!texte.trim()) {
            setErreurAudio("Rien compris — réessaie en parlant bien près du micro.");
          } else {
            traiterTranscription(texte);
          }
        } catch {
          setErreurAudio("La transcription a échoué, réessaie.");
        } finally {
          setTranscriptionEnCours(false);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setEnregistrement(true);

      setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, DUREE_MAX_ENREGISTREMENT_MS);
    } catch {
      setErreurAudio(
        "Impossible d'accéder au micro — vérifie l'autorisation dans les réglages de ton navigateur.",
      );
    }
  }

  function arreterEnregistrementAudio() {
    mediaRecorderRef.current?.stop();
  }

  if (brouillonsMultiples) {
    const nbInclus = brouillonsMultiples.filter((b) => b.inclure).length;
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-ambre/40 bg-ambre/10 p-4">
        <p className="text-xs font-medium text-ambre">
          Plusieurs articles reconnus dans ta phrase — vérifie avant
          d&apos;ajouter :
        </p>
        <ul className="flex flex-col gap-1">
          {brouillonsMultiples.map((b, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-ardoise">
              <input
                type="checkbox"
                checked={b.inclure}
                onChange={(e) =>
                  setBrouillonsMultiples((prev) =>
                    prev!.map((x, j) => (j === i ? { ...x, inclure: e.target.checked } : x)),
                  )
                }
              />
              <input
                value={b.label}
                onChange={(e) =>
                  setBrouillonsMultiples((prev) =>
                    prev!.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)),
                  )
                }
                className="flex-1 rounded border border-ardoise/20 bg-white px-2 py-1"
              />
              <input
                type="number"
                min={1}
                value={b.quantity}
                onChange={(e) =>
                  setBrouillonsMultiples((prev) =>
                    prev!.map((x, j) => (j === i ? { ...x, quantity: Number(e.target.value) || 1 } : x)),
                  )
                }
                className="w-16 rounded border border-ardoise/20 bg-white px-2 py-1"
              />
              <input
                type="number"
                step="0.01"
                value={b.price}
                onChange={(e) =>
                  setBrouillonsMultiples((prev) =>
                    prev!.map((x, j) => (j === i ? { ...x, price: Number(e.target.value) || 0 } : x)),
                  )
                }
                className="w-20 rounded border border-ardoise/20 bg-white px-2 py-1"
              />
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={nbInclus === 0}
            onClick={async () => {
              const selection = brouillonsMultiples.filter((b) => b.inclure);
              for (const item of selection) {
                const formData = new FormData();
                formData.set("label", item.label);
                formData.set("price", String(item.price));
                formData.set("quantity", String(item.quantity));
                formData.set("status", "a_acheter");
                formData.set("prixSource", "manuel");
                await ajouterArticleAction(formData);
              }
              setBrouillonsMultiples(null);
            }}
            className="flex-1 rounded-lg bg-basilic px-3 py-2 font-medium text-craie disabled:opacity-50"
          >
            Ajouter {nbInclus} article{nbInclus > 1 ? "s" : ""}
          </button>
          <button
            type="button"
            onClick={() => setBrouillonsMultiples(null)}
            className="rounded-lg border border-ardoise/20 px-3 py-2 text-ardoise"
          >
            Annuler
          </button>
        </div>
      </div>
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

  if (nonSupporte) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-ambre/40 bg-ambre/10 p-3 text-sm text-ardoise/80">
        <p>
          La dictée intégrée à whaoo n&apos;est pas disponible sur Safari
          (iPhone/iPad) — c&apos;est une limitation d&apos;Apple, pas de
          l&apos;appli.
        </p>

        {erreurAudio && <p className="text-tomate">{erreurAudio}</p>}

        {transcriptionEnCours || analyseVocaleIA ? (
          <p>{analyseVocaleIA ? "Analyse en cours…" : "Transcription en cours…"}</p>
        ) : (
          <button
            type="button"
            onClick={enregistrement ? arreterEnregistrementAudio : demarrerEnregistrementAudio}
            className={`self-start rounded-lg px-4 py-2 font-medium text-craie ${
              enregistrement ? "bg-tomate" : "bg-ardoise hover:bg-ardoise-light"
            }`}
          >
            {enregistrement ? "⏹️ Arrêter et envoyer" : "🎙️ Dicter quand même (via le micro)"}
          </button>
        )}

        <p className="text-xs text-ardoise/60">
          💡 Autre solution : dans le champ « Article » ci-dessous, appuie
          sur le petit micro 🎤 du clavier de ton iPhone/iPad pour dicter —
          le texte s&apos;écrit tout seul.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={demarrerEcoute}
        disabled={analyseVocaleIA}
        className="flex items-center justify-center gap-2 rounded-xl border border-ardoise/20 bg-white px-4 py-3 font-medium text-ardoise hover:bg-ardoise/5 disabled:opacity-50"
      >
        {analyseVocaleIA ? "Analyse en cours…" : ecoute ? "Je t'écoute…" : "🎙️ Dicter un article"}
      </button>
      <p className="text-xs text-ardoise/50">
        Fonctionne aussi pour le budget (« budget du mois 250 euros ») et
        pour l&apos;aide (« aide moi »)
      </p>
    </div>
  );
}
