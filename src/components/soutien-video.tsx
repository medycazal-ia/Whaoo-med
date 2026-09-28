"use client";

import { useRef, useState } from "react";

// Ouvre la vidéo « Soutiens whaoo » (message de Medy) dans une fenêtre ; à la
// fin, ou si on la passe, elle laisse place au bouton de paiement Stripe.
// Deux déclencheurs : le coin en haut de l'appli et le bouton du bas.
export function SoutienVideo({
  stripeUrl,
  variante,
}: {
  stripeUrl: string;
  variante: "coin" | "bouton";
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [finie, setFinie] = useState(false);

  function ouvrir() {
    setFinie(false);
    dialogRef.current?.showModal();
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {
        // Lecture automatique refusée : les contrôles restent disponibles.
      });
    }
  }

  function fermer() {
    videoRef.current?.pause();
    dialogRef.current?.close();
  }

  function passer() {
    videoRef.current?.pause();
    setFinie(true);
  }

  return (
    <>
      {variante === "coin" ? (
        <button
          type="button"
          onClick={ouvrir}
          className="rounded-bl-xl bg-rose px-3 py-1 text-xs font-semibold text-ardoise shadow-sm hover:brightness-95 sm:text-sm"
        >
          💚 Soutiens whaoo
        </button>
      ) : (
        <button
          type="button"
          onClick={ouvrir}
          className="rounded-lg bg-basilic px-5 py-3 font-medium text-craie shadow-sm hover:opacity-90"
        >
          💳 Je contribue librement
        </button>
      )}

      <dialog
        ref={dialogRef}
        onClose={() => videoRef.current?.pause()}
        onClick={(e) => {
          if (e.target === dialogRef.current) fermer();
        }}
        className="m-auto w-[min(92vw,720px)] rounded-2xl bg-craie p-0 text-ardoise backdrop:bg-ardoise/70"
      >
        <div className="relative">
          <video
            ref={videoRef}
            src="/videos/whaoo-soutien.mp4"
            poster="/videos/whaoo-soutien-poster.jpg"
            playsInline
            controls
            preload="none"
            onEnded={() => setFinie(true)}
            className={`block aspect-video w-full rounded-t-2xl bg-black ${finie ? "invisible" : ""}`}
          />
          {finie && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-t-2xl bg-gradient-to-br from-menthe to-rose px-6 text-center">
              <p className="font-heading text-2xl font-semibold">Merci 💚</p>
              <p className="max-w-sm text-sm text-ardoise/75">
                Montant libre à partir de 1 €, par carte, Apple Pay ou
                Google Pay. Entièrement facultatif, sans aucune obligation.
              </p>
              <a
                href={stripeUrl}
                className="rounded-lg bg-basilic px-5 py-3 font-medium text-craie shadow-sm hover:opacity-90"
              >
                💳 Je contribue librement
              </a>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 px-4 py-3 text-sm">
          {finie ? (
            <span className="text-ardoise/75">Paiement sécurisé par Stripe</span>
          ) : (
            <button type="button" onClick={passer} className="text-ardoise/75 underline underline-offset-2 hover:text-ardoise">
              Passer la vidéo
            </button>
          )}
          <button
            type="button"
            onClick={fermer}
            className="rounded-lg border border-ardoise/20 px-3 py-1.5 hover:bg-ardoise/5"
          >
            {finie ? "Plus tard" : "Fermer"}
          </button>
        </div>
      </dialog>
    </>
  );
}
