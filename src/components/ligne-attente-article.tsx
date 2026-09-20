"use client";

import { useState } from "react";
import type { ArticleCourse } from "@/lib/courses/types";
import { FormulaireEditionArticle } from "@/components/formulaire-edition-article";

export function LigneAttenteArticle({
  item,
  sessionActive,
  basculerStatutAction,
  supprimerAction,
  modifierAction,
}: {
  item: ArticleCourse;
  sessionActive: string;
  basculerStatutAction: (formData: FormData) => Promise<void>;
  supprimerAction: (formData: FormData) => Promise<void>;
  modifierAction?: (formData: FormData) => Promise<void>;
}) {
  const [edition, setEdition] = useState(false);

  if (edition && modifierAction) {
    return (
      <li className="flex items-center gap-2 py-2 text-sm text-ardoise">
        <FormulaireEditionArticle
          item={item}
          modifierAction={modifierAction}
          onTermine={() => setEdition(false)}
        />
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm text-ardoise">
      <span className="min-w-0 break-words">
        {item.label}
        {item.detail ? ` (${item.detail})` : ""}
      </span>
      <div className="flex shrink-0 items-center gap-1">
        {modifierAction && (
          <button
            type="button"
            onClick={() => setEdition(true)}
            aria-label="Modifier cet article"
            className="rounded-lg border border-ardoise/20 px-2 py-1 text-xs text-ardoise/70"
          >
            ✏️
          </button>
        )}
        <form action={basculerStatutAction}>
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="status" value="achete" />
          <input type="hidden" name="sessionCourses" value={sessionActive} />
          <button type="submit" className="rounded-lg bg-basilic px-2 py-1 text-xs font-medium text-craie">
            Acheté ✓
          </button>
        </form>
        <form action={supprimerAction}>
          <input type="hidden" name="id" value={item.id} />
          <button
            type="submit"
            aria-label="Supprimer cet article"
            className="rounded-lg border border-tomate/40 px-2 py-1 text-xs text-tomate"
          >
            ✕
          </button>
        </form>
      </div>
    </li>
  );
}
