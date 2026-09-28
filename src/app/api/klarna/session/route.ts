import { NextRequest, NextResponse } from "next/server";
import { creerPaiementKlarna, klarnaConfigure } from "@/lib/klarna/api";
import { construireCommande, siteKlarna } from "@/lib/klarna/sites";

const URL_APP = (process.env.NEXT_PUBLIC_APP_URL || "https://whaoo.site").replace(/\/$/, "");

// Formulaire de /paiement/klarna (GET ?site=…&produit=…&quantite=… ou
// ?site=…&montant=…) : crée la session Klarna et envoie le visiteur sur la
// page de paiement Klarna.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const site = siteKlarna(params.get("site"));
  const page = new URL("/paiement/klarna", URL_APP);
  page.searchParams.set("site", site.id);
  const produit = params.get("produit");
  if (produit) page.searchParams.set("produit", produit);

  if (!klarnaConfigure()) {
    page.searchParams.set("etat", "indisponible");
    return NextResponse.redirect(page, 303);
  }

  const commande = construireCommande(site, {
    produit,
    quantite: params.get("quantite"),
    montant: params.get("montant"),
  });
  if ("erreur" in commande) {
    page.searchParams.set("etat", commande.erreur);
    return NextResponse.redirect(page, 303);
  }

  try {
    const urlKlarna = await creerPaiementKlarna(site, commande, URL_APP, page.toString());
    return NextResponse.redirect(urlKlarna, 303);
  } catch (e) {
    console.error(e);
    page.searchParams.set("etat", "erreur");
    return NextResponse.redirect(page, 303);
  }
}
