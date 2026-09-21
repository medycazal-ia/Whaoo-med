"use client";

import { useEffect } from "react";

// Joue "Bonjour {prénom} !" à voix haute une seule fois par session
// (onglet/navigateur), pas à chaque navigation entre les pages de l'appli.
export function AccueilVocal({ prenom }: { prenom: string }) {
  useEffect(() => {
    if (!prenom) return;
    if (sessionStorage.getItem("whaoo_accueil_vocal_joue")) return;
    sessionStorage.setItem("whaoo_accueil_vocal_joue", "1");

    let annule = false;
    fetch("/api/voix", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ texte: `Bonjour ${prenom} !` }),
    })
      .then((reponse) => (reponse.ok ? reponse.arrayBuffer() : null))
      .then((buffer) => {
        if (annule || !buffer) return;
        const url = URL.createObjectURL(new Blob([buffer], { type: "audio/mpeg" }));
        const audio = new Audio(url);
        audio.addEventListener("ended", () => URL.revokeObjectURL(url));
        // Certains navigateurs bloquent l'autoplay sonore sans interaction
        // préalable : on ignore silencieusement l'échec plutôt que de
        // montrer une erreur pour un simple message de bienvenue.
        void audio.play().catch(() => {});
      })
      .catch(() => {});

    return () => {
      annule = true;
    };
  }, [prenom]);

  return null;
}
