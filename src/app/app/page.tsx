import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";

export default async function AppHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("prenom, referral_code")
    .eq("id", user.id)
    .single();

  return (
    <main className="flex flex-1 flex-col gap-6 bg-craie px-6 py-10">
      <header className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-ardoise">
          Bonjour {profile?.prenom ?? ""}
        </h1>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-lg border border-ardoise/20 px-3 py-1.5 text-sm text-ardoise hover:bg-ardoise/5"
          >
            Se déconnecter
          </button>
        </form>
      </header>
      <p className="text-ardoise/70">
        Ton compte est créé. Les listes de courses, le budget et la cagnotte
        arrivent à la prochaine étape du développement.
      </p>
      {profile?.referral_code && (
        <p className="text-sm text-ardoise/60">
          Ton code de parrainage : <strong>{profile.referral_code}</strong>
        </p>
      )}
    </main>
  );
}
