import { NextRequest, NextResponse } from "next/server";
import { creerPaiementKlarna, klarnaConfigure } from "@/lib/klarna/api";
import { montantEnCentimes, siteKlarna } from "@/lib/klarna/sites";

const URL_APP = (process.env.NEXT_PUBLIC_APP_URL || "https://whaoo.site").replace(/\/$/, "");

// Formulaire de /paiement/klarna (GET ?site=…&montant=…) : crée la session
// Klarna et envoie le visiteur sur la page de paiement Klarna.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const site = siteKlarna(params.get("site"));
  const page = new URL(`/paiement/klarna?site=${encodeURIComponent(site.id)}`, URL_APP);

  if (!klarnaConfigure()) {
    page.searchParams.set("etat", "indisponible");
    return NextResponse.redirect(page, 303);
  }

  const centimes = montantEnCentimes(params.get("montant"), site);
  if (centimes === null) {
    page.searchParams.set("etat", "montant");
    return NextResponse.redirect(page, 303);
  }

  try {
    const urlKlarna = await creerPaiementKlarna(site, centimes, URL_APP);
    return NextResponse.redirect(urlKlarna, 303);
  } catch (e) {
    console.error(e);
    page.searchParams.set("etat", "erreur");
    return NextResponse.redirect(page, 303);
  }
}
