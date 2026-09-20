"use client";

import type { ArticleCourse } from "@/lib/courses/types";

/**
 * Formulaire inline pour corriger le nom, le détail, la quantité ou le
 * prix d'un article déjà ajouté — que ce soit dans la liste "à ne pas
 * oublier" (listes nommées ou non) ou dans la grille "à acheter"/"acheté".
 */
export function FormulaireEditionArticle({
  item,
  modifierAction,
  onTermine,
}: {
  item: ArticleCourse;
  modifierAction: (formData: FormData) => Promise<void>;
  onTermine: () => void;
}) {
  return (
    <form
      action={async (formData) => {
        await modifierAction(formData);
        onTermine();
      }}
      className="flex flex-1 flex-wrap items-center gap-1.5"
    >
      <input type="hidden" name="id" value={item.id} />
      <input
        name="label"
        defaultValue={item.label}
        required
        autoFocus
        className="min-w-0 flex-1 basis-24 rounded-lg border border-ardoise/20 px-2 py-1 text-sm text-ardoise"
      />
      <input
        name="detail"
        defaultValue={item.detail ?? ""}
        placeholder="Détail"
        className="w-20 rounded-lg border border-ardoise/20 px-2 py-1 text-sm text-ardoise"
      />
      <input
        name="quantity"
        type="number"
        min={1}
        defaultValue={item.quantity}
        className="w-14 rounded-lg border border-ardoise/20 px-2 py-1 text-sm text-ardoise"
      />
      <input
        name="price"
        type="number"
        step="0.01"
        min={0}
        defaultValue={item.price}
        className="w-20 rounded-lg border border-ardoise/20 px-2 py-1 text-sm text-ardoise"
      />
      <button type="submit" className="rounded-lg bg-basilic px-2 py-1 text-xs font-medium text-craie">
        OK
      </button>
      <button
        type="button"
        onClick={onTermine}
        className="rounded-lg border border-ardoise/20 px-2 py-1 text-xs text-ardoise"
      >
        Annuler
      </button>
    </form>
  );
}
