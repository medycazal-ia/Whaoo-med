"use client";

import { useEffect, useState } from "react";
import { FaqPanel } from "@/components/faq-panel";

const NB_APPARITIONS_MAX = 3;
const PREMIER_DELAI_MS = 8000;
const INTERVALLE_MS = 75000;
const DUREE_INDICE_MS = 5500;

/**
 * Bouton d'aide toujours accessible en bas à droite. De temps en temps
 * (pas à chaque instant : plafonné à 3 fois par visite), une bulle avec
 * un doigt qui pointe apparaît pour indiquer qu'on peut dire « aide moi »
 * ou cliquer, puis se range dans un rond « ❓ » discret.
 */
export function BoutonAideFlottant() {
  const [panelOuvert, setPanelOuvert] = useState(false);
  const [indiceVisible, setIndiceVisible] = useState(false);
  const [apparitions, setApparitions] = useState(0);

  useEffect(() => {
    if (apparitions >= NB_APPARITIONS_MAX || panelOuvert) return;

    const delai = apparitions === 0 ? PREMIER_DELAI_MS : INTERVALLE_MS;
    const afficher = setTimeout(() => {
      setIndiceVisible(true);
      setApparitions((n) => n + 1);
    }, delai);

    return () => clearTimeout(afficher);
  }, [apparitions, panelOuvert]);

  useEffect(() => {
    if (!indiceVisible) return;
    const masquer = setTimeout(() => setIndiceVisible(false), DUREE_INDICE_MS);
    return () => clearTimeout(masquer);
  }, [indiceVisible]);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
        {indiceVisible && (
          <button
            type="button"
            onClick={() => {
              setIndiceVisible(false);
              setPanelOuvert(true);
            }}
            className="flex animate-bounce items-center gap-2 rounded-2xl bg-ambre px-3 py-2 text-sm font-medium text-ardoise shadow-lg"
          >
            <span aria-hidden>👉</span>
            Dis « aide moi » ou clique ici !
          </button>
        )}
        <button
          type="button"
          onClick={() => setPanelOuvert(true)}
          aria-label="Ouvrir l'aide"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-ardoise text-2xl font-bold text-craie shadow-xl hover:bg-ardoise-light"
        >
          ❓
        </button>
      </div>

      {panelOuvert && <FaqPanel onFermer={() => setPanelOuvert(false)} />}
    </>
  );
}
