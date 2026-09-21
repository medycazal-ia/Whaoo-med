import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
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
