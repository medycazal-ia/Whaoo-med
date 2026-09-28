import { NextRequest, NextResponse } from "next/server";
import { etatPaiementKlarna, klarnaConfigure } from "@/lib/klarna/api";
import { siteKlarna } from "@/lib/klarna/sites";

const URL_APP = (process.env.NEXT_PUBLIC_APP_URL || "https://whaoo.site").replace(/\/$/, "");

// Retour de Klarna après paiement (?site=…&sid=<session HPP>) : on vérifie
// auprès de Klarna que le paiement est bien fait avant d'envoyer le
// visiteur sur la page « merci » du site d'origine.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const site = siteKlarna(params.get("site"));
  const sid = params.get("sid");
  const page = new URL(`/paiement/klarna?site=${encodeURIComponent(site.id)}`, URL_APP);

  if (!klarnaConfigure() || !sid) {
    page.searchParams.set("etat", "erreur");
    return NextResponse.redirect(page, 303);
  }

  try {
    const { statut } = await etatPaiementKlarna(sid);
    if (statut === "COMPLETED") return NextResponse.redirect(site.urlMerci, 303);
    page.searchParams.set("etat", statut === "CANCELLED" || statut === "BACK" ? "annule" : "refuse");
  } catch (e) {
    console.error(e);
    page.searchParams.set("etat", "erreur");
  }
  return NextResponse.redirect(page, 303);
}
