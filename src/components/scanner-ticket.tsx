"use client";

import { useState } from "react";
import { parserTicket, type LigneTicket } from "@/lib/ticket/parse-ticket";
import { redimensionnerImage } from "@/lib/ticket/redimensionner-image";

type LigneEditable = LigneTicket & { inclure: boolean };

export function ScannerTicket({
  contribuerAction,
}: {
  contribuerAction: (lignes: { label: string; price: number }[]) => Promise<void>;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [statut, setStatut] = useState<"idle" | "analyse" | "pret" | "erreur" | "envoye">("idle");
  const [progression, setProgression] = useState(0);
  const [lignes, setLignes] = useState<LigneEditable[]>([]);

  function reinitialiser() {
    setOuvert(false);
    setStatut("idle");
    setProgression(0);
    setLignes([]);
  }

  async function analyserImage(fichier: File) {
    setStatut("analyse");
    setProgression(0);
    try {
      const imageReduite = await redimensionnerImage(fichier);
      const Tesseract = (await import("tesseract.js")).default;
      const { data } = await Tesseract.recognize(imageReduite, "fra", {
        logger: (m) => {
          if (m.status === "recognizing text") setProgression(Math.round(m.progress * 100));
        },
      });
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
        ajoute à l&apos;estimation communautaire (anonyme). L&apos;analyse se
        fait entièrement dans ton navigateur, la photo n&apos;est envoyée
        nulle part.
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
              capture="environment"
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
          Lecture du ticket en cours… {progression}%
        </p>
      )}

      {statut === "erreur" && (
        <>
          <p className="text-sm text-tomate">
            La lecture a échoué — réessaie avec une photo plus nette et bien
            éclairée.
          </p>
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
            </>
          )}
          <div className="flex gap-2">
            {lignes.length > 0 && (
              <button
                type="button"
                onClick={envoyer}
                className="rounded-lg bg-basilic px-4 py-2 text-sm font-medium text-craie"
              >
                Contribuer {lignes.filter((l) => l.inclure).length} prix
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
            Merci ! Tes prix ont été ajoutés à l&apos;estimation communautaire.
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
