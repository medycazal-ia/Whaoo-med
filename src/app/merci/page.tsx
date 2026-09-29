import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Merci — whaoo",
  robots: { index: false, follow: false },
};

// Page de retour après une contribution libre par carte (lien de paiement
// Stripe) ou un achat dans la boutique (?achat=1). Stripe envoie lui-même le
// reçu par email.
export default async function MerciPage({
  searchParams,
}: {
  searchParams: Promise<{ achat?: string }>;
}) {
  const achat = Boolean((await searchParams).achat);

  return (
    <main className="flex flex-1 flex-col items-center justify-center fond-marche px-4 py-16 text-center text-ardoise">
      <Image src="/icon.svg" alt="" width={56} height={56} className="rounded-2xl" />
      <h1 className="mt-4 font-heading text-3xl font-semibold">Merci, du fond du cœur 💚</h1>
      <p className="mt-3 max-w-md text-ardoise/75">
        {achat
          ? "Ton achat est confirmé. Tu vas recevoir ton reçu de paiement par email."
          : "Ta contribution aide whaoo à rester simple et gratuite. Tu vas recevoir ton reçu de paiement par email."}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/app"
          className="rounded-lg bg-basilic px-5 py-3 font-medium text-craie hover:opacity-90"
        >
          Retour à mes courses
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-ardoise/30 px-5 py-3 font-medium text-ardoise hover:bg-ardoise/5"
        >
          Page d&apos;accueil
        </Link>
      </div>
    </main>
  );
}
