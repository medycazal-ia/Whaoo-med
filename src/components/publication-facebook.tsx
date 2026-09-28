"use client";

import { useRef, useState } from "react";

const PUBLICATION =
  "https://www.facebook.com/photo/?fbid=122099772963491906&set=a.122099773131491906";

// L'intégration Facebook dépose des cookies Meta (traceurs tiers) : elle
// n'est chargée qu'après un clic explicite du visiteur, conformément aux
// recommandations CNIL, et comme annoncé dans la politique de
// confidentialité.
export function PublicationFacebook() {
  const conteneurRef = useRef<HTMLDivElement>(null);
  const [largeur, setLargeur] = useState<number | null>(null);

  function charger() {
    const disponible = conteneurRef.current?.clientWidth ?? 500;
    // Le module Facebook accepte une largeur entre 350 et 500 px ici.
    setLargeur(Math.max(350, Math.min(500, Math.floor(disponible))));
  }

  const src = largeur
    ? `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(PUBLICATION)}&show_text=true&width=${largeur}`
    : null;
  const hauteur = largeur === null || largeur >= 500 ? 367 : Math.round(largeur * 0.454 + 190);

  return (
    <div ref={conteneurRef} className="mx-auto w-full max-w-[500px]">
      {src ? (
        <iframe
          src={src}
          width={largeur ?? 500}
          height={hauteur}
          title="Publication whaoo sur Facebook"
          className="mx-auto block max-w-full overflow-hidden rounded-xl border-none bg-white"
          scrolling="no"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        />
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center text-ardoise shadow-sm">
          <span className="text-3xl" aria-hidden>📣</span>
          <p className="font-heading font-semibold">whaoo sur Facebook</p>
          <p className="text-sm text-ardoise/75">
            Afficher la publication charge un contenu de Facebook, qui peut
            déposer ses propres cookies.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={charger}
              className="rounded-xl bg-ardoise px-4 py-2 text-sm font-medium text-craie hover:bg-ardoise-light"
            >
              Voir la publication
            </button>
            <a
              href={PUBLICATION}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-ardoise/20 px-4 py-2 text-sm text-ardoise hover:bg-ardoise/5"
            >
              Ouvrir sur Facebook ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
