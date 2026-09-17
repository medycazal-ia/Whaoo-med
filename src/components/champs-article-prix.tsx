"use client";

import { useRef, useState } from "react";
import { estimerPrix } from "@/lib/prix-estimes";

export function ChampsArticlePrix({ defaultStatus }: { defaultStatus: "achete" | "a_acheter" }) {
  const priceRef = useRef<HTMLInputElement>(null);
  const [estimee, setEstimee] = useState(false);

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
          const estimation = estimerPrix(e.target.value);
          if (estimation !== null) {
            priceInput.value = String(estimation);
            setEstimee(true);
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
          onChange={() => setEstimee(false)}
        />
        {estimee && <span className="text-xs text-ardoise/50">Prix estimé</span>}
      </div>
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
    </>
  );
}
