"use client";

import { useState } from "react";
import { parserTicket, type LigneTicket } from "@/lib/ticket/parse-ticket";
import { redimensionnerImage, redimensionnerPourEnvoi } from "@/lib/ticket/redimensionner-image";
import { analyserTicketClaude } from "@/lib/ticket/claude-vision";

type LigneEditable = LigneTicket & { inclure: boolean };

export function ScannerTicket({
  contribuerAction,
  ajouterAuBudgetAction,
}: {
  contribuerAction: (lignes: { label: string; price: number }[]) => Promise<void>;
  ajouterAuBudgetAction?: (lignes: { label: string; price: number }[]) => Promise<void>;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [statut, setStatut] = useState<"idle" | "analyse" | "pret" | "erreur" | "envoye">("idle");
  const [progression, setProgression] = useState(0);
  const [lignes, setLignes] = useState<LigneEditable[]>([]);
  const [texteBrut, setTexteBrut] = useState<string | null>(null);
  const [afficherTexteBrut, setAfficherTexteBrut] = useState(false);
  const [texteCopie, setTexteCopie] = useState(false);
  // Un ticket de caisse représente un achat déjà effectué : coché par
  // défaut pour que les articles rejoignent directement le budget du mois
  // en "déjà acheté", en plus de la contribution à l'estimation
  // communautaire (les deux ne s'excluent pas).
  const [ajouterAuBudget, setAjouterAuBudget] = useState(true);
  // Pourquoi Claude n'a pas été utilisé cette fois (clé absente, erreur
  // d'appel, ou aucun article trouvé) — affiché en debug, pour ne plus
  // avoir à deviner à l'aveugle si l'appel échoue silencieusement alors
  // que la clé est bien configurée.
  const [diagnosticIA, setDiagnosticIA] = useState<string | null>(null);
  // Ouvrir l'appareil photo directement (au lieu du sélecteur de fichier
  // standard) est plus rapide, mais c'est justement ce qui provoquait le
  // plantage "l'appli se ferme dès la photo prise" une fois installée en
  // PWA sur Android (voir historique) — donc seulement en navigateur
  // normal, jamais en PWA installée.
  const [captureDirecte] = useState(
    () => typeof window !== "undefined" && !window.matchMedia("(display-mode: standalone)").matches,
  );

  function reinitialiser() {
    setOuvert(false);
    setStatut("idle");
    setProgression(0);
    setLignes([]);
    setTexteBrut(null);
    setAfficherTexteBrut(false);
    setDiagnosticIA(null);
  }

  async function analyserImage(fichier: File) {
    setStatut("analyse");
    setProgression(0);
    setTexteBrut(null);
    setDiagnosticIA(null);
    try {
      // On tente d'abord Claude (vision) quand il est configuré côté
      // serveur. S'il n'est pas encore configuré, échoue, ou ne trouve
      // aucun article, on retombe sur l'OCR local Tesseract plutôt que
      // d'échouer sec. La photo brute d'un smartphone récent (10+ Mpx)
      // est réduite avant l'envoi : sans ça, la préparer pour l'envoi
      // peut à elle seule épuiser la mémoire du navigateur et fermer
      // l'appli sur mobile — exactement le même plantage que celui déjà
      // corrigé pour l'OCR local, qui se reproduit ici si on saute cette
      // étape.
      const imagePourEnvoi = await redimensionnerPourEnvoi(fichier);
      const formDataClaude = new FormData();
      formDataClaude.append("ticket", imagePourEnvoi, "ticket.jpg");
      const resultatClaude = await analyserTicketClaude(formDataClaude);

      if (resultatClaude.ok) {
        setLignes(resultatClaude.lignes.map((ligne) => ({ ...ligne, inclure: true })));
        setStatut("pret");
        return;
      }

      setDiagnosticIA(
        `${resultatClaude.raison}${resultatClaude.details ? ` — ${resultatClaude.details}` : ""}`,
      );

      const imageReduite = await redimensionnerImage(fichier);
      const Tesseract = (await import("tesseract.js")).default;
      const worker = await Tesseract.createWorker("fra", undefined, {
        logger: (m) => {
          if (m.status === "recognizing text") setProgression(Math.round(m.progress * 100));
        },
      });
      const { data } = await worker.recognize(imageReduite);
      await worker.terminate();

      setTexteBrut(data.text);
      const detectees = parserTicket(data.text);
      setLignes(detectees.map((ligne) => ({ ...ligne, inclure: true })));
      setStatut("pret");
    } catch {
      setStatut("erreur");
    }
  }

  async function envoyer() {
    const aEnvoyer = lignes.filter((l) => l.inclure).map(({ label, price }) => ({ label, price }));
    if (aEnvoyer.length === 0) return;
    await contribuerAction(aEnvoyer);
    if (ajouterAuBudget && ajouterAuBudgetAction) {
      await ajouterAuBudgetAction(aEnvoyer);
    }
    setStatut("envoye");
  }

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="self-start text-sm text-ardoise/60 underline"
      >
        📷 Scanner un ticket de caisse
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-ardoise/10 bg-white p-4">
      <p className="text-sm text-ardoise/70">
        Prends une photo de ton ticket de caisse : whaoo lit les prix et les
        ajoute à l&apos;estimation communautaire (anonyme). Selon la
        disponibilité, l&apos;analyse se fait via un service sécurisé
        spécialisé ou directement dans ton navigateur ; dans les deux cas,
        aucune donnée personnelle n&apos;est associée à ta contribution.
      </p>
      <p className="text-xs text-ardoise/50">
        💡 Pour une meilleure lecture : à plat, bien à plat sous une bonne
        lumière, ticket entier dans le cadre, sans reflet.
      </p>

      {statut === "idle" && (
        <div className="flex gap-2">
          <label className="cursor-pointer rounded-lg bg-ardoise px-4 py-2 text-sm font-medium text-craie">
            Choisir une photo
            <input
              type="file"
              accept="image/*"
              {...(captureDirecte ? { capture: "environment" as const } : {})}
              className="hidden"
              onChange={(e) => {
                const fichier = e.target.files?.[0];
                if (fichier) analyserImage(fichier);
              }}
            />
          </label>
          <button
            type="button"
            onClick={reinitialiser}
            className="rounded-lg border border-ardoise/20 px-4 py-2 text-sm text-ardoise"
          >
            Annuler
          </button>
        </div>
      )}

      {statut === "analyse" && (
        <p className="text-sm text-ardoise/70">
          Lecture du ticket en cours…{progression > 0 ? ` ${progression}%` : ""}
        </p>
      )}

      {statut === "erreur" && (
        <>
          <p className="text-sm text-tomate">
            La lecture a échoué — réessaie avec une photo plus nette et bien
            éclairée.
          </p>
          {diagnosticIA && (
            <p className="text-xs text-ardoise/40">
              🔧 Claude non utilisé cette fois : {diagnosticIA}
            </p>
          )}
          <button
            type="button"
            onClick={reinitialiser}
            className="self-start rounded-lg border border-ardoise/20 px-4 py-2 text-sm text-ardoise"
          >
            Réessayer
          </button>
        </>
      )}

      {statut === "pret" && (
        <>
          {lignes.length === 0 ? (
            <p className="text-sm text-ardoise/60">
              Aucun prix reconnu sur cette photo — essaie avec un cadrage
              plus net.
            </p>
          ) : (
            <>
              <p className="text-xs font-medium text-ambre">
                Vérifie avant d&apos;envoyer (décoche ce qui n&apos;est pas
                bon) :
              </p>
              <ul className="flex flex-col gap-1">
                {lignes.map((ligne, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-ardoise">
                    <input
                      type="checkbox"
                      checked={ligne.inclure}
                      onChange={(e) =>
                        setLignes((prev) =>
                          prev.map((l, j) => (j === i ? { ...l, inclure: e.target.checked } : l)),
                        )
                      }
                    />
                    <input
                      value={ligne.label}
                      onChange={(e) =>
                        setLignes((prev) =>
                          prev.map((l, j) => (j === i ? { ...l, label: e.target.value } : l)),
                        )
                      }
                      className="flex-1 rounded border border-ardoise/20 px-2 py-1"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={ligne.price}
                      onChange={(e) =>
                        setLignes((prev) =>
                          prev.map((l, j) =>
                            j === i ? { ...l, price: Number(e.target.value) || 0 } : l,
                          ),
                        )
                      }
                      className="w-20 rounded border border-ardoise/20 px-2 py-1"
                    />
                  </li>
                ))}
              </ul>
              {ajouterAuBudgetAction && (
                <label className="flex items-center gap-2 text-sm text-ardoise">
                  <input
                    type="checkbox"
                    checked={ajouterAuBudget}
                    onChange={(e) => setAjouterAuBudget(e.target.checked)}
                  />
                  Ajouter aussi ces articles à mon budget du mois (déjà
                  achetés)
                </label>
              )}
            </>
          )}
          {diagnosticIA && (
            <p className="text-xs text-ardoise/40">
              🔧 Claude non utilisé cette fois : {diagnosticIA}
            </p>
          )}
          {texteBrut && (
            <div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAfficherTexteBrut((v) => !v)}
                  className="text-xs text-ardoise/50 underline"
                >
                  {afficherTexteBrut ? "Cacher" : "Voir"} le texte brut
                  détecté (debug)
                </button>
                {afficherTexteBrut && (
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(texteBrut);
                      setTexteCopie(true);
                      setTimeout(() => setTexteCopie(false), 2000);
                    }}
                    className="text-xs text-basilic underline"
                  >
                    {texteCopie ? "Copié ✓" : "📋 Copier tout le texte"}
                  </button>
                )}
              </div>
              {afficherTexteBrut && (
                <pre className="mt-1 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-ardoise/5 p-2 text-xs text-ardoise/70">
                  {texteBrut}
                </pre>
              )}
            </div>
          )}
          <div className="flex gap-2">
            {lignes.length > 0 && (
              <button
                type="button"
                onClick={envoyer}
                className="rounded-lg bg-basilic px-4 py-2 text-sm font-medium text-craie"
              >
                {ajouterAuBudget && ajouterAuBudgetAction
                  ? `Ajouter ${lignes.filter((l) => l.inclure).length} article${lignes.filter((l) => l.inclure).length > 1 ? "s" : ""}`
                  : `Contribuer ${lignes.filter((l) => l.inclure).length} prix`}
              </button>
            )}
            <button
              type="button"
              onClick={reinitialiser}
              className="rounded-lg border border-ardoise/20 px-4 py-2 text-sm text-ardoise"
            >
              {lignes.length === 0 ? "Fermer" : "Annuler"}
            </button>
          </div>
        </>
      )}

      {statut === "envoye" && (
        <>
          <p className="text-sm text-basilic">
            {ajouterAuBudget && ajouterAuBudgetAction
              ? "Merci ! Tes articles ont été ajoutés à ton budget (déjà achetés) et à l'estimation communautaire."
              : "Merci ! Tes prix ont été ajoutés à l'estimation communautaire."}
          </p>
          <button
            type="button"
            onClick={reinitialiser}
            className="self-start rounded-lg border border-ardoise/20 px-4 py-2 text-sm text-ardoise"
          >
            Fermer
          </button>
        </>
      )}
    </div>
  );
}
