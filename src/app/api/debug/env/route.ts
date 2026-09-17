import { NextResponse } from "next/server";

// Route de diagnostic TEMPORAIRE — à supprimer une fois le déploiement
// stabilisé. Ne révèle jamais les valeurs des secrets, seulement leur
// présence et un aperçu tronqué pour vérifier qu'ils sont bien chargés.
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: url ? `présent (${url.slice(0, 25)}...)` : "ABSENT",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey
      ? `présent (${anonKey.length} caractères, commence par "${anonKey.slice(0, 12)}...")`
      : "ABSENT",
    SUPABASE_SERVICE_ROLE_KEY: serviceKey
      ? `présent (${serviceKey.length} caractères, commence par "${serviceKey.slice(0, 8)}...")`
      : "ABSENT",
    NEXT_PUBLIC_APP_URL: appUrl ? `présent (${appUrl})` : "ABSENT",
  });
}
