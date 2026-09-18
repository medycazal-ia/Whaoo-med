import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supprimerMonCompte } from "@/lib/compte/actions";
import { ActiverNotifications } from "@/components/activer-notifications";

const ERROR_MESSAGES: Record<string, string> = {
  confirmation: "Tape exactement SUPPRIMER pour confirmer.",
  suppression: "La suppression a échoué, réessaie ou contacte le support.",
};

export default async function ParametresPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const supportLinkUrl = process.env.SUPPORT_LINK_URL;

  return (
    <main className="flex flex-1 flex-col bg-craie">
      <header className="flex items-center gap-3 bg-kaki px-3 py-3 sm:px-6 sm:py-4">
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
          {error && (
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
