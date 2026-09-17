import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { ListeCoursesPDF } from "@/lib/pdf/liste-courses";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: articles } = await supabase
    .from("items")
    .select("label, detail, quantity")
    .eq("user_id", user.id)
    .eq("status", "a_acheter")
    .order("created_at", { ascending: false });

  const buffer = await renderToBuffer(ListeCoursesPDF({ articles: articles ?? [] }));

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=whaoo-liste-de-courses.pdf",
    },
  });
}
