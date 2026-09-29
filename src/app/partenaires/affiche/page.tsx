import type { Metadata } from "next";
import Image from "next/image";
import { lienPartenaire, qrCodeSvg } from "@/lib/partenaires";
import { BoutonImprimer } from "./bouton-imprimer";

export const metadata: Metadata = {
  title: "Affiche partenaire — whaoo",
  robots: { index: false, follow: false },
};

// Affiche A4 à imprimer pour un commerçant partenaire :
// /partenaires/affiche?nom=Boulangerie%20Ti%20Pain
// Le QR code mène à whaoo.site/?partenaire=boulangerie-ti-pain.
export default async function AffichePage({
  searchParams,
}: {
  searchParams: Promise<{ nom?: string }>;
}) {
  const nom = ((await searchParams).nom ?? "").trim().slice(0, 60);
  const lien = lienPartenaire(nom);
  const qr = await qrCodeSvg(lien);

  return (
    <main className="flex flex-1 flex-col items-center bg-white px-4 py-8 text-ardoise print:p-0">
      <style>{"@page { size: A4; margin: 0 }"}</style>

      <form className="mb-6 flex w-full max-w-md flex-col gap-2 print:hidden sm:flex-row">
        <label htmlFor="nom" className="sr-only">
          Nom du commerce
        </label>
        <input
          id="nom"
          name="nom"
          defaultValue={nom}
          placeholder="Nom du commerce (facultatif)"
          className="flex-1 rounded-lg border border-ardoise/20 px-3 py-2"
        />
        <button type="submit" className="rounded-lg border border-ardoise/30 px-4 py-2 hover:bg-ardoise/5">
          Mettre à jour
        </button>
        <BoutonImprimer />
      </form>

      <div className="flex aspect-[210/297] w-full max-w-[640px] flex-col items-center justify-between rounded-2xl border border-ardoise/10 bg-gradient-to-b from-menthe to-rose p-10 text-center shadow print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        <div className="flex flex-col items-center">
          <Image src="/icon.svg" alt="" width={96} height={96} className="rounded-3xl" />
          <p className="mt-3 font-heading text-5xl font-semibold">whaoo</p>
          <p className="mt-4 font-heading text-2xl font-semibold sm:text-3xl">
            Tes courses malignes,
            <br />
            ton budget tenu.
          </p>
          <p className="mt-3 max-w-md text-lg text-ardoise/80">
            Liste de courses, suivi du budget et bons plans près de chez toi.
            Gratuit.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="h-56 w-56 sm:h-64 sm:w-64" dangerouslySetInnerHTML={{ __html: qr }} />
        </div>

        <div>
          <p className="font-heading text-2xl font-semibold">Scanne et essaie !</p>
          {nom && <p className="mt-2 text-lg">Offert par {nom}, partenaire whaoo</p>}
          <p className="mt-2 text-sm text-ardoise/75">{lien.replace(/^https:\/\//, "")}</p>
        </div>
      </div>
    </main>
  );
}
