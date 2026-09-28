import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supprimerMonCompte } from "@/lib/compte/actions";
import { definirDebutPeriode } from "@/lib/courses/actions";
import { debutPeriode, libellePeriode, normaliserJourDebut, JOUR_DEBUT_MAX } from "@/lib/courses/rythme";
import { ActiverNotifications } from "@/components/activer-notifications";

const ERROR_MESSAGES: Record<string, string> = {
  confirmation: "Tape exactement SUPPRIMER pour confirmer.",
  suppression: "La suppression a échoué, réessaie ou contacte le support.",
  periode: "La période n'a pas pu être modifiée, réessaie.",
};

export default async function ParametresPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const supportLinkUrl = process.env.SUPPORT_LINK_URL;

  const { data: profil } = await supabase
    .from("profiles")
    .select("jour_debut_periode")
    .eq("id", user.id)
    .maybeSingle();
  const jourDebut = normaliserJourDebut(profil?.jour_debut_periode);
  const periodeActuelle = libellePeriode(debutPeriode(new Date(), jourDebut));

  return (
    <main className="flex flex-1 flex-col fond-marche">
      <header className="flex items-center gap-3 bg-gradient-to-r from-kaki to-basilic px-3 py-3 sm:px-6 sm:py-4">
        <Link href="/app" className="text-sm text-craie/70 hover:text-craie">
          ← Retour
        </Link>
        <h1 className="font-heading text-xl font-semibold text-craie">
          Paramètres
        </h1>
      </header>

      <section className="mx-auto flex w-full max-w-lg md:max-w-2xl lg:max-w-4xl flex-col gap-6 px-4 sm:px-6 py-6">
        <div className="rounded-2xl bg-white p-5">
          <h2 className="font-heading text-lg font-semibold text-ardoise">
            Période du budget
          </h2>
          <p className="mt-1 text-sm text-ardoise/70">
            Par défaut, ton budget suit le mois calendaire. Tu peux le caler
            sur ton jour de paie : avec le 25, il court du 25 au 24 du mois
            suivant. Tes totaux, ta cagnotte et tes factures suivent ces dates.
          </p>
          <p className="mt-2 text-sm text-ardoise">
            Période en cours : <strong>{periodeActuelle}</strong>
          </p>
          {error === "periode" && (
            <p className="mt-2 rounded-lg bg-tomate/10 px-3 py-2 text-sm text-tomate">
              {ERROR_MESSAGES.periode}
            </p>
          )}
          {ok === "periode" && (
            <p className="mt-2 rounded-lg bg-basilic/10 px-3 py-2 text-sm text-basilic">
              ✓ Période mise à jour.
            </p>
          )}
          <form action={definirDebutPeriode} className="mt-3 flex flex-wrap items-center gap-2">
            <label htmlFor="jourDebut" className="text-sm text-ardoise">
              Mon mois commence le
            </label>
            <select
              id="jourDebut"
              name="jourDebut"
              defaultValue={jourDebut}
              className="rounded-lg border border-ardoise/20 bg-white px-3 py-2 text-sm text-ardoise"
            >
              {Array.from({ length: JOUR_DEBUT_MAX }, (_, i) => i + 1).map((jour) => (
                <option key={jour} value={jour}>
                  {jour === 1 ? "1er (mois calendaire)" : jour}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg border border-ardoise/20 px-4 py-2 text-sm font-medium text-ardoise hover:bg-ardoise/5"
            >
              Enregistrer
            </button>
          </form>
          <p className="mt-2 text-xs text-ardoise/50">
            Jusqu&apos;au 28 seulement, pour que chaque mois ait ce jour-là
            (février compris).
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5">
          <h2 className="font-heading text-lg font-semibold text-ardoise">
            Rappels
          </h2>
          <div className="mt-1">
            <ActiverNotifications />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5">
          <h2 className="font-heading text-lg font-semibold text-ardoise">
            Tes données
          </h2>
          <p className="mt-1 text-sm text-ardoise/70">
            Télécharge une copie de toutes tes données (profil, budgets,
            articles) au format JSON.
          </p>
          <a
            href="/app/parametres/export"
            className="mt-4 inline-block rounded-lg border border-ardoise/20 px-4 py-2 text-sm font-medium text-ardoise hover:bg-ardoise/5"
          >
            Exporter mes données
          </a>
        </div>

        {supportLinkUrl && (
          <div className="rounded-2xl bg-white p-5">
            <h2 className="font-heading text-lg font-semibold text-ardoise">
              Soutenir whaoo
            </h2>
            <p className="mt-1 text-sm text-ardoise/70">
              whaoo est gratuite à l&apos;usage de base et développée seule.
              Si elle te rend service, une contribution libre est toujours
              appréciée —{" "}
              <strong className="text-ardoise">entièrement facultative,
              sans aucune obligation</strong>. Le paiement passe par{" "}
              <a href={supportLinkUrl} className="underline" target="_blank" rel="noreferrer">
                Lydia
              </a>
              , une plateforme bancaire française sécurisée : whaoo ne voit
              ni ne conserve aucune donnée bancaire.
            </p>
            <audio controls preload="none" className="mt-3 h-9 max-w-xs">
              <source src="/audio/soutien.mp3" type="audio/mpeg" />
            </audio>
          </div>
        )}

        <div className="rounded-2xl border border-tomate/30 bg-tomate/5 p-5">
          <h2 className="font-heading text-lg font-semibold text-tomate">
            Supprimer mon compte
          </h2>
          <p className="mt-1 text-sm text-ardoise/70">
            Supprime définitivement ton compte et toutes tes données
            (profil, budgets, articles). Cette action est irréversible.
          </p>
          {error && error !== "periode" && (
            <p className="mt-3 rounded-lg bg-tomate/10 px-3 py-2 text-sm text-tomate">
              {ERROR_MESSAGES[error] ?? "Une erreur est survenue."}
            </p>
          )}
          <form action={supprimerMonCompte} className="mt-4 flex flex-col gap-2">
            <label className="text-xs text-ardoise/70">
              Tape <strong>SUPPRIMER</strong> pour confirmer
              <input
                type="text"
                name="confirmation"
                required
                className="mt-1 w-full rounded-lg border border-ardoise/20 px-3 py-2 text-ardoise"
              />
            </label>
            <button
              type="submit"
              className="rounded-lg bg-tomate px-4 py-2 font-medium text-craie hover:opacity-90"
            >
              Supprimer définitivement mon compte
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
