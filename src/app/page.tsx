import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { BoutonInstaller } from "@/components/bouton-installer";
import { VideoExplicative } from "@/components/video-explicative";
import { PublicationFacebook } from "@/components/publication-facebook";
import { liensSoutien, Soutien } from "@/components/soutien";

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
  const soutien = liensSoutien();

  return (
    <main className="flex flex-1 flex-col fond-marche">
      <header className="flex items-center justify-between px-4 sm:px-6 py-4">
        <span className="flex items-center gap-2 font-heading text-lg font-semibold text-ardoise">
          <Image src="/icon.svg" alt="" width={28} height={28} className="rounded-lg" />
          whaoo
        </span>
        <Link
          href="/connexion"
          className="rounded-lg border border-ardoise/20 px-3 py-1.5 text-sm text-ardoise hover:bg-ardoise/5"
        >
          Se connecter
        </Link>
      </header>

      {compte_supprime && (
        <p className="mx-6 mt-2 rounded-lg bg-basilic/15 px-4 py-2 text-center text-sm text-basilic">
          Ton compte et tes données ont bien été supprimés.
        </p>
      )}

      <section className="flex flex-col items-center gap-4 px-4 sm:px-6 pb-10 pt-4 text-center text-ardoise">
        <h1 className="max-w-lg font-heading text-3xl font-semibold">
          Tes courses, sans les mauvaises surprises en caisse
        </h1>
        <p className="max-w-md text-ardoise/75">
          Une appli simple qui note tes courses à la voix pendant que tu fais
          tes achats, suit ton budget du mois en temps réel, et te dit quand
          tu peux te faire plaisir — sans tableur, sans y penser.
        </p>

        <VideoExplicative />

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/demo"
            className="rounded-lg border border-ardoise/30 px-5 py-3 font-medium text-ardoise hover:bg-ardoise/5"
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
            className="text-sm text-ardoise/75 underline"
          >
            Inviter quelqu&apos;un
          </Link>
        )}
        <BoutonInstaller />
      </section>

      <section className="mx-auto grid w-full max-w-3xl gap-4 px-4 sm:px-6 pb-16 sm:grid-cols-3">
        {ARGUMENTS.map((arg) => (
          <div
            key={arg.titre}
            className="flex flex-col gap-2 rounded-2xl bg-white p-5 text-ardoise shadow-sm"
          >
            <span className="text-2xl">{arg.icon}</span>
            <h2 className="font-heading text-base font-semibold">{arg.titre}</h2>
            <p className="text-sm text-ardoise/75">{arg.texte}</p>
          </div>
        ))}
      </section>

      <section className="px-4 sm:px-6 pb-16">
        <PublicationFacebook />
      </section>

      {(soutien.stripe || soutien.lydia) && (
        <div className="border-t border-ardoise/10 px-4 sm:px-6 py-8">
          <Soutien stripe={soutien.stripe} lydia={soutien.lydia} centre />
          <audio controls preload="none" className="mx-auto mt-3 h-9 max-w-xs">
            <source src="/audio/soutien.mp3" type="audio/mpeg" />
          </audio>
          <p className="mx-auto mt-1 max-w-md text-center text-xs text-ardoise/75">
            🔊 Message du fondateur (17 secondes)
          </p>
        </div>
      )}

      <footer className="flex flex-wrap justify-center gap-4 border-t border-ardoise/10 px-4 sm:px-6 py-6 text-xs text-ardoise/75">
        <Link href="/mentions-legales" className="underline">
          Mentions légales
        </Link>
        <Link href="/confidentialite" className="underline">
          Politique de confidentialité
        </Link>
        <Link href="/cgu" className="underline">
          Conditions générales d&apos;utilisation
        </Link>
        <Link href="/cgv" className="underline">
          Conditions générales de vente
        </Link>
        <Link href="/partenaires" className="underline">
          Commerçants : devenez partenaire
        </Link>
      </footer>
    </main>
  );
}
