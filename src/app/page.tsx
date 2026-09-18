import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BoutonInstaller } from "@/components/bouton-installer";

const ARGUMENTS = [
  {
    icon: "🎙️",
    titre: "Note à la voix, pas de saisie fastidieuse",
    texte: "Dis l'article et le prix, l'appli fait le reste.",
  },
  {
    icon: "📊",
    titre: "Ton budget du mois, en clair",
    texte:
      "Un indicateur simple pour savoir si tu peux encore y aller ou s'il faut ralentir.",
  },
  {
    icon: "🐷",
    titre: "Une cagnotte qui se remplit toute seule",
    texte:
      "Quand tu dépenses moins que prévu, l'appli te le dit et te suggère un petit plaisir mérité.",
  },
];

async function recupererCodeParrainage(): Promise<string | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("referral_code")
      .eq("id", user.id)
      .single();

    return profile?.referral_code ?? null;
  } catch {
    return null;
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ compte_supprime?: string }>;
}) {
  const { compte_supprime } = await searchParams;
  const referralCode = await recupererCodeParrainage();
  const supportLinkUrl = process.env.SUPPORT_LINK_URL;

  return (
    <main className="flex flex-1 flex-col bg-ardoise">
      <header className="flex items-center justify-between px-4 sm:px-6 py-4">
        <span className="font-heading text-lg font-semibold text-craie">
          🛒 whaoo
        </span>
        <Link
          href="/connexion"
          className="rounded-lg border border-craie/30 px-3 py-1.5 text-sm text-craie hover:bg-craie/10"
        >
          Se connecter
        </Link>
      </header>

      {compte_supprime && (
        <p className="mx-6 mt-2 rounded-lg bg-basilic/15 px-4 py-2 text-center text-sm text-basilic">
          Ton compte et tes données ont bien été supprimés.
        </p>
      )}

      <section className="flex flex-col items-center gap-4 px-4 sm:px-6 pb-10 pt-4 text-center text-craie">
        <h1 className="max-w-lg font-heading text-3xl font-semibold">
          Tes courses, sans les mauvaises surprises en caisse
        </h1>
        <p className="max-w-md text-craie/80">
          Une appli simple qui note tes courses à la voix pendant que tu fais
          tes achats, suit ton budget du mois en temps réel, et te dit quand
          tu peux te faire plaisir — sans tableur, sans y penser.
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/demo"
            className="rounded-lg border border-craie/40 px-5 py-3 font-medium text-craie hover:bg-craie/10"
          >
            Essayer la démo
          </Link>
          <Link
            href="/inscription"
            className="rounded-lg bg-basilic px-5 py-3 font-medium text-craie hover:opacity-90"
          >
            Créer mon compte
          </Link>
        </div>
        {referralCode && (
          <Link
            href={`/inscription?parrain=${referralCode}`}
            className="text-sm text-craie/60 underline"
          >
            Inviter quelqu&apos;un
          </Link>
        )}
        <BoutonInstaller />
      </section>

      <section className="mx-auto w-full max-w-2xl px-4 sm:px-6 pb-10">
        <div className="overflow-hidden rounded-2xl border border-craie/15 bg-black/20">
          <video
            controls
            preload="metadata"
            playsInline
            poster="/videos/whaoo-demo-poster.jpg"
            className="w-full"
          >
            <source src="/videos/whaoo-demo.mp4" type="video/mp4" />
          </video>
        </div>
        <p className="mt-2 text-center text-xs text-craie/50">
          Voir comment ça marche en 40 secondes
        </p>
      </section>

      <section className="mx-auto grid w-full max-w-3xl gap-4 px-4 sm:px-6 pb-16 sm:grid-cols-3">
        {ARGUMENTS.map((arg) => (
          <div
            key={arg.titre}
            className="flex flex-col gap-2 rounded-2xl bg-ardoise-light p-5 text-craie"
          >
            <span className="text-2xl">{arg.icon}</span>
            <h2 className="font-heading text-base font-semibold">{arg.titre}</h2>
            <p className="text-sm text-craie/70">{arg.texte}</p>
          </div>
        ))}
      </section>

      {supportLinkUrl && (
        <div className="border-t border-craie/10 px-4 sm:px-6 py-8 text-center">
          <p className="mx-auto max-w-md text-xs text-craie/50">
            Cette appli est gratuite à l&apos;usage de base et développée
            seule. Si elle te rend service, tu peux{" "}
            <a href={supportLinkUrl} className="underline" target="_blank" rel="noreferrer">
              soutenir son développement
            </a>{" "}
            et celui d&apos;autres outils pratiques et accessibles, sans
            obligation — chaque contribution aide à continuer sans faire
            payer l&apos;essentiel.
          </p>
        </div>
      )}

      <footer className="flex flex-wrap justify-center gap-4 border-t border-craie/10 px-4 sm:px-6 py-6 text-xs text-craie/50">
        <Link href="/mentions-legales" className="underline">
          Mentions légales
        </Link>
        <Link href="/confidentialite" className="underline">
          Politique de confidentialité
        </Link>
        <Link href="/cgu" className="underline">
          Conditions générales d&apos;utilisation
        </Link>
      </footer>
    </main>
  );
}
