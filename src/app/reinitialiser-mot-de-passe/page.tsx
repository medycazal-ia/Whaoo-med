import { updatePassword } from "@/lib/auth/actions";

const ERROR_MESSAGES: Record<string, string> = {
  too_short: "Le mot de passe doit contenir au moins 8 caractères.",
  update_failed: "Impossible de mettre à jour le mot de passe. Réessaie.",
};

export default async function ReinitialiserMotDePassePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center bg-ardoise px-4 sm:px-6 py-12">
      <div className="w-full max-w-sm md:max-w-md rounded-2xl bg-ticket p-8 shadow-xl">
        <h1 className="font-heading text-2xl font-semibold text-ardoise">
          Choisis un nouveau mot de passe
        </h1>

        {error && (
          <p className="mt-4 rounded-lg bg-tomate/10 px-3 py-2 text-sm text-tomate">
            {ERROR_MESSAGES[error] ?? "Une erreur est survenue."}
          </p>
        )}

        <form action={updatePassword} className="mt-6 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-ardoise">
            Nouveau mot de passe
            <input
              type="password"
              name="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="rounded-lg border border-ardoise/20 bg-white px-3 py-2 text-ardoise outline-none focus:border-basilic"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-lg bg-ardoise px-4 py-2 font-medium text-craie transition hover:bg-ardoise-light"
          >
            Valider
          </button>
        </form>
      </div>
    </main>
  );
}
