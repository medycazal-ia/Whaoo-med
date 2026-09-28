"use client";

// Confirmation d'un budget du mois dicté à voix haute, partagée par tous
// les micros de l'appli. montant null : budget demandé sans montant
// compris ("change mon budget") — le champ s'ouvre vide, prêt à saisir.
export function ConfirmationBudget({
  montant,
  definirBudgetAction,
  onFermer,
}: {
  montant: number | null;
  definirBudgetAction: (formData: FormData) => Promise<void>;
  onFermer: () => void;
}) {
  return (
    <form
      action={definirBudgetAction}
      className="flex flex-col gap-2 rounded-xl border border-rose/40 bg-rose/10 p-4"
      onSubmit={onFermer}
    >
      <p className="text-xs font-medium text-rose-fonce">
        {montant === null ? "Quel est le nouveau budget du mois ?" : "Confirme le nouveau budget du mois"}
      </p>
      <input
        name="budgetAmount"
        type="number"
        inputMode="decimal"
        step="0.01"
        min={0}
        required
        autoFocus={montant === null}
        defaultValue={montant ?? ""}
        className="rounded-lg border border-ardoise/20 bg-white px-3 py-2 text-ardoise"
      />
      <div className="flex gap-2">
        <button type="submit" className="flex-1 rounded-lg bg-basilic px-3 py-2 font-medium text-craie">
          Confirmer
        </button>
        <button
          type="button"
          onClick={onFermer}
          className="rounded-lg border border-ardoise/20 px-3 py-2 text-ardoise"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
