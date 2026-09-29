"use client";

export function BoutonImprimer() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-basilic px-4 py-2 font-medium text-craie hover:opacity-90"
    >
      Imprimer
    </button>
  );
}
