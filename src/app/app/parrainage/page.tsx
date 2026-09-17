import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BoutonPartage } from "@/components/bouton-partage";

type Filleul = {
  id: string;
  prenom: string;
  cree_le: string;
  actif: boolean;
};

export default async function ParrainagePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", user.id)
    .single();

  const { data: filleuls } = await supabase.rpc("mes_filleuls");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const lienParrainage = `${appUrl}/inscription?parrain=${profile?.referral_code ?? ""}`;

  return (
    <main className="flex flex-1 flex-col bg-craie">
      <header className="flex items-center gap-3 bg-ardoise px-6 py-4">
        <Link href="/app" className="text-sm text-craie/70 hover:text-craie">
          ← Retour
        </Link>
        <h1 className="font-heading text-xl font-semibold text-craie">
          Parrainage
        </h1>
      </header>

      <section className="mx-auto w-full max-w-lg px-6 py-6">
        <div className="rounded-2xl bg-white p-5">
          <p className="text-sm text-ardoise/70">Ton lien de parrainage</p>
          <p className="mt-1 break-all font-mono text-sm text-ardoise">
            {lienParrainage}
          </p>
          <div className="mt-4">
            <BoutonPartage lien={lienParrainage} />
          </div>
        </div>

        <h2 className="mt-8 font-heading text-lg font-semibold text-ardoise">
          Tes filleuls
        </h2>
        <ul className="mt-3 flex flex-col gap-2">
          {(filleuls as Filleul[] | null)?.length ? (
            (filleuls as Filleul[]).map((filleul) => (
              <li
                key={filleul.id}
                className="flex items-center justify-between rounded-lg bg-white p-3 text-sm"
              >
                <span className="text-ardoise">{filleul.prenom}</span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    filleul.actif
                      ? "bg-basilic/15 text-basilic"
                      : "bg-ambre/15 text-ambre"
                  }`}
                >
                  {filleul.actif ? "Actif" : "Inscrit"}
                </span>
              </li>
            ))
          ) : (
            <p className="rounded-lg bg-white p-4 text-center text-sm text-ardoise/60">
              Personne pour l&apos;instant — partage ton lien pour inviter tes
              proches.
            </p>
          )}
        </ul>
      </section>
    </main>
  );
}
