import type { Metadata } from "next";
import Image from "next/image";
import { klarnaConfigure } from "@/lib/klarna/api";
import { siteKlarna } from "@/lib/klarna/sites";

export const metadata: Metadata = {
  title: "Payer avec Klarna",
  robots: { index: false, follow: false },
};

const MESSAGES: Record<string, string> = {
  annule: "Paiement annulé : rien n'a été débité.",
  refuse: "Klarna n'a pas validé le paiement. Tu peux réessayer ou choisir un autre moyen.",
  erreur: "Un problème est survenu avec Klarna. Réessaie dans quelques instants.",
  montant: "Montant invalide : choisis un montant dans les limites indiquées.",
  indisponible: "Le paiement Klarna n'est pas encore activé.",
};

// Page de paiement Klarna partagée entre plusieurs sites :
// https://whaoo.site/paiement/klarna?site=whaoo&montant=5
// (sites autorisés et pages de retour : src/lib/klarna/sites.ts).
export default async function PaiementKlarnaPage({
  searchParams,
}: {
  searchParams: Promise<{ site?: string; montant?: string; etat?: string }>;
}) {
  const params = await searchParams;
  const site = siteKlarna(params.site);
  const actif = klarnaConfigure();
  const message = params.etat ? MESSAGES[params.etat] : null;
  const montant = Number(params.montant?.replace(",", "."));
  const montantInitial =
    Number.isFinite(montant) && montant >= site.montantMin && montant <= site.montantMax
      ? montant
      : site.montantPropose;

  return (
    <main className="flex flex-1 flex-col items-center justify-center fond-marche px-4 py-16 text-ardoise">
      <div className="w-full max-w-sm rounded-2xl bg-craie p-6 text-center shadow-sm">
        <Image src="/icon.svg" alt="" width={48} height={48} className="mx-auto rounded-2xl" />
        <h1 className="mt-4 font-heading text-2xl font-semibold">{site.libelle}</h1>
        <p className="mt-2 text-sm text-ardoise/75">
          Paiement avec Klarna : tout de suite, plus tard ou en plusieurs fois
          selon ton éligibilité. Le paiement a lieu sur la page sécurisée de
          Klarna ; {site.nom} ne voit aucune donnée bancaire.
        </p>

        {message && (
          <p role="status" className="mt-4 rounded-lg bg-rose/40 px-3 py-2 text-sm">
            {message}
          </p>
        )}

        {actif ? (
          <form action="/api/klarna/session" method="get" className="mt-5 flex flex-col gap-3">
            <input type="hidden" name="site" value={site.id} />
            <label className="text-left text-sm font-medium" htmlFor="montant">
              Montant (de {site.montantMin} à {site.montantMax} €)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="montant"
                name="montant"
                type="number"
                inputMode="decimal"
                min={site.montantMin}
                max={site.montantMax}
                step="0.01"
                required
                defaultValue={montantInitial}
                className="w-full rounded-lg border border-ardoise/20 bg-white px-3 py-2 text-lg"
              />
              <span className="text-lg">€</span>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-[#FFB3C7] px-5 py-3 font-semibold text-black hover:brightness-95"
            >
              Payer avec Klarna
            </button>
          </form>
        ) : (
          !message && <p className="mt-5 text-sm">Le paiement Klarna n&apos;est pas encore activé.</p>
        )}

        <a href={site.urlRetour} className="mt-5 inline-block text-sm text-ardoise/75 underline underline-offset-2">
          Revenir sur {site.nom}
        </a>
      </div>
    </main>
  );
}
