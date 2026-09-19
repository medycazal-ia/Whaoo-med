import { requestPasswordReset } from "@/lib/auth/actions";

export default function MotDePasseOubliePage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-craie px-4 sm:px-6 py-12">
      <div className="w-full max-w-sm md:max-w-md rounded-2xl bg-ticket p-8 shadow-xl">
        <h1 className="font-heading text-2xl font-semibold text-ardoise">
          Mot de passe oublié
        </h1>
        <p className="mt-1 text-sm text-ardoise/70">
          Indique ton email, on t&apos;envoie un lien de réinitialisation.
        </p>

        <form
          action={requestPasswordReset}
          className="mt-6 flex flex-col gap-3"
        >
          <label className="flex flex-col gap-1 text-sm text-ardoise">
            Email
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="rounded-lg border border-ardoise/20 bg-white px-3 py-2 text-ardoise outline-none focus:border-basilic"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-lg bg-ardoise px-4 py-2 font-medium text-craie transition hover:bg-ardoise-light"
          >
            Envoyer le lien
          </button>
        </form>
      </div>
    </main>
  );
}
