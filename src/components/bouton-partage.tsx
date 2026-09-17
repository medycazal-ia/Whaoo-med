"use client";

import { useState } from "react";

export function BoutonPartage({ lien }: { lien: string }) {
  const [copie, setCopie] = useState(false);

  async function partager() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "whaoo",
          text: "Note tes courses à la voix et suis ton budget avec whaoo.",
          url: lien,
        });
        return;
      } catch {
        // L'utilisateur a annulé le partage, rien à faire.
        return;
      }
    }

    await navigator.clipboard.writeText(lien);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={partager}
      className="rounded-lg bg-basilic px-4 py-2 font-medium text-craie hover:opacity-90"
    >
      {copie ? "Lien copié !" : "Inviter"}
    </button>
  );
}
