import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { envoyerNotification } from "@/lib/push/send";

// Déclenché par Vercel Cron (voir vercel.json). Vercel ajoute
// automatiquement l'en-tête "Authorization: Bearer $CRON_SECRET" quand une
// variable d'environnement CRON_SECRET est configurée sur le projet.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: utilisateursAvecAbonnement } = await admin
    .from("push_subscriptions")
    .select("user_id")
    .limit(1000);

  const userIds = [...new Set((utilisateursAvecAbonnement ?? []).map((r) => r.user_id))];
  if (userIds.length === 0) {
    return NextResponse.json({ notifies: 0 });
  }

  const { data: itemsEnAttente } = await admin
    .from("items")
    .select("user_id")
    .eq("status", "a_acheter")
    .in("user_id", userIds);

  const userIdsAvecAttente = [...new Set((itemsEnAttente ?? []).map((r) => r.user_id))];

  await Promise.all(
    userIdsAvecAttente.map((userId) =>
      envoyerNotification(userId, {
        title: "N'oublie pas tes courses",
        body: "Des articles attendent encore d'être achetés.",
        url: "/app",
      }),
    ),
  );

  return NextResponse.json({ notifies: userIdsAvecAttente.length });
}
