import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EDITEUR } from "@/lib/legal-info";

export const metadata: Metadata = {
  title: "Devenez partenaire — whaoo",
  description:
    "Commerçants : faites connaître vos promotions aux utilisateurs de whaoo, l'appli de liste de courses et de budget, et profitez d'un site vitrine.",
};

const ETAPES = [
  {
    titre: "Vos promotions dans whaoo",
    texte:
      "Vos bons plans apparaissent dans la boutique « Bons plans » de l'appli, sous votre nom, auprès de personnes qui préparent justement leurs courses.",
  },
  {
    titre: "Votre site vitrine",
    texte:
      "Un site professionnel à votre nom (avec nom de domaine et hébergement si besoin), à prix réduit pour les partenaires.",
  },
  {
    titre: "Une affiche à votre caisse",
    texte:
      "Vous affichez le QR code whaoo et en parlez à vos clients : ils découvrent une appli gratuite qui les aide à tenir leur budget, et vos offres dedans.",
  },
];

const MAILTO = `mailto:${EDITEUR.emailContact}?subject=${encodeURIComponent(
  "Devenir partenaire whaoo",
)}&body=${encodeURIComponent(
  "Bonjour,\n\nNom du commerce :\nActivité :\nVille :\nTéléphone :\n\nJe souhaite devenir partenaire whaoo.\n",
)}`;

// Page destinée aux commerçants : l'échange « mise en avant dans whaoo +
// site vitrine » contre la promotion de whaoo auprès de leurs clients.
export default function PartenairesPage() {
  return (
    <main className="flex flex-1 flex-col fond-marche px-4 py-12 text-ardoise">
      <div className="mx-auto w-full max-w-3xl">
        <Image src="/icon.svg" alt="" width={56} height={56} className="rounded-2xl" />
        <h1 className="mt-4 font-heading text-3xl font-semibold sm:text-4xl">
          Commerçants, devenez partenaire whaoo
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-ardoise/80">
          whaoo aide chacun à préparer sa liste de courses et à tenir son
          budget, face à la vie chère. Vos promotions y trouvent naturellement
          leur place : on se fait connaître ensemble.
        </p>

        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {ETAPES.map((e, i) => (
            <li key={e.titre} className="rounded-2xl bg-craie p-5 shadow-sm">
              <p className="font-heading text-2xl font-semibold text-basilic">{i + 1}</p>
              <h2 className="mt-1 font-heading text-lg font-semibold">{e.titre}</h2>
              <p className="mt-2 text-sm text-ardoise/75">{e.texte}</p>
            </li>
          ))}
        </ol>

        <section className="mt-8 rounded-2xl bg-craie p-6 shadow-sm">
          <h2 className="font-heading text-xl font-semibold">Ce que ça vous coûte</h2>
          <p className="mt-2 text-ardoise/80">
            La mise en avant de vos promotions est gratuite pendant le
            lancement. En échange, vous faites connaître whaoo à vos clients
            (affiche, réseaux sociaux). Le site vitrine est proposé à un tarif
            partenaire, sans engagement.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a
              href={MAILTO}
              className="rounded-lg bg-basilic px-5 py-3 text-center font-medium text-craie hover:opacity-90"
            >
              Je veux devenir partenaire
            </a>
            <Link
              href="/boutique"
              className="rounded-lg border border-ardoise/30 px-5 py-3 text-center font-medium hover:bg-ardoise/5"
            >
              Voir la boutique et le site vitrine
            </Link>
          </div>
        </section>

        <p className="mt-8 text-sm text-ardoise/75">
          Déjà partenaire ? Créez et imprimez votre affiche avec votre QR
          code :{" "}
          <Link href="/partenaires/affiche" className="underline">
            générer mon affiche
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
