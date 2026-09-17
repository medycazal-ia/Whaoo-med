import Link from "next/link";
import { signUpWithPassword } from "@/lib/auth/actions";

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: "Merci de remplir tous les champs obligatoires.",
  consent_required:
    "Merci d'accepter les CGU et de consentir au traitement de tes données.",
  already_registered: "Un compte existe déjà avec cet email.",
  signup_failed: "Impossible de créer le compte pour le moment.",
};

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ parrain?: string; error?: string }>;
}) {
  const { parrain, error } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center bg-ardoise px-6 py-12">
      <div className="w-full max-w-sm rounded-2xl bg-ticket p-8 shadow-xl">
        <h1 className="font-heading text-2xl font-semibold text-ardoise">
          Créer un compte
        </h1>
        <p className="mt-1 text-sm text-ardoise/70">
          Quelques infos pour démarrer, ça prend une minute.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-tomate/10 px-3 py-2 text-sm text-tomate">
            {ERROR_MESSAGES[error] ?? "Une erreur est survenue."}
          </p>
        )}

        <form action={signUpWithPassword} className="mt-6 flex flex-col gap-3">
          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1 text-sm text-ardoise">
              Prénom
              <input
                type="text"
                name="prenom"
                required
                autoComplete="given-name"
                className="rounded-lg border border-ardoise/20 bg-white px-3 py-2 text-ardoise outline-none focus:border-basilic"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm text-ardoise">
              Nom
              <input
                type="text"
                name="nom"
                required
                autoComplete="family-name"
                className="rounded-lg border border-ardoise/20 bg-white px-3 py-2 text-ardoise outline-none focus:border-basilic"
              />
            </label>
          </div>
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
              minLength={8}
              autoComplete="new-password"
              className="rounded-lg border border-ardoise/20 bg-white px-3 py-2 text-ardoise outline-none focus:border-basilic"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ardoise">
            Téléphone mobile{" "}
            <span className="text-ardoise/50">(optionnel)</span>
            <input
              type="tel"
              name="telephone"
              autoComplete="tel"
              className="rounded-lg border border-ardoise/20 bg-white px-3 py-2 text-ardoise outline-none focus:border-basilic"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ardoise">
            Code de parrainage{" "}
            <span className="text-ardoise/50">(optionnel)</span>
            <input
              type="text"
              name="referralCode"
              defaultValue={parrain?.toUpperCase() ?? ""}
              className="rounded-lg border border-ardoise/20 bg-white px-3 py-2 uppercase text-ardoise outline-none focus:border-basilic"
            />
          </label>

          <div className="mt-2 flex flex-col gap-2 text-sm text-ardoise">
            <label className="flex items-start gap-2">
              <input type="checkbox" name="cguAccepted" className="mt-1" required />
              <span>
                J&apos;accepte les{" "}
                <Link href="/cgu" className="underline">
                  conditions générales d&apos;utilisation
                </Link>
                .
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" name="rgpdConsent" className="mt-1" required />
              <span>
                Je consens au traitement de mes données personnelles décrit dans
                la{" "}
                <Link href="/confidentialite" className="underline">
                  politique de confidentialité
                </Link>
                .
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="mt-2 rounded-lg bg-ardoise px-4 py-2 font-medium text-craie transition hover:bg-ardoise-light"
          >
            Créer mon compte
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ardoise/70">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="font-medium text-basilic underline">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
