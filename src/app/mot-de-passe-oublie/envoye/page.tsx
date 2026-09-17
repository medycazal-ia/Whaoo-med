export default function LienEnvoyePage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-ardoise px-6 py-12">
      <div className="w-full max-w-sm md:max-w-md rounded-2xl bg-ticket p-8 text-center shadow-xl">
        <h1 className="font-heading text-2xl font-semibold text-ardoise">
          Email envoyé
        </h1>
        <p className="mt-2 text-sm text-ardoise/70">
          Si un compte existe avec cet email, un lien de réinitialisation
          vient d&apos;être envoyé.
        </p>
      </div>
    </main>
  );
}
