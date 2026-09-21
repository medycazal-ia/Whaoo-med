import Link from "next/link";
import Image from "next/image";
import { LANGUES_PITCH, type LangPitch, type ContenuPitch } from "@/lib/pitch-content";

const EMAIL_CONTACT = "cazal@medy.site";

export function PitchPage({ lang, contenu }: { lang: LangPitch; contenu: ContenuPitch }) {
  return (
    <main className="min-h-screen fond-marche text-ardoise">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-ardoise/10 bg-craie/95 px-4 py-3 backdrop-blur sm:px-8">
        <span className="flex items-center gap-2 font-heading text-lg font-semibold">
          <Image src="/icon.svg" alt="" width={26} height={26} className="rounded-lg" />
          {contenu.nomBouton}
        </span>
        <nav className="flex gap-1 text-sm">
          {LANGUES_PITCH.map((l) => (
            <Link
              key={l.code}
              href={`/pitch/${l.code}`}
              className={`rounded-lg px-2.5 py-1 ${
                l.code === lang ? "bg-ardoise text-craie" : "text-ardoise/60 hover:bg-ardoise/10"
              }`}
            >
              {l.code.toUpperCase()}
            </Link>
          ))}
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-4xl flex-col items-center gap-5 px-4 py-14 text-center sm:px-8">
        <h1 className="font-heading text-3xl font-bold leading-tight sm:text-4xl">
          {contenu.tagline}
        </h1>
        <p className="max-w-2xl text-lg text-ardoise/70">{contenu.intro}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/demo"
            className="rounded-xl bg-ardoise px-6 py-3 font-medium text-craie shadow hover:bg-ardoise-light"
          >
            🎯 {contenu.ctaDemo}
          </Link>
          <a
            href={`mailto:${EMAIL_CONTACT}`}
            className="rounded-xl border border-ardoise/20 px-6 py-3 font-medium text-ardoise hover:bg-ardoise/5"
          >
            ✉️ {contenu.ctaContact}
          </a>
        </div>
      </section>

      {/* Problème / solution */}
      <section className="mx-auto grid max-w-5xl gap-6 px-4 pb-14 sm:grid-cols-2 sm:px-8">
        <div className="rounded-2xl border border-tomate/25 bg-tomate/5 p-6">
          <h2 className="mb-2 font-heading text-xl font-semibold text-tomate">
            {contenu.problemeTitre}
          </h2>
          <p className="text-ardoise/80">{contenu.problemeTexte}</p>
        </div>
        <div className="rounded-2xl border border-basilic/25 bg-basilic/5 p-6">
          <h2 className="mb-2 font-heading text-xl font-semibold text-basilic">
            {contenu.solutionTitre}
          </h2>
          <p className="text-ardoise/80">{contenu.solutionTexte}</p>
        </div>
      </section>

      {/* Mockups */}
      <section className="bg-ardoise px-4 py-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {contenu.mockups.map((m) => (
            <div key={m.image} className="flex flex-col items-center gap-4 text-center">
              <div className="overflow-hidden rounded-[2rem] border-[6px] border-ardoise-light bg-black shadow-2xl">
                <Image
                  src={m.image}
                  alt={m.titre}
                  width={390}
                  height={844}
                  className="h-auto w-[220px]"
                />
              </div>
              <div>
                <p className="font-heading font-semibold text-craie">{m.titre}</p>
                <p className="mt-1 text-sm text-craie/70">{m.texte}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pourquoi maintenant */}
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-8">
        <h2 className="mb-5 text-center font-heading text-2xl font-semibold">
          {contenu.pourquoiTitre}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {contenu.pourquoiPoints.map((p, i) => (
            <li key={i} className="flex gap-2 rounded-xl border border-ardoise/10 bg-white p-4 text-sm text-ardoise/80">
              <span className="text-ambre">●</span>
              {p}
            </li>
          ))}
        </ul>
      </section>

      {/* Modèle + feuille de route */}
      <section className="mx-auto grid max-w-5xl gap-6 px-4 pb-14 sm:grid-cols-2 sm:px-8">
        <div className="rounded-2xl border border-ambre/30 bg-ambre/10 p-6">
          <h2 className="mb-2 font-heading text-xl font-semibold text-ambre">
            {contenu.modeleTitre}
          </h2>
          <p className="text-ardoise/80">{contenu.modeleTexte}</p>
        </div>
        <div className="rounded-2xl border border-ardoise/15 bg-white p-6">
          <h2 className="mb-3 font-heading text-xl font-semibold">{contenu.feuilleTitre}</h2>
          <ol className="flex flex-col gap-2 text-sm text-ardoise/80">
            {contenu.feuillePoints.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-semibold text-ardoise">{i + 1}.</span>
                {p}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-ardoise/10 bg-white px-4 py-14 text-center sm:px-8">
        <h2 className="mb-2 font-heading text-2xl font-semibold">{contenu.contactTitre}</h2>
        <p className="mx-auto mb-5 max-w-xl text-ardoise/70">{contenu.contactTexte}</p>
        <a
          href={`mailto:${EMAIL_CONTACT}`}
          className="inline-block rounded-xl bg-basilic px-6 py-3 font-medium text-craie hover:opacity-90"
        >
          {EMAIL_CONTACT}
        </a>
      </section>
    </main>
  );
}
