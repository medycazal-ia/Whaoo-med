import { NextRequest, NextResponse } from "next/server";
import { boutiqueActive, creerAchat } from "@/lib/boutique/stripe";

const URL_APP = (process.env.NEXT_PUBLIC_APP_URL || "https://whaoo.site").replace(/\/$/, "");

// Bouton « Acheter » de /boutique (POST produit, quantite) : crée la page de
// paiement Stripe du produit et y envoie le visiteur.
export async function POST(request: NextRequest) {
  const boutique = new URL("/boutique", URL_APP);
  const form = await request.formData().catch(() => null);
  const produit = form?.get("produit");

  if (!boutiqueActive() || typeof produit !== "string" || !produit) {
    boutique.searchParams.set("erreur", "1");
    return NextResponse.redirect(boutique, 303);
  }

  try {
    const url = await creerAchat(produit, Number(form?.get("quantite") ?? 1), URL_APP);
    if (url) return NextResponse.redirect(url, 303);
  } catch (e) {
    console.error(e);
  }
  boutique.searchParams.set("erreur", "1");
  return NextResponse.redirect(boutique, 303);
}
