"use client";

import { useEffect, useRef, useState } from "react";

const LARGEUR = 150;
const HAUTEUR = 56;

/**
 * Petit widget flottant affichant le budget en continu, déplaçable au
 * doigt (ou à la souris) n'importe où sur l'écran. La poignée « ⠿ » et le
 * léger rebond au premier affichage indiquent qu'il est déplaçable.
 */
export function BudgetFlottant({
  totalDepense,
  budgetAmount,
}: {
  totalDepense: number;
  budgetAmount: number;
}) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [indiceVisible, setIndiceVisible] = useState(true);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function positionParDefaut() {
      setPosition((actuelle) => {
        if (actuelle) return actuelle;
        // À gauche par défaut, pas à droite : les boutons d'action de
        // chaque article ("Supprimer", "Marquer acheté"…) sont alignés à
        // droite de l'écran (flex justify-between) — un widget flottant
        // par-dessus eux à droite intercepte silencieusement les taps
        // destinés à ces boutons (repéré en testant la suppression d'un
        // article "déjà acheté" : le total ne redescendait jamais, le tap
        // sur "Supprimer" n'atteignait jamais le bouton).
        return {
          x: 16,
          y: Math.max(8, window.innerHeight - HAUTEUR - 96),
        };
      });
    }
    positionParDefaut();
  }, []);

  useEffect(() => {
    const minuteur = setTimeout(() => setIndiceVisible(false), 3500);
    return () => clearTimeout(minuteur);
  }, []);

  function demarrerDrag(e: React.PointerEvent<HTMLDivElement>) {
    if (!position) return;
    setDragging(true);
    setIndiceVisible(false);
    offsetRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function deplacer(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const x = Math.min(Math.max(0, e.clientX - offsetRef.current.x), window.innerWidth - LARGEUR);
    const y = Math.min(Math.max(0, e.clientY - offsetRef.current.y), window.innerHeight - HAUTEUR);
    setPosition({ x, y });
  }

  function arreterDrag() {
    setDragging(false);
  }

  if (!position) return null;

  const pourcentage = Math.min(100, (totalDepense / Math.max(budgetAmount, 1)) * 100);

  return (
    <div
      style={{ left: position.x, top: position.y, width: LARGEUR }}
      className={`fixed z-50 flex touch-none select-none items-center gap-2 rounded-full bg-ardoise/95 py-2 pl-2 pr-3 text-craie shadow-xl ${
        indiceVisible ? "animate-bounce" : ""
      } ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
      onPointerDown={demarrerDrag}
      onPointerMove={deplacer}
      onPointerUp={arreterDrag}
      onPointerCancel={arreterDrag}
    >
      <span aria-hidden className="text-base text-craie/50">
        ⠿
      </span>
      <div className="flex flex-col leading-tight">
        <span className="font-mono text-sm font-semibold">
          {totalDepense.toFixed(2)} €
        </span>
        <span className="text-[10px] text-craie/60">
          / {budgetAmount.toFixed(2)} € ({pourcentage.toFixed(0)}%)
        </span>
      </div>
    </div>
  );
}
