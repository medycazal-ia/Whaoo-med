"use client";

import { useRef, useState } from "react";
import {
  estimerPrix,
  LABEL_SOURCE_PRIX,
  type IndexCommunautaire,
  type SourcePrix,
} from "@/lib/prix-estimes";

export function ChampsArticlePrix({
  defaultStatus,
  indexCommunautaire,
  proposerPartage = false,
}: {
  defaultStatus: "achete" | "a_acheter";
  indexCommunautaire?: IndexCommunautaire;
  proposerPartage?: boolean;
}) {
  const priceRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<SourcePrix | null>(null);

  return (
    <>
      <input
        name="label"
        placeholder="Article"
        required
        className="flex-1 basis-full rounded-lg border border-ardoise/20 px-3 py-2 text-ardoise"
        onBlur={(e) => {
          const priceInput = priceRef.current;
          if (!priceInput || priceInput.value) return;
          const estimation = estimerPrix(e.target.value, indexCommunautaire);
          if (estimation !== null) {
            priceInput.value = String(estimation.prix);
            setSource(estimation.source);
          }
        }}
      />
      <input
        name="detail"
        placeholder="Détail (poids, format…)"
        className="flex-1 basis-full rounded-lg border border-ardoise/20 px-3 py-2 text-ardoise"
      />
      <div className="flex flex-col gap-1">
        <input
          ref={priceRef}
          name="price"
          type="number"
          step="0.01"
          min={0}
          placeholder="Prix"
          className="w-24 rounded-lg border border-ardoise/20 px-3 py-2 text-ardoise"
          onChange={() => setSource(null)}
        />
        {source && (
          <span className="text-xs text-ardoise/50">{LABEL_SOURCE_PRIX[source]}</span>
        )}
      </div>
      <input type="hidden" name="prixSource" value={source ?? "manuel"} />
      <input
        name="quantity"
        type="number"
        min={1}
        defaultValue={1}
        className="w-20 rounded-lg border border-ardoise/20 px-3 py-2 text-ardoise"
      />
      <select
        name="status"
        defaultValue={defaultStatus}
        className="rounded-lg border border-ardoise/20 px-3 py-2 text-ardoise"
      >
        <option value="a_acheter">À acheter plus tard</option>
        <option value="achete">Déjà acheté</option>
      </select>

      {proposerPartage && (
        <div className="flex basis-full flex-wrap items-center gap-2 text-xs text-ardoise/70">
          <input
            name="enseigne"
            placeholder="Enseigne (optionnel)"
            className="rounded-lg border border-ardoise/20 px-2 py-1 text-ardoise"
          />
          <label className="flex items-center gap-1.5">
            <input type="checkbox" name="partagerPrix" />
            Partager ce prix (anonyme) pour aider les estimations
          </label>
        </div>
      )}
    </>
  );
}
