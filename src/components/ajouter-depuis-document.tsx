"use client";

import { useState, type ChangeEvent } from "react";
import { parserDocumentAliments } from "@/lib/courses/parse-document";
import { analyserDocumentClaude, analyserDocumentPhotoClaude } from "@/lib/courses/parse-document-ia";
import type { IngredientParse } from "@/lib/courses/parse-recette";
import { estimerPrix, type IndexCommunautaire } from "@/lib/prix-estimes";
import { redimensionnerPourEnvoi } from "@/lib/ticket/redimensionner-image";

export function AjouterDepuisDocument({
  ajouterEnLotAction,
  indexCommunautaire,
}: {
  ajouterEnLotAction: (items: IngredientParse[], listeNom: string | null) => Promise<void>;
  indexCommunautaire?: IndexCommunautaire;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [texte, setTexte] = useState("");
  const [nomListe, setNomListe] = useState("");
  const [apercu, setApercu] = useState<IngredientParse[] | null>(null);
  const [cochees, setCochees] = useState<boolean[]>([]);
  const [enCours, setEnCours] = useState(false);
  const [chargementFichier, setChargementFichier] = useState(false);
  const [erreurFichier, setErreurFichier] = useState<string | null>(null);
  const [analysePhotoEnCours, setAnalysePhotoEnCours] = useState(false);
  // Même précaution que pour le scan de ticket : la capture caméra
  // directe peut faire tuer le processus d'une PWA installée sur Android
  // (voir scanner-ticket.tsx) — seulement en navigateur normal.
  const [captureDirecte] = useState(
    () => typeof window !== "undefined" && !window.matchMedia("(display-mode: standalone)").matches,
  );

  function fermer() {
    setOuvert(false);
    setTexte("");
    setNomListe("");
    setApercu(null);
    setCochees([]);
    setErreurFichier(null);
  }

  async function analyser() {
    setEnCours(true);
    try {
      // On tente d'abord la lecture par IA (Claude), qui comprend
      // l'intention du texte quelle que soit sa formulation — le parseur
      // par règles ci-dessous ne reconnaît qu'un jeu figé de tournures
      // ("ou", virgule, "/") et ne généralise pas. Repli automatique sur
      // les règles si l'IA n'est pas configurée, échoue, ou ne trouve
      // aucun article.
      const resultatIA = await analyserDocumentClaude(texte);
      if (resultatIA.ok) {
        setApercu(resultatIA.items);
        setCochees(resultatIA.items.map(() => true));
        if (resultatIA.nomSuggere && !nomListe.trim()) setNomListe(resultatIA.nomSuggere);
        return;
      }

      const { items, nomSuggere } = parserDocumentAliments(texte);
      setApercu(items);
      setCochees(items.map(() => true));
      if (nomSuggere && !nomListe.trim()) setNomListe(nomSuggere);
    } finally {
      setEnCours(false);
    }
  }

  async function gererFichier(e: ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    e.target.value = "";
    if (!fichier) return;

    setErreurFichier(null);
    setChargementFichier(true);
    try {
      let contenu: string;
      if (fichier.type === "application/pdf" || fichier.name.toLowerCase().endsWith(".pdf")) {
        const { extraireTextePdf } = await import("@/lib/document/extraire-texte");
        contenu = await extraireTextePdf(fichier);
      } else {
        contenu = await fichier.text();
      }

      setTexte(contenu);
      setApercu(null);
      if (!nomListe.trim()) {
        setNomListe(fichier.name.replace(/\.[^.]+$/, ""));
      }
    } catch {
      setErreurFichier(
        "Impossible de lire ce fichier — essaie un .txt ou un .pdf, ou copie-colle le texte directement.",
      );
    } finally {
      setChargementFichier(false);
    }
  }

  async function gererPhoto(e: ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    e.target.value = "";
    if (!fichier) return;

    setErreurFichier(null);
    setAnalysePhotoEnCours(true);
    try {
      const imagePourEnvoi = await redimensionnerPourEnvoi(fichier);
      const formData = new FormData();
      formData.append("document", imagePourEnvoi, "document.jpg");
      const resultat = await analyserDocumentPhotoClaude(formData);

      if (!resultat.ok) {
        setErreurFichier(
          resultat.raison === "aucun_article"
            ? "Aucun article reconnu sur cette photo — essaie un cadrage plus net."
            : "La lecture de la photo n'est pas disponible pour le moment — essaie de coller le texte directement.",
        );
        return;
      }

      setTexte("");
      setApercu(resultat.items);
      setCochees(resultat.items.map(() => true));
      if (resultat.nomSuggere && !nomListe.trim()) setNomListe(resultat.nomSuggere);
    } catch {
      setErreurFichier("Impossible de lire cette photo — réessaie ou colle le texte directement.");
    } finally {
      setAnalysePhotoEnCours(false);
    }
  }

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="self-start text-sm text-ardoise/60 underline"
      >
        + Ajouter depuis une recette, un régime ou un document
      </button>
    );
  }

  const nbCochees = cochees.filter(Boolean).length;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-ardoise/10 bg-white p-4">
      <p className="text-sm text-ardoise/70">
        Colle le texte d&apos;une recette, d&apos;un régime ou d&apos;une liste
        de courses, importe un fichier (.txt, .pdf) ou une photo (liste
        manuscrite, capture d&apos;écran...) — whaoo repère les articles,
        alimentaires ou non, et propose un prix pour chacun.
      </p>

      <label className="flex flex-col gap-1 text-sm text-ardoise/80">
        Nom de cette liste (optionnel)
        <input
          value={nomListe}
          onChange={(e) => setNomListe(e.target.value)}
          placeholder="ex. Bolognaise, Régime dimanche…"
          className="rounded-lg border border-ardoise/20 px-3 py-2 text-ardoise"
        />
      </label>

      <textarea
        value={texte}
        onChange={(e) => {
          setTexte(e.target.value);
          setApercu(null);
        }}
        rows={6}
        placeholder={"200g farine\n3 oeufs\n1 sachet de levure\n..."}
        className="rounded-lg border border-ardoise/20 px-3 py-2 text-ardoise"
      />

      <div className="flex flex-wrap gap-3">
        <label className="w-fit cursor-pointer text-sm text-ardoise/60 underline">
          {chargementFichier ? "Lecture du fichier…" : "📎 Importer un fichier (.txt, .pdf)"}
          <input
            type="file"
            accept=".txt,.pdf,text/plain,application/pdf"
            onChange={gererFichier}
            disabled={chargementFichier}
            className="hidden"
          />
        </label>
        <label className="w-fit cursor-pointer text-sm text-ardoise/60 underline">
          {analysePhotoEnCours ? "Lecture de la photo…" : "📷 Prendre/importer une photo"}
          <input
            type="file"
            accept="image/*"
            {...(captureDirecte ? { capture: "environment" as const } : {})}
            onChange={gererPhoto}
            disabled={analysePhotoEnCours}
            className="hidden"
          />
        </label>
      </div>
      {erreurFichier && <p className="text-xs text-tomate">{erreurFichier}</p>}

      {apercu === null ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={analyser}
            disabled={!texte.trim() || enCours}
            className="rounded-lg bg-ardoise px-4 py-2 text-sm font-medium text-craie disabled:opacity-50"
          >
            {enCours ? "Analyse en cours…" : "Analyser"}
          </button>
          <button
            type="button"
            onClick={fermer}
            className="rounded-lg border border-ardoise/20 px-4 py-2 text-sm text-ardoise"
          >
            Annuler
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs font-medium text-ambre">
            Vérifie et décoche ce qui ne t&apos;intéresse pas avant
            d&apos;ajouter :
          </p>
          <ul className="flex flex-col gap-1 text-sm text-ardoise">
            {apercu.map((ingredient, i) => {
              const estimation = estimerPrix(ingredient.label, indexCommunautaire);
              const coche = cochees[i] ?? true;
              return (
                <li key={i} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={coche}
                    onChange={(e) =>
                      setCochees((c) => c.map((v, j) => (j === i ? e.target.checked : v)))
                    }
                  />
                  <span className={coche ? "" : "text-ardoise/30 line-through"}>
                    {ingredient.quantity > 1 ? `${ingredient.quantity} × ` : ""}
                    {ingredient.label}
                    {ingredient.detail ? ` (${ingredient.detail})` : ""}
                    {estimation && (
                      <span className="ml-1 text-xs text-ardoise/50">
                        (~{estimation.prix.toFixed(2)} €)
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={enCours || nbCochees === 0}
              onClick={async () => {
                setEnCours(true);
                const selection = apercu.filter((_, i) => cochees[i]);
                await ajouterEnLotAction(selection, nomListe.trim() || null);
                setEnCours(false);
                fermer();
              }}
              className="rounded-lg bg-basilic px-4 py-2 text-sm font-medium text-craie disabled:opacity-50"
            >
              Ajouter {nbCochees} article{nbCochees > 1 ? "s" : ""} à ma liste
            </button>
            <button
              type="button"
              onClick={() => setApercu(null)}
              className="rounded-lg border border-ardoise/20 px-4 py-2 text-sm text-ardoise"
            >
              Modifier le texte
            </button>
          </div>
        </>
      )}
    </div>
  );
}
