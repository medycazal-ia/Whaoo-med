import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";
import {
  ajouterArticle,
  basculerStatutArticle,
  definirBudgetMensuel,
  supprimerArticle,
} from "@/lib/courses/actions";
import { premierJourDuMois } from "@/lib/courses/rythme";
import { CoursesDashboard } from "@/components/courses-dashboard";

export default async function AppHomePage({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string }>;
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
        <CoursesDashboard
          baseHref="/app"
          budgetAmount={periode.budget_amount}
          items={items ?? []}
          vueActive={vueActive}
          actions={{ ajouterArticle, basculerStatutArticle, supprimerArticle }}
          footer={
            profile?.referral_code ? (
              <p className="px-6 pb-6 text-center text-xs text-ardoise/50">
                Ton code de parrainage : <strong>{profile.referral_code}</strong>
              </p>
            ) : undefined
          }
        />
      )}
    </main>
  );
}
