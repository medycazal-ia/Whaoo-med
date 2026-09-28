// Bloc « Soutenir whaoo » : contribution libre par carte (lien de paiement
// Stripe, montant au choix) et/ou par Lydia. Chaque moyen n'apparaît que si
// son lien est configuré sur Render ; sans aucun des deux, rien ne s'affiche.

export function liensSoutien() {
  return {
    stripe: process.env.STRIPE_SUPPORT_LINK_URL || null,
    lydia: process.env.SUPPORT_LINK_URL || null,
  };
}

export function Soutien({
  stripe,
  lydia,
  centre = false,
}: {
  stripe: string | null;
  lydia: string | null;
  centre?: boolean;
}) {
  if (!stripe && !lydia) return null;

  return (
    <div className={centre ? "text-center" : undefined}>
      <p className={`text-sm text-ardoise/75 ${centre ? "mx-auto max-w-md" : ""}`}>
        whaoo est gratuite à l&apos;usage de base et développée seule. Si elle
        te rend service, une contribution libre est toujours appréciée —{" "}
        <strong className="text-ardoise">entièrement facultative, sans aucune
        obligation</strong>. Le paiement passe par{" "}
        {stripe && "Stripe"}
        {stripe && lydia && " ou "}
        {lydia && "Lydia"}, des plateformes de paiement sécurisées : whaoo ne
        voit ni ne conserve aucune donnée bancaire.
      </p>
      <div className={`mt-3 flex flex-wrap items-center gap-3 ${centre ? "justify-center" : ""}`}>
        {stripe && (
          <a
            href={stripe}
            className="rounded-lg bg-basilic px-4 py-2 text-sm font-medium text-craie hover:opacity-90"
          >
            💳 Soutenir par carte
          </a>
        )}
        {lydia && (
          <a
            href={lydia}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-ardoise/20 px-4 py-2 text-sm font-medium text-ardoise hover:bg-ardoise/5"
          >
            Soutenir avec Lydia
          </a>
        )}
      </div>
      {stripe && (
        <p className="mt-2 text-xs text-ardoise/75">
          Carte bancaire, Apple Pay ou Google Pay — montant libre à partir de 1 €.
        </p>
      )}
    </div>
  );
}
