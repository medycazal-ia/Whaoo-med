"use client";

import { useState } from "react";
import { signOut } from "@/lib/auth/actions";

// Délai de sécurité si l'audio ne se termine jamais (voix indisponible,
// autoplay bloqué…) : on ne bloque pas la déconnexion pour un message vocal.
const DELAI_MAX_MS = 4000;

export function BoutonDeconnexion({ prenom, className }: { prenom: string; className?: string }) {
  const [enCours, setEnCours] = useState(false);

  async function gererClic() {
    if (enCours) return;
    setEnCours(true);

    await new Promise<void>((resolve) => {
      let regle = false;
      const finir = () => {
        if (regle) return;
        regle = true;
        resolve();
      };
      const delaiSecurite = setTimeout(finir, DELAI_MAX_MS);

      fetch("/api/voix", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ texte: prenom ? `Au revoir ${prenom} !` : "Au revoir !" }),
      })
        .then((reponse) => (reponse.ok ? reponse.arrayBuffer() : null))
        .then((buffer) => {
          if (!buffer) return finir();
          const url = URL.createObjectURL(new Blob([buffer], { type: "audio/mpeg" }));
          const audio = new Audio(url);
          audio.addEventListener("ended", () => {
            URL.revokeObjectURL(url);
            clearTimeout(delaiSecurite);
            finir();
          });
          audio.play().catch(finir);
        })
        .catch(finir);
    });

    await signOut();
  }

  return (
    <button
      type="button"
      onClick={gererClic}
      disabled={enCours}
      title="Se déconnecter"
      className={className}
    >
      <span aria-hidden className="sm:hidden">🚪</span>
      <span className="hidden sm:inline">Se déconnecter</span>
    </button>
  );
}
