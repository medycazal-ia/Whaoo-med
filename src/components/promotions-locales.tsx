"use client";

import { useState } from "react";

type Statut = "idle" | "recherche" | "trouve" | "refuse" | "erreur";

/**
 * Géolocalisation gratuite (API navigateur, aucune clé, aucun coût) pour
 * situer l'utilisateur, avec une conversion coordonnées → nom de ville via
 * Nominatim (OpenStreetMap, gratuit, sans clé). Aucune donnée de position
 * n'est enregistrée : elle sert uniquement à afficher la ville le temps de
 * cette consultation. Pas de vraies promotions pour l'instant — ça
 * demande une vraie source de données (API payante ou partenariat), donc
 * on ne fabrique aucune fausse offre : juste un message honnête en
 * attendant.
 */
export function PromotionsLocales() {
  const [ouvert, setOuvert] = useState(false);
  const [statut, setStatut] = useState<Statut>("idle");
  const [ville, setVille] = useState<string | null>(null);

  async function localiser() {
    if (!("geolocation" in navigator)) {
      setStatut("erreur");
      return;
    }

    setStatut("recherche");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const reponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=fr`,
          );
          const data = await reponse.json();
          const lieu =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            data?.address?.municipality ||
            null;
          setVille(lieu);
          setStatut("trouve");
        } catch {
          setStatut("erreur");
        }
      },
      () => setStatut("refuse"),
      { timeout: 8000 },
    );
  }

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="self-start text-sm text-ardoise/60 underline"
      >
        📍 Promotions près de chez moi
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-ardoise/10 bg-white p-4">
      {statut === "idle" && (
        <>
          <p className="text-sm text-ardoise/70">
            Localise-toi pour voir les promotions des supermarchés proches
            (fonctionnalité en préparation). Ta position n&apos;est jamais
            enregistrée, elle sert juste à cet affichage.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={localiser}
              className="rounded-lg bg-ardoise px-4 py-2 text-sm font-medium text-craie"
            >
              Me localiser
            </button>
            <button
              type="button"
              onClick={() => setOuvert(false)}
              className="rounded-lg border border-ardoise/20 px-4 py-2 text-sm text-ardoise"
            >
              Annuler
            </button>
          </div>
        </>
      )}

      {statut === "recherche" && (
        <p className="text-sm text-ardoise/70">Localisation en cours…</p>
      )}

      {statut === "refuse" && (
        <>
          <p className="text-sm text-ardoise/60">
            Localisation refusée ou indisponible — pas de souci, tu peux
            réessayer à tout moment.
          </p>
          <button
            type="button"
            onClick={() => setOuvert(false)}
            className="self-start rounded-lg border border-ardoise/20 px-4 py-2 text-sm text-ardoise"
          >
            Fermer
          </button>
        </>
      )}

      {statut === "erreur" && (
        <>
          <p className="text-sm text-tomate">
            Impossible de récupérer ta position pour le moment.
          </p>
          <button
            type="button"
            onClick={() => setOuvert(false)}
            className="self-start rounded-lg border border-ardoise/20 px-4 py-2 text-sm text-ardoise"
          >
            Fermer
          </button>
        </>
      )}

      {statut === "trouve" && (
        <>
          <p className="text-sm text-ardoise">
            📍 {ville ? `Position détectée : ${ville}` : "Position détectée"}
          </p>
          <p className="text-sm text-ardoise/60">
            Les promotions des supermarchés de ta zone arrivent bientôt —
            cette partie a besoin d&apos;une vraie source de données
            (partenariat ou API), pas encore branchée. On ne voulait pas
            t&apos;afficher de fausses offres en attendant.
          </p>
          <button
            type="button"
            onClick={() => setOuvert(false)}
            className="self-start rounded-lg border border-ardoise/20 px-4 py-2 text-sm text-ardoise"
          >
            Fermer
          </button>
        </>
      )}
    </div>
  );
}
