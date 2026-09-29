import { NextRequest, NextResponse } from "next/server";
import { adresseBoutique } from "@/lib/boutique/domaines";
import { boutiqueActive, creerAchat } from "@/lib/boutique/stripe";

// Bouton « Acheter » de /boutique (POST produit, quantite) : crée la page de
// paiement Stripe du produit et y envoie le visiteur. Sur un domaine dédié à
// la boutique, le client y revient après le paiement.
export async function POST(request: NextRequest) {
  const { base, chemin } = adresseBoutique(request.headers.get("host"));
  const boutique = new URL(chemin, base);
  const form = await request.formData().catch(() => null);
  const produit = form?.get("produit");

  if (!boutiqueActive() || typeof produit !== "string" || !produit) {
    boutique.searchParams.set("erreur", "1");
    return NextResponse.redirect(boutique, 303);
  }

  try {
    const url = await creerAchat(produit, Number(form?.get("quantite") ?? 1), base, chemin);
    if (url) return NextResponse.redirect(url, 303);
  } catch (e) {
    console.error(e);
  }
  boutique.searchParams.set("erreur", "1");
  return NextResponse.redirect(boutique, 303);
}
