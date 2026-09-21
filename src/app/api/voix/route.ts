import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { genererVoix } from "@/lib/voix/elevenlabs";

// Limite basse : on ne sert que de courtes phrases de bienvenue/adieu, pas
// un usage détourné en synthèse vocale générale (l'API ElevenLabs est
// payante à l'usage).
const LONGUEUR_MAX = 80;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erreur: "non_authentifie" }, { status: 401 });
  }

  const { texte } = (await request.json().catch(() => ({}))) as { texte?: unknown };
  if (typeof texte !== "string" || !texte.trim() || texte.length > LONGUEUR_MAX) {
    return NextResponse.json({ erreur: "texte_invalide" }, { status: 400 });
  }

  const audio = await genererVoix(texte.trim());
  if (!audio) {
    return NextResponse.json({ erreur: "voix_indisponible" }, { status: 503 });
  }

  return new NextResponse(audio, {
    headers: { "content-type": "audio/mpeg" },
  });
}
