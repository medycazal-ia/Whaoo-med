import { NextResponse, type NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { debutPeriode, dateISO, libellePeriode, normaliserJourDebut } from "@/lib/courses/rythme";
import { FacturePDF } from "@/lib/pdf/facture";

// Facture de la période de budget en cours (toutes les sessions), ou
// facturette d'une seule session avec ?session=Courses%20du%2028%2F09.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const session = request.nextUrl.searchParams.get("session")?.trim() || null;

  const { data: profil } = await supabase
    .from("profiles")
    .select("jour_debut_periode")
    .eq("id", user.id)
    .maybeSingle();
  const debut = debutPeriode(new Date(), normaliserJourDebut(profil?.jour_debut_periode));
  const periodeISO = dateISO(debut);

  let requeteArticles = supabase
    .from("items")
    .select("label, detail, price, quantity, session_courses")
    .eq("user_id", user.id)
    .eq("status", "achete")
    .eq("achat_mois", periodeISO)
    .order("created_at", { ascending: true });
  if (session) requeteArticles = requeteArticles.eq("session_courses", session);

  const [{ data: periode }, { data: articles }] = await Promise.all([
    supabase
      .from("budget_periods")
      .select("budget_amount")
      .eq("user_id", user.id)
      .eq("month", periodeISO)
      .maybeSingle(),
    requeteArticles,
  ]);

  const buffer = await renderToBuffer(
    FacturePDF({
      titre: session ? `whaoo — Facturette : ${session}` : undefined,
      moisLabel: `Période ${libellePeriode(debut)}`,
      articles: (articles ?? []).map((article) => ({
        ...article,
        session: article.session_courses,
      })),
      budgetAmount: session ? null : (periode?.budget_amount ?? 0),
    }),
  );

  const suffixe = session
    ? `facturette-${session.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`
    : `facture-${periodeISO}`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=whaoo-${suffixe}.pdf`,
    },
  });
}
