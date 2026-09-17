import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

function configurerVapid() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error("Clés VAPID manquantes — voir .env.example");
  }

  webpush.setVapidDetails("mailto:contact@whaoo.app", publicKey, privateKey);
}

export type NotificationPush = {
  title: string;
  body: string;
  url?: string;
};

// Envoie une notification à tous les abonnements d'un utilisateur (un
// même compte peut être ouvert sur plusieurs appareils). Utilise le
// client "service role" car cette fonction est appelée depuis une tâche
// planifiée (cron), pas depuis une requête de l'utilisateur lui-même.
export async function envoyerNotification(userId: string, notification: NotificationPush) {
  configurerVapid();
  const admin = createAdminClient();

  const { data: abonnements } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (!abonnements?.length) return;

  await Promise.all(
    abonnements.map(async (abonnement) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: abonnement.endpoint,
            keys: { p256dh: abonnement.p256dh, auth: abonnement.auth },
          },
          JSON.stringify(notification),
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        // Abonnement expiré ou révoqué par le navigateur : on le supprime
        // plutôt que de réessayer indéfiniment.
        if (statusCode === 404 || statusCode === 410) {
          await admin.from("push_subscriptions").delete().eq("id", abonnement.id);
        }
      }
    }),
  );
}
