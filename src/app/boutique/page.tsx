import type { Metadata } from "next";
import Link from "next/link";
import { boutiqueActive, formatEuros, produitsBoutique, type ProduitBoutique } from "@/lib/boutique/stripe";
import { klarnaConfigure } from "@/lib/klarna/api";
import { siteKlarna } from "@/lib/klarna/sites";
import { EDITEUR } from "@/lib/legal-info";
import { headers } from "next/headers";
import { estDomaineBoutique } from "@/lib/boutique/domaines";

export const metadata: Metadata = {
  title: "Bons plans — whaoo",
  description: "Promotions et produits sélectionnés par whaoo, ou proposés par ses partenaires.",
};

const BOUTON =
  "inline-block rounded-lg bg-basilic px-4 py-2 text-sm font-medium text-craie hover:opacity-90";

// Boutique « Bons plans » : produits du compte Stripe WHAOO (métadonnée
// boutique = whaoo, voir src/lib/boutique/stripe.ts), payés sur la page
// Stripe (carte, Apple Pay, Klarna…) ; plus, si Klarna en direct est
// configuré, les produits du site « whaoo » de src/lib/klarna/sites.ts.
export default async function BoutiquePage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const { erreur } = await searchParams;
  // Sur un domaine dédié, la boutique est autonome : pas de lien vers
  // l'appli de courses.
  const surBoutique = estDomaineBoutique((await headers()).get("host"));
  const produits = await produitsBoutique().catch((e) => {
    console.error(e);
    return [] as ProduitBoutique[];
  });
  const produitsKlarna = klarnaConfigure() ? siteKlarna("whaoo").produits : [];
  const vide = produits.length === 0 && produitsKlarna.length === 0;
  // Produits regroupés par rubrique (métadonnée « categorie »), dans l'ordre
  // de leur premier produit.
  const rubriques: [string, ProduitBoutique[]][] = [];
  for (const p of produits) {
    const rubrique = rubriques.find(([c]) => c === p.categorie);
    if (rubrique) rubrique[1].push(p);
    else rubriques.push([p.categorie, [p]]);
  }
  // Lien de connexion au portail client Stripe (résiliation en ligne des
  // abonnements, obligatoire pour les particuliers).
  const portail = process.env.STRIPE_PORTAIL_URL || null;

  return (
    <main className="flex flex-1 flex-col fond-marche px-4 py-10 text-ardoise">
      <div className="mx-auto w-full max-w-4xl">
        {!surBoutique && (
          <Link href="/app" className="text-sm text-ardoise/75 underline underline-offset-2">
            ← Retour à mes courses
          </Link>
        )}
        <h1 className="mt-4 font-heading text-3xl font-semibold">{surBoutique ? "Boutique" : "Bons plans"} 🛍️</h1>
        <p className="mt-2 max-w-2xl text-ardoise/75">
          Des promotions et des produits choisis pour toi, parfois proposés par
          des partenaires de whaoo (c&apos;est alors indiqué). Le paiement se
          fait sur la page sécurisée de Stripe : whaoo ne voit aucune donnée
          bancaire.
        </p>

        {erreur && (
          <p role="status" className="mt-4 rounded-lg bg-rose/40 px-3 py-2 text-sm">
            Ce produit n&apos;est plus disponible ou le paiement n&apos;a pas pu
            démarrer. Réessaie dans quelques instants.
          </p>
        )}

        {vide ? (
          <p className="mt-10 rounded-2xl bg-craie p-6 text-center shadow-sm">
            {boutiqueActive() || klarnaConfigure()
              ? "Pas de bon plan pour le moment : reviens bientôt !"
              : "La boutique arrive bientôt."}
          </p>
        ) : (
          <div className="mt-8 space-y-10">
            {rubriques.map(([categorie, liste]) => (
              <section key={categorie}>
                {rubriques.length > 1 && (
                  <h2 className="mb-4 font-heading text-xl font-semibold">{categorie}</h2>
                )}
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {liste.map((p) => (
                    <CarteProduit key={p.id} p={p} />
                  ))}
                </ul>
              </section>
            ))}
            {produitsKlarna.length > 0 && (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {produitsKlarna.map((p) => (
                <li key={`klarna-${p.id}`} className="flex flex-col gap-2 rounded-2xl bg-craie p-4 shadow-sm">
                  <h2 className="font-heading text-lg font-semibold">{p.nom}</h2>
                  <p className="mt-auto text-xl font-semibold">
                    {formatEuros(Math.round(p.prix * 100))}
                    {p.type === "physical" && p.fraisPort ? (
                      <span className="ml-2 text-xs font-normal text-ardoise/75">
                        + {formatEuros(Math.round(p.fraisPort * 100))} de livraison
                      </span>
                    ) : null}
                  </p>
                  <a href={`/paiement/klarna?site=whaoo&produit=${encodeURIComponent(p.id)}`} className={BOUTON}>
                    Payer avec Klarna
                  </a>
                </li>
              ))}
              </ul>
            )}
          </div>
        )}

        {portail && (
          <p className="mt-10 text-sm">
            <a href={portail} className="underline underline-offset-2">
              Gérer ou résilier mon abonnement
            </a>
          </p>
        )}

        <p className={`${portail ? "mt-4" : "mt-10"} text-xs text-ardoise/75`}>
          Vendu par {EDITEUR.nom}, éditeur de whaoo, sauf mention d&apos;un
          partenaire : l&apos;offre et la livraison sont alors assurées par ce
          partenaire. Droit de rétractation de 14 jours pour les
          particuliers, abonnements sans engagement résiliables à tout moment
          en ligne.{" "}
          <Link href="/cgv" className="underline">
            Conditions générales de vente
          </Link>{" "}
          · Contact : {EDITEUR.emailContact}.
        </p>
      </div>
    </main>
  );
}

function CarteProduit({ p }: { p: ProduitBoutique }) {
  return (
    <li className="flex flex-col overflow-hidden rounded-2xl bg-craie shadow-sm">
      {p.image && (
        // eslint-disable-next-line @next/next/no-img-element -- image hébergée par Stripe
        <img src={p.image} alt="" className="aspect-[4/3] w-full bg-white object-contain" />
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {p.partenaire && (
          <p className="text-xs font-medium uppercase tracking-wide text-ardoise/75">
            Partenaire · {p.partenaire}
          </p>
        )}
        <h3 className="font-heading text-lg font-semibold">{p.nom}</h3>
        {p.description && <p className="text-sm text-ardoise/75">{p.description}</p>}
        <div className="mt-auto flex flex-wrap items-baseline gap-2 pt-2">
          {p.prix !== null && (
            <span className="text-xl font-semibold">
              {formatEuros(p.prix)}
              {p.recurrence && <span className="text-sm font-normal"> / {p.recurrence}</span>}
            </span>
          )}
          {p.prixBarre !== null && p.prix !== null && p.prixBarre > p.prix && (
            <span className="text-sm text-ardoise/75 line-through">{formatEuros(p.prixBarre)}</span>
          )}
          {p.physique && p.prix !== null && (
            <span className="text-xs text-ardoise/75">
              {p.fraisPort ? `+ ${formatEuros(p.fraisPort)} de livraison` : "Livraison offerte"}
            </span>
          )}
        </div>
        {p.prixId ? (
          <form action="/api/boutique/achat" method="post">
            <input type="hidden" name="produit" value={p.id} />
            <input type="hidden" name="quantite" value="1" />
            <button type="submit" className={BOUTON}>
              {p.recurrence ? "S'abonner" : "Acheter"}
            </button>
          </form>
        ) : (
          p.lien && (
            <a href={p.lien} target="_blank" rel="noopener sponsored" className={BOUTON}>
              Voir l&apos;offre ↗
            </a>
          )
        )}
      </div>
    </li>
  );
}
