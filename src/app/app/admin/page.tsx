import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  CHAMPS_RECHERCHE,
  estAdmin,
  estChampRecherche,
  rechercherProfils,
} from "@/lib/admin";

export const metadata: Metadata = {
  title: "Back-office — whaoo",
  robots: { index: false, follow: false },
};

function formaterDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ champ?: string; q?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");
  // Page introuvable pour tout autre compte : on ne révèle pas son existence.
  if (!estAdmin(user.email)) notFound();

  const { champ: champBrut, q = "" } = await searchParams;
  const champ = estChampRecherche(champBrut) ? champBrut : null;
  const recherche = champ !== null && q.trim() !== "";

  const { profils, total } = await rechercherProfils(user.email, champ, q);
  const libelleChamp = CHAMPS_RECHERCHE.find((c) => c.id === champ)?.label;

  return (
    <main className="flex flex-1 flex-col fond-marche">
      <header className="flex items-center gap-3 bg-gradient-to-r from-kaki to-basilic px-3 py-3 sm:px-6 sm:py-4">
        <Link href="/app" className="text-sm text-craie/70 hover:text-craie">
          ← Retour
        </Link>
        <h1 className="font-heading text-xl font-semibold text-craie">Back-office</h1>
      </header>

      {/* Chaque outil est une carte de cette grille : pour une nouvelle
          action, ajouter une carte à la suite de "Profils". */}
      <section className="mx-auto grid w-full max-w-lg gap-6 px-4 py-6 sm:px-6 md:max-w-2xl lg:max-w-5xl lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 lg:col-span-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-heading text-lg font-semibold text-ardoise">👤 Profils</h2>
            <p className="text-sm text-ardoise/60">
              {total} inscrit{total > 1 ? "s" : ""} au total
            </p>
          </div>

          <form method="get" className="mt-4 flex flex-col gap-3">
            <input
              name="q"
              defaultValue={q}
              placeholder="Tape un nom, un prénom, un numéro ou un email…"
              className="rounded-lg border border-ardoise/20 px-3 py-2 text-sm text-ardoise"
            />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CHAMPS_RECHERCHE.map((c) => (
                <button
                  key={c.id}
                  type="submit"
                  name="champ"
                  value={c.id}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    champ === c.id
                      ? "bg-ardoise text-craie"
                      : "border border-ardoise/20 text-ardoise hover:bg-ardoise/5"
                  }`}
                >
                  Par {c.label.toLowerCase()}
                </button>
              ))}
            </div>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-ardoise/70">
            <p>
              {recherche
                ? `${profils.length} résultat${profils.length > 1 ? "s" : ""} pour « ${q.trim()} » (${libelleChamp?.toLowerCase()})`
                : "Derniers inscrits"}
            </p>
            {recherche && (
              <Link href="/app/admin" className="underline underline-offset-2">
                Effacer la recherche
              </Link>
            )}
          </div>

          {profils.length === 0 ? (
            <p className="mt-3 rounded-lg bg-ardoise/5 px-3 py-4 text-center text-sm text-ardoise/60">
              Aucun profil trouvé.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col divide-y divide-ardoise/10">
              {profils.map((p) => (
                <li key={p.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="min-w-0 sm:w-48">
                    <p className="truncate font-medium text-ardoise">
                      {p.prenom} {p.nom}
                    </p>
                    <p className="text-xs text-ardoise/50">Inscrit le {formaterDate(p.created_at)}</p>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-sm sm:flex-row sm:gap-4">
                    {p.email ? (
                      <a href={`mailto:${p.email}`} className="truncate text-basilic underline underline-offset-2">
                        {p.email}
                      </a>
                    ) : (
                      <span className="text-ardoise/40">Email inconnu</span>
                    )}
                    {p.telephone ? (
                      <a href={`tel:${p.telephone.replace(/\s/g, "")}`} className="text-ardoise underline underline-offset-2">
                        {p.telephone}
                      </a>
                    ) : (
                      <span className="text-ardoise/40">Pas de téléphone</span>
                    )}
                  </div>
                  <p className="text-xs text-ardoise/50">Code {p.referral_code}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex min-h-32 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ardoise/20 p-5 text-center">
          <p className="font-heading font-semibold text-ardoise/50">Prochaine action</p>
          <p className="mt-1 text-sm text-ardoise/40">
            Emplacement réservé pour les prochains outils du back-office.
          </p>
        </div>
      </section>
    </main>
  );
}
