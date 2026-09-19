"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function estDejaInstallee(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function estIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function BoutonInstaller() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installee, setInstallee] = useState(estDejaInstallee);
  const [afficherInstructionsIOS, setAfficherInstructionsIOS] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    const onInstalled = () => setInstallee(true);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installee) return null;

  if (promptEvent) {
    return (
      <button
        type="button"
        onClick={async () => {
          await promptEvent.prompt();
          await promptEvent.userChoice;
          setPromptEvent(null);
        }}
        className="rounded-lg border border-ardoise/30 px-4 py-2 text-sm font-medium text-ardoise hover:bg-ardoise/5"
      >
        📲 Installer l&apos;application
      </button>
    );
  }

  if (estIOS()) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setAfficherInstructionsIOS((v) => !v)}
          className="rounded-lg border border-ardoise/30 px-4 py-2 text-sm font-medium text-ardoise hover:bg-ardoise/5"
        >
          📲 Installer l&apos;application
        </button>
        {afficherInstructionsIOS && (
          <p className="mt-2 max-w-xs text-xs text-ardoise/60">
            Sur iPhone : appuie sur <strong>Partager</strong> (l&apos;icône
            avec la flèche) puis <strong>« Sur l&apos;écran d&apos;accueil »</strong>.
          </p>
        )}
      </div>
    );
  }

  return null;
}
