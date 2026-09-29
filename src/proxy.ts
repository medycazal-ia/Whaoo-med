import { NextResponse, type NextRequest } from "next/server";
import { estDomaineBoutique } from "@/lib/boutique/domaines";
import { updateSession } from "@/lib/supabase/middleware";

const URL_APP = (process.env.NEXT_PUBLIC_APP_URL || "https://whaoo.site").replace(/\/$/, "");

// Pages de l'appli (comptes) qui n'ont pas leur place sur un domaine dédié à
// la boutique : renvoyées vers whaoo.site.
const PAGES_APPLI = ["/app", "/connexion", "/inscription", "/mot-de-passe-oublie", "/demo"];

export async function proxy(request: NextRequest) {
  if (estDomaineBoutique(request.headers.get("host"))) {
    const { pathname, search } = request.nextUrl;
    if (pathname === "/") {
      return NextResponse.rewrite(new URL(`/boutique${search}`, request.url));
    }
    if (PAGES_APPLI.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
      return NextResponse.redirect(`${URL_APP}${pathname}${search}`);
    }
    return NextResponse.next();
  }
  return updateSession(request);
}

export const config = {
  // Les routes /api/* gèrent chacune leur propre vérification d'accès
  // (session utilisateur, secret Bearer…) : les exclure ici évite qu'elles
  // ne déclenchent un deuxième rafraîchissement de session Supabase en
  // parallèle de celui de la page qui les appelle, ce qui provoquait une
  // erreur "Invalid Refresh Token" en cas de course entre les deux
  // (observé en production avec /api/voix, déclenchée juste après le
  // chargement de /app).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
