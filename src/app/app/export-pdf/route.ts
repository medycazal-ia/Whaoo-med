import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { premierJourDuMois } from "@/lib/courses/rythme";
import { FacturePDF } from "@/lib/pdf/facture";

const MOIS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const maintenant = new Date();
  const moisISO = premierJourDuMois(maintenant).toISOString().slice(0, 10);

  const [{ data: periode }, { data: articles }] = await Promise.all([
    supabase
      .from("budget_periods")
      .select("budget_amount")
      .eq("user_id", user.id)
      .eq("month", moisISO)
      .maybeSingle(),
    supabase
      .from("items")
      .select("label, detail, price, quantity, session_courses")
      .eq("user_id", user.id)
      .eq("status", "achete")
      .eq("achat_mois", moisISO)
      .order("created_at", { ascending: true }),
  ]);

  const moisLabel = `${MOIS_FR[maintenant.getMonth()]} ${maintenant.getFullYear()}`;

  const buffer = await renderToBuffer(
    FacturePDF({
      moisLabel,
      articles: (articles ?? []).map((article) => ({
        ...article,
        session: article.session_courses,
      })),
      budgetAmount: periode?.budget_amount ?? 0,
    }),
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=whaoo-facture-${moisISO}.pdf`,
    },
  });
}
