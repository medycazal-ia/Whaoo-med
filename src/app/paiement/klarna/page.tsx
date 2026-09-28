import type { Metadata } from "next";
import Image from "next/image";
import { klarnaConfigure } from "@/lib/klarna/api";
import { formatEuros, siteKlarna } from "@/lib/klarna/sites";

export const metadata: Metadata = {
  title: "Payer avec Klarna",
  robots: { index: false, follow: false },
};

const MESSAGES: Record<string, string> = {
  annule: "Paiement annulé : rien n'a été débité.",
  refuse: "Klarna n'a pas validé le paiement. Tu peux réessayer ou choisir un autre moyen.",
  erreur: "Un problème est survenu avec Klarna. Réessaie dans quelques instants.",
  montant: "Montant invalide : choisis un montant dans les limites indiquées.",
  quantite: "Quantité invalide.",
  produit: "Ce produit n'est pas disponible.",
  indisponible: "Le paiement Klarna n'est pas encore activé.",
};

const CHAMP = "w-full rounded-lg border border-ardoise/20 bg-white px-3 py-2 text-lg";

// Page de paiement Klarna partagée entre plusieurs sites et produits
// (catalogue et pages de retour : src/lib/klarna/sites.ts) :
//   ?site=medy&produit=guide-budget&quantite=1   produit du catalogue
//   ?site=whaoo&montant=5                         montant libre
export default async function PaiementKlarnaPage({
  searchParams,
}: {
  searchParams: Promise<{ site?: string; produit?: string; quantite?: string; montant?: string; etat?: string }>;
}) {
  const params = await searchParams;
  const site = siteKlarna(params.site);
  const actif = klarnaConfigure();
  const produit = params.produit ? site.produits.find((p) => p.id === params.produit) : undefined;
  const libre = !params.produit ? site.montantLibre : null;
  const message = params.etat
    ? MESSAGES[params.etat]
    : params.produit && !produit
      ? MESSAGES.produit
      : null;

  const montant = Number(params.montant?.replace(",", "."));
  const montantInitial =
    libre && Number.isFinite(montant) && montant >= libre.min && montant <= libre.max ? montant : libre?.propose;
  const quantiteMax = produit?.quantiteMax ?? 1;
  const quantite = Number(params.quantite);
  const quantiteInitiale = Number.isInteger(quantite) && quantite >= 1 && quantite <= quantiteMax ? quantite : 1;

  const titre = produit?.nom ?? libre?.libelle ?? site.nom;

  return (
    <main className="flex flex-1 flex-col items-center justify-center fond-marche px-4 py-16 text-ardoise">
      <div className="w-full max-w-sm rounded-2xl bg-craie p-6 text-center shadow-sm">
        {/* L'image du produit (urlImage) est affichée sur la page Klarna ; ici
            la CSP n'autorise que les images de whaoo. */}
        <Image src="/icon.svg" alt="" width={48} height={48} className="mx-auto rounded-2xl" />
        <p className="mt-4 text-sm text-ardoise/75">{site.nom}</p>
        <h1 className="font-heading text-2xl font-semibold">{titre}</h1>
        {produit && (
          <p className="mt-1 text-lg">
            {formatEuros(Math.round(produit.prix * 100))}
            {produit.type === "physical" && produit.fraisPort
              ? ` + ${formatEuros(Math.round(produit.fraisPort * 100))} de livraison`
              : ""}
          </p>
        )}
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

        {actif && (produit || libre) && (
          <form action="/api/klarna/session" method="get" className="mt-5 flex flex-col gap-3">
            <input type="hidden" name="site" value={site.id} />
            {produit && <input type="hidden" name="produit" value={produit.id} />}
            {produit && quantiteMax > 1 && (
              <>
                <label className="text-left text-sm font-medium" htmlFor="quantite">
                  Quantité
                </label>
                <input
                  id="quantite"
                  name="quantite"
                  type="number"
                  min={1}
                  max={quantiteMax}
                  step={1}
                  required
                  defaultValue={quantiteInitiale}
                  className={CHAMP}
                />
              </>
            )}
            {libre && (
              <>
                <label className="text-left text-sm font-medium" htmlFor="montant">
                  Montant (de {libre.min} à {libre.max} €)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="montant"
                    name="montant"
                    type="number"
                    inputMode="decimal"
                    min={libre.min}
                    max={libre.max}
                    step="0.01"
                    required
                    defaultValue={montantInitial}
                    className={CHAMP}
                  />
                  <span className="text-lg">€</span>
                </div>
              </>
            )}
            <button
              type="submit"
              className="rounded-lg bg-[#FFB3C7] px-5 py-3 font-semibold text-black hover:brightness-95"
            >
              Payer avec Klarna
            </button>
          </form>
        )}
        {!actif && !message && (
          <p className="mt-5 text-sm">Le paiement Klarna n&apos;est pas encore activé.</p>
        )}

        <a href={site.urlRetour} className="mt-5 inline-block text-sm text-ardoise/75 underline underline-offset-2">
          Revenir sur {site.nom}
        </a>
      </div>
    </main>
  );
}
