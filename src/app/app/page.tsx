import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";
import {
  ajouterArticle,
  basculerStatutArticle,
  definirBudgetMensuel,
  supprimerArticle,
} from "@/lib/courses/actions";
import { calculerRythme, premierJourDuMois } from "@/lib/courses/rythme";
import { SaisieVocale } from "@/components/saisie-vocale";

const STATUT_STYLES: Record<string, string> = {
  serein: "bg-basilic/15 text-basilic",
  vigilant: "bg-ambre/15 text-ambre",
  attention: "bg-tomate/15 text-tomate",
};

const STATUT_LABELS: Record<string, string> = {
  serein: "Serein, tu tiens le rythme",
  vigilant: "Vigilant, ça se resserre",
  attention: "Attention, tu dépenses trop vite",
};

export default async function AppHomePage({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string; error?: string }>;
}) {
  const { vue } = await searchParams;
  const vueActive = vue === "achete" ? "achete" : "a_acheter";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const moisISO = premierJourDuMois().toISOString().slice(0, 10);
  const { data: profile } = await supabase
    .from("profiles")
    .select("prenom, referral_code")
    .eq("id", user.id)
    .single();

  const { data: periode } = await supabase
    .from("budget_periods")
    .select("id, budget_amount")
    .eq("user_id", user.id)
    .eq("month", moisISO)
    .maybeSingle();

  const { data: items } = periode
    ? await supabase
        .from("items")
        .select("id, label, price, quantity, status")
        .eq("budget_period_id", periode.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const totalDepense = (items ?? [])
    .filter((item) => item.status === "achete")
    .reduce((total, item) => total + item.price * item.quantity, 0);

  const rythme = periode
    ? calculerRythme({
        budgetAmount: periode.budget_amount,
        totalDepense,
        mois: premierJourDuMois(),
      })
    : null;

  const itemsAffiches = (items ?? []).filter(
    (item) => item.status === vueActive,
  );

  return (
    <main className="flex flex-1 flex-col bg-craie">
      <header className="flex items-center justify-between bg-ardoise px-6 py-4">
        <h1 className="font-heading text-xl font-semibold text-craie">
          Bonjour {profile?.prenom ?? ""}
        </h1>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-lg border border-craie/30 px-3 py-1.5 text-sm text-craie hover:bg-craie/10"
          >
            Se déconnecter
          </button>
        </form>
      </header>

      {!periode ? (
        <section className="mx-auto mt-8 w-full max-w-sm rounded-2xl bg-white p-6 shadow">
          <h2 className="font-heading text-lg font-semibold text-ardoise">
            Nouveau mois, quel budget ?
          </h2>
          <p className="mt-1 text-sm text-ardoise/70">
            Le mois précédent reste consultable dans ton historique — indique
            ton budget pour démarrer celui-ci.
          </p>
          <form action={definirBudgetMensuel} className="mt-4 flex gap-2">
            <input
              type="number"
              name="budgetAmount"
              step="0.01"
              min={0}
              required
              placeholder="Ex. 350"
              className="flex-1 rounded-lg border border-ardoise/20 px-3 py-2 text-ardoise"
            />
            <button
              type="submit"
              className="rounded-lg bg-ardoise px-4 py-2 font-medium text-craie hover:bg-ardoise-light"
            >
              Valider
            </button>
          </form>
        </section>
      ) : (
        <>
          <section className="bg-ardoise px-6 pb-6">
            <div className="mx-auto flex max-w-lg flex-col gap-3 rounded-2xl bg-ardoise-light p-5">
              <div className="flex items-baseline justify-between font-mono text-craie">
                <span className="text-2xl font-semibold">
                  {totalDepense.toFixed(2)} €
                </span>
                <span className="text-sm text-craie/60">
                  / {periode.budget_amount.toFixed(2)} € ce mois-ci
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-craie/20">
                <div
                  className="h-full rounded-full bg-basilic"
                  style={{
                    width: `${Math.min(
                      100,
                      (totalDepense / Math.max(periode.budget_amount, 1)) * 100,
                    )}%`,
                  }}
                />
              </div>
              {rythme && (
                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${STATUT_STYLES[rythme.statut]}`}
                >
                  {STATUT_LABELS[rythme.statut]}
                </span>
              )}
              {rythme && rythme.cagnotte > 0 && (
                <p className="text-sm text-craie/80">
                  Cagnotte du mois :{" "}
                  <strong>{rythme.cagnotte.toFixed(2)} €</strong>
                  {rythme.palierAtteint && (
                    <> — de quoi te faire plaisir : {rythme.palierAtteint.label} 🎉</>
                  )}
                </p>
              )}
            </div>
          </section>

          <section className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-6 py-6">
            <SaisieVocale />

            <form
              action={ajouterArticle}
              className="flex flex-wrap gap-2 rounded-xl border border-ardoise/10 bg-white p-4"
            >
              <input
                name="label"
                placeholder="Article"
                required
                className="flex-1 rounded-lg border border-ardoise/20 px-3 py-2 text-ardoise"
              />
              <input
                name="price"
                type="number"
                step="0.01"
                min={0}
                placeholder="Prix"
                className="w-24 rounded-lg border border-ardoise/20 px-3 py-2 text-ardoise"
              />
              <input
                name="quantity"
                type="number"
                min={1}
                defaultValue={1}
                className="w-20 rounded-lg border border-ardoise/20 px-3 py-2 text-ardoise"
              />
              <select
                name="status"
                defaultValue={vueActive}
                className="rounded-lg border border-ardoise/20 px-3 py-2 text-ardoise"
              >
                <option value="a_acheter">À acheter plus tard</option>
                <option value="achete">Déjà acheté</option>
              </select>
              <button
                type="submit"
                className="rounded-lg bg-ardoise px-4 py-2 font-medium text-craie hover:bg-ardoise-light"
              >
                Ajouter
              </button>
            </form>

            <div className="flex gap-2">
              <Link
                href="/app?vue=a_acheter"
                className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium ${
                  vueActive === "a_acheter"
                    ? "bg-ardoise text-craie"
                    : "bg-white text-ardoise"
                }`}
              >
                À acheter
              </Link>
              <Link
                href="/app?vue=achete"
                className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium ${
                  vueActive === "achete"
                    ? "bg-ardoise text-craie"
                    : "bg-white text-ardoise"
                }`}
              >
                Acheté
              </Link>
            </div>

            <ul className="flex flex-col gap-2">
              {itemsAffiches.length === 0 && (
                <p className="rounded-lg bg-white p-4 text-center text-sm text-ardoise/60">
                  Rien ici pour l&apos;instant.
                </p>
              )}
              {itemsAffiches.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-lg bg-white p-3"
                >
                  <div>
                    <p className="text-ardoise">
                      {item.quantity > 1 ? `${item.quantity} × ` : ""}
                      {item.label}
                    </p>
                    <p className="font-mono text-sm text-ardoise/60">
                      {(item.price * item.quantity).toFixed(2)} €
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <form action={basculerStatutArticle}>
                      <input type="hidden" name="id" value={item.id} />
                      <input
                        type="hidden"
                        name="status"
                        value={
                          item.status === "achete" ? "a_acheter" : "achete"
                        }
                      />
                      <button
                        type="submit"
                        className="rounded-lg border border-basilic/40 px-2 py-1 text-xs text-basilic"
                      >
                        {item.status === "achete"
                          ? "Remettre en attente"
                          : "Marquer acheté"}
                      </button>
                    </form>
                    <form action={supprimerArticle}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-tomate/40 px-2 py-1 text-xs text-tomate"
                      >
                        Supprimer
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {profile?.referral_code && (
        <p className="px-6 pb-6 text-center text-xs text-ardoise/50">
          Ton code de parrainage : <strong>{profile.referral_code}</strong>
        </p>
      )}
    </main>
  );
}
