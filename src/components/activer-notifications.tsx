"use client";

import { useEffect, useState } from "react";
import { enregistrerAbonnementPush, supprimerAbonnementPush } from "@/lib/push/actions";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

function pushDisponible(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

export function ActiverNotifications() {
  const [statut, setStatut] = useState<"inconnu" | "actif" | "inactif" | "non_supporte">(() =>
    pushDisponible() ? "inconnu" : "non_supporte",
  );
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    if (!pushDisponible()) return;

    navigator.serviceWorker.register("/sw.js").then(async (registration) => {
      const subscription = await registration.pushManager.getSubscription();
      setStatut(subscription ? "actif" : "inactif");
    });
  }, []);

  async function activer() {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      setStatut("non_supporte");
      return;
    }

    setEnCours(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatut("inactif");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });

      const json = subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      const { ok } = await enregistrerAbonnementPush(json);
      setStatut(ok ? "actif" : "inactif");
    } finally {
      setEnCours(false);
    }
  }

  async function desactiver() {
    setEnCours(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await supprimerAbonnementPush(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setStatut("inactif");
    } finally {
      setEnCours(false);
    }
  }

  if (statut === "non_supporte") {
    return (
      <p className="text-sm text-ardoise/60">
        Les notifications push ne sont pas disponibles sur ce navigateur.
      </p>
    );
  }

  return (
    <div>
      <p className="text-sm text-ardoise/70">
        Reçois un rappel quand des articles attendent encore d&apos;être
        achetés.
      </p>
      <button
        type="button"
        disabled={enCours || statut === "inconnu"}
        onClick={statut === "actif" ? desactiver : activer}
        className="mt-3 rounded-lg border border-ardoise/20 px-4 py-2 text-sm font-medium text-ardoise hover:bg-ardoise/5 disabled:opacity-50"
      >
        {statut === "actif" ? "Désactiver les rappels" : "Activer les rappels"}
      </button>
    </div>
  );
}
