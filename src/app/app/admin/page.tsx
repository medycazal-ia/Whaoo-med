import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  CHAMPS_RECHERCHE,
  estChampRecherche,
  etatAdmin,
  rechercherProfils,
} from "@/lib/admin";
import {
  deverrouillerBackOffice,
  modifierProfil,
  verrouillerBackOffice,
} from "@/lib/admin-actions";
import { BoutonConfirmation } from "@/components/bouton-confirmation";

export const metadata: Metadata = {
  title: "Back-office — whaoo",
  robots: { index: false, follow: false },
};

const MESSAGES_ERREUR: Record<string, string> = {
  mot_de_passe: "Mot de passe incorrect.",
  trop_de_tentatives: "Trop de tentatives échouées. Réessaie dans quelques minutes.",
  non_configure: "Le mot de passe du back-office n'est pas encore configuré (variable ADMIN_PASSWORD sur Render).",
  nom_invalide: "Le prénom et le nom sont obligatoires (100 caractères maximum).",
  telephone_invalide: "Numéro de téléphone invalide (chiffres, espaces, +, -, points et parenthèses uniquement).",
  email_invalide: "Adresse email invalide.",
  email_deja_utilise: "Cette adresse email est déjà utilisée par un autre compte.",
  email_echec: "L'email n'a pas pu être modifié. Réessaie.",
  profil_introuvable: "Profil introuvable.",
  enregistrement: "L'enregistrement a échoué. Réessaie.",
};

function formaterDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function EnTete({ deverrouille }: { deverrouille: boolean }) {
  return (
    <header className="flex items-center gap-3 bg-gradient-to-r from-kaki to-basilic px-3 py-3 sm:px-6 sm:py-4">
      <Link href="/app" className="text-sm text-craie/70 hover:text-craie">
        ← Retour
      </Link>
      <h1 className="flex-1 font-heading text-xl font-semibold text-craie">Back-office</h1>
      {deverrouille && (
        <form action={verrouillerBackOffice}>
          <button
            type="submit"
            className="rounded-lg border border-craie/30 px-2 py-1.5 text-xs text-craie hover:bg-craie/10 sm:px-3 sm:text-sm"
          >
            🔒 Verrouiller
          </button>
        </form>
      )}
    </header>
  );
}

const CHAMP_SAISIE = "rounded-lg border border-ardoise/20 px-3 py-2 text-sm text-ardoise";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ champ?: string; q?: string; ok?: string; erreur?: string; id?: string }>;
}) {
  const etat = await etatAdmin();
  if (etat.statut === "non_connecte") redirect("/connexion");
  // Page introuvable pour tout autre compte : on ne révèle pas son existence.
  if (etat.statut === "non_admin") notFound();

  const { champ: champBrut, q = "", ok, erreur, id: idErreur } = await searchParams;
  const messageErreur = erreur ? (MESSAGES_ERREUR[erreur] ?? "Une erreur est survenue.") : null;

  if (etat.statut === "verrouille") {
    return (
      <main className="flex flex-1 flex-col fond-marche">
        <EnTete deverrouille={false} />
        <section className="mx-auto w-full max-w-sm px-4 py-10">
          <form action={deverrouillerBackOffice} className="flex flex-col gap-3 rounded-2xl bg-white p-6">
            <h2 className="font-heading text-lg font-semibold text-ardoise">🔐 Accès protégé</h2>
            <p className="text-sm text-ardoise/70">
              Saisis le mot de passe du back-office pour continuer.
            </p>
            {messageErreur && (
              <p className="rounded-lg bg-tomate/10 px-3 py-2 text-sm text-tomate">{messageErreur}</p>
            )}
            <input
              type="password"
              name="mot_de_passe"
              required
              autoFocus
              autoComplete="current-password"
              className={CHAMP_SAISIE}
            />
            <button
              type="submit"
              className="rounded-lg bg-ardoise px-4 py-2 text-sm font-medium text-craie hover:bg-ardoise-light"
            >
              Déverrouiller
            </button>
          </form>
        </section>
      </main>
    );
  }

  const champ = estChampRecherche(champBrut) ? champBrut : null;
  const recherche = champ !== null && q.trim() !== "";

  const { profils, total } = await rechercherProfils(champ, q);
  const libelleChamp = CHAMPS_RECHERCHE.find((c) => c.id === champ)?.label;

  return (
    <main className="flex flex-1 flex-col fond-marche">
      <EnTete deverrouille />

      {/* Chaque outil est une carte de cette grille : pour une nouvelle
          action, ajouter une carte à la suite de "Profils". Toute action
          qui modifie la base passe par <BoutonConfirmation>. */}
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
              className={CHAMP_SAISIE}
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

          {messageErreur && !idErreur && (
            <p className="mt-4 rounded-lg bg-tomate/10 px-3 py-2 text-sm text-tomate">{messageErreur}</p>
          )}

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
              {profils.map((p) => {
                const erreurIci = idErreur === p.id ? messageErreur : null;
                const modifieIci = ok === p.id;
                return (
                  <li key={p.id} className="py-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
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
                    </div>

                    {modifieIci && (
                      <p className="mt-2 rounded-lg bg-basilic/10 px-3 py-2 text-sm text-basilic">
                        ✓ Profil mis à jour.
                      </p>
                    )}

                    <details open={erreurIci !== null} className="mt-2">
                      <summary className="cursor-pointer text-sm text-ardoise/60 hover:text-ardoise">
                        ✏️ Modifier
                      </summary>
                      <form action={modifierProfil} className="mt-3 grid gap-3 rounded-xl bg-ardoise/5 p-3 sm:grid-cols-2">
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="retour_champ" value={champ ?? ""} />
                        <input type="hidden" name="retour_q" value={q} />
                        <label className="flex flex-col gap-1 text-xs text-ardoise/70">
                          Prénom
                          <input name="prenom" data-libelle="Prénom" defaultValue={p.prenom} required className={CHAMP_SAISIE} />
                        </label>
                        <label className="flex flex-col gap-1 text-xs text-ardoise/70">
                          Nom
                          <input name="nom" data-libelle="Nom" defaultValue={p.nom} required className={CHAMP_SAISIE} />
                        </label>
                        <label className="flex flex-col gap-1 text-xs text-ardoise/70">
                          Téléphone
                          <input
                            name="telephone"
                            type="tel"
                            data-libelle="Téléphone"
                            defaultValue={p.telephone ?? ""}
                            className={CHAMP_SAISIE}
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-xs text-ardoise/70">
                          Email (identifiant de connexion)
                          <input
                            name="email"
                            type="email"
                            data-libelle="Email"
                            data-avertissement={`${p.prenom} devra désormais se connecter avec la nouvelle adresse email.`}
                            defaultValue={p.email ?? ""}
                            required
                            className={CHAMP_SAISIE}
                          />
                        </label>
                        {erreurIci && (
                          <p className="rounded-lg bg-tomate/10 px-3 py-2 text-sm text-tomate sm:col-span-2">{erreurIci}</p>
                        )}
                        <p className="text-xs text-ardoise/50 sm:col-span-2">
                          Changer l&apos;email change aussi l&apos;adresse avec laquelle cette personne se connecte.
                        </p>
                        <BoutonConfirmation
                          titre="Confirmer la modification ?"
                          sujet={`le profil de ${p.prenom} ${p.nom}`}
                          className="rounded-lg bg-ardoise px-4 py-2 text-sm font-medium text-craie hover:bg-ardoise-light disabled:opacity-60 sm:col-span-2 sm:justify-self-start"
                        >
                          Enregistrer
                        </BoutonConfirmation>
                      </form>
                    </details>
                  </li>
                );
              })}
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
