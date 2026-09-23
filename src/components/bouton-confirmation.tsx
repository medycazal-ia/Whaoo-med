"use client";

import { useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

type Changement = {
  libelle: string;
  avant: string;
  apres: string;
  avertissement?: string;
};

// Bouton d'envoi qui demande confirmation avant toute action qui modifie la
// base de données. Se place dans le <form> de l'action. Les champs à
// récapituler portent data-libelle="Email" (et, si besoin,
// data-avertissement="…" affiché quand ce champ précis change) : la
// fenêtre liste alors uniquement ce qui a réellement été modifié.
export function BoutonConfirmation({
  children,
  titre,
  sujet,
  libelleConfirmer = "Oui, enregistrer",
  className,
}: {
  children: ReactNode;
  titre: string;
  sujet: string;
  libelleConfirmer?: string;
  className?: string;
}) {
  const boutonRef = useRef<HTMLButtonElement>(null);
  const dialogueRef = useRef<HTMLDialogElement>(null);
  const [changements, setChangements] = useState<Changement[]>([]);
  const { pending } = useFormStatus();

  function ouvrir() {
    const formulaire = boutonRef.current?.form;
    if (!formulaire || !formulaire.reportValidity()) return;

    const champs = Array.from(formulaire.querySelectorAll<HTMLInputElement>("input[data-libelle]"));
    setChangements(
      champs
        .filter((c) => c.value.trim() !== c.defaultValue.trim())
        .map((c) => ({
          libelle: c.dataset.libelle ?? c.name,
          avant: c.defaultValue.trim() || "(vide)",
          apres: c.value.trim() || "(vide)",
          avertissement: c.dataset.avertissement,
        })),
    );
    dialogueRef.current?.showModal();
  }

  function confirmer() {
    dialogueRef.current?.close();
    boutonRef.current?.form?.requestSubmit();
  }

  const rienAChanger = changements.length === 0;

  return (
    <>
      <button ref={boutonRef} type="button" onClick={ouvrir} disabled={pending} className={className}>
        {pending ? "Enregistrement…" : children}
      </button>

      <dialog
        ref={dialogueRef}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-craie p-0 text-ardoise shadow-xl backdrop:bg-ardoise/50"
      >
        <div className="flex flex-col gap-4 p-5">
          <h3 className="font-heading text-lg font-semibold">
            {rienAChanger ? "Aucune modification" : titre}
          </h3>

          {rienAChanger ? (
            <p className="text-sm text-ardoise/70">
              Tu n&apos;as rien changé sur {sujet} : il n&apos;y a rien à enregistrer.
            </p>
          ) : (
            <>
              <p className="text-sm text-ardoise/70">
                Tu es sur le point de modifier {sujet} :
              </p>
              <ul className="flex flex-col gap-2 rounded-xl bg-white p-3 text-sm">
                {changements.map((c) => (
                  <li key={c.libelle}>
                    <span className="font-medium">{c.libelle}</span>
                    <span className="block break-all text-ardoise/60">
                      <span className="line-through">{c.avant}</span> → <span className="text-ardoise">{c.apres}</span>
                    </span>
                  </li>
                ))}
              </ul>
              {changements
                .filter((c) => c.avertissement)
                .map((c) => (
                  <p key={c.libelle} className="rounded-lg bg-ambre/15 px-3 py-2 text-sm text-ardoise">
                    ⚠️ {c.avertissement}
                  </p>
                ))}
              <p className="text-xs text-ardoise/60">
                La modification sera enregistrée immédiatement dans la base de données.
              </p>
            </>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => dialogueRef.current?.close()}
              className="rounded-lg border border-ardoise/20 px-4 py-2 text-sm text-ardoise hover:bg-ardoise/5"
            >
              {rienAChanger ? "Fermer" : "Annuler"}
            </button>
            {!rienAChanger && (
              <button
                type="button"
                onClick={confirmer}
                className="rounded-lg bg-ardoise px-4 py-2 text-sm font-medium text-craie hover:bg-ardoise-light"
              >
                {libelleConfirmer}
              </button>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
