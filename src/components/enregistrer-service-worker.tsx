"use client";

import { useEffect } from "react";

// Enregistre le service worker dès le chargement de l'app (pas seulement
// quand l'utilisateur active les notifications) : c'est nécessaire pour que
// les navigateurs (Chrome/Edge/Android) considèrent l'app comme installable
// et proposent le bouton natif "Installer".
export function EnregistrerServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Pas grave si ça échoue ici (ex. navigateur non supporté) : les
        // notifications push géreront leur propre enregistrement/erreur.
      });
    }
  }, []);

  return null;
}
