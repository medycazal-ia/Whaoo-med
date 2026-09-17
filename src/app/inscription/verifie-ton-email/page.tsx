export default function VerifieTonEmailPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-ardoise px-6 py-12">
      <div className="w-full max-w-sm rounded-2xl bg-ticket p-8 text-center shadow-xl">
        <h1 className="font-heading text-2xl font-semibold text-ardoise">
          Vérifie ta boîte mail
        </h1>
        <p className="mt-2 text-sm text-ardoise/70">
          On t&apos;a envoyé un lien de confirmation. Clique dessus pour
          activer ton compte.
        </p>
      </div>
    </main>
  );
}
