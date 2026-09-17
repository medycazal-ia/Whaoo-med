import Link from "next/link";
import {
  signInWithPassword,
  signInWithGoogle,
} from "@/lib/auth/actions";

const ERROR_MESSAGES: Record<string, string> = {
  google: "La connexion avec Google a échoué. Réessaie.",
  oauth: "La connexion a échoué. Réessaie.",
  credentials: "Email ou mot de passe incorrect.",
};

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirectTo?: string }>;
}) {
  const { error, redirectTo } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center bg-ardoise px-6 py-12">
      <div className="w-full max-w-sm md:max-w-md rounded-2xl bg-ticket p-8 shadow-xl">
        <h1 className="font-heading text-2xl font-semibold text-ardoise">
          Content de te revoir
        </h1>
        <p className="mt-1 text-sm text-ardoise/70">
          Connecte-toi pour retrouver tes courses et ton budget.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-tomate/10 px-3 py-2 text-sm text-tomate">
            {ERROR_MESSAGES[error] ?? "Une erreur est survenue."}
          </p>
        )}

        <form action={signInWithPassword} className="mt-6 flex flex-col gap-3">
          {redirectTo && (
            <input type="hidden" name="redirectTo" value={redirectTo} />
          )}
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
          <label className="flex flex-col gap-1 text-sm text-ardoise">
            Mot de passe
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="rounded-lg border border-ardoise/20 bg-white px-3 py-2 text-ardoise outline-none focus:border-basilic"
            />
          </label>
          <Link
            href="/mot-de-passe-oublie"
            className="self-end text-xs text-ardoise/60 underline"
          >
            Mot de passe oublié ?
          </Link>
          <button
            type="submit"
            className="mt-2 rounded-lg bg-ardoise px-4 py-2 font-medium text-craie transition hover:bg-ardoise-light"
          >
            Se connecter
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-ardoise/40">
          <span className="h-px flex-1 bg-ardoise/10" />
          ou
          <span className="h-px flex-1 bg-ardoise/10" />
        </div>

        <form action={signInWithGoogle}>
          <button
            type="submit"
            className="w-full rounded-lg border border-ardoise/20 px-4 py-2 font-medium text-ardoise transition hover:bg-ardoise/5"
          >
            Continuer avec Google
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ardoise/70">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-medium text-basilic underline">
            Créer un compte
          </Link>
        </p>

        <Link
          href="/demo"
          className="mt-3 block text-center text-sm text-ardoise/60 underline"
        >
          Essayer la démo, sans inscription
        </Link>
      </div>
    </main>
  );
}
