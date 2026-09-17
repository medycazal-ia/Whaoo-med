import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Droit à la portabilité (section 5.1 du cahier des charges) : export
// complet et lisible des données de l'utilisateur, au format JSON.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const [{ data: profile }, { data: budgets }, { data: items }] = await Promise.all([
    supabase
      .from("profiles")
      .select("nom, prenom, telephone, avatar_id, referral_code, data_connector, created_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("budget_periods")
      .select("month, budget_amount, created_at")
      .eq("user_id", user.id)
      .order("month", { ascending: true }),
    supabase
      .from("items")
      .select("label, detail, price, quantity, status, achat_mois, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
  ]);

  const export_ = {
    exporte_le: new Date().toISOString(),
    compte: { email: user.email, ...profile },
    budgets_mensuels: budgets ?? [],
    articles: items ?? [],
  };

  return new NextResponse(JSON.stringify(export_, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=whaoo-mes-donnees.json",
    },
  });
}
