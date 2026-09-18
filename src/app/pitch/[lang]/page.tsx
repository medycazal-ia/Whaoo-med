import { notFound } from "next/navigation";
import { PITCH_CONTENT, LANGUES_PITCH, type LangPitch } from "@/lib/pitch-content";
import { PitchPage } from "@/components/pitch-page";

export function generateStaticParams() {
  return LANGUES_PITCH.map((l) => ({ lang: l.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const contenu = PITCH_CONTENT[lang as LangPitch];
  if (!contenu) return {};
  return {
    title: `whaoo — ${contenu.tagline}`,
    description: contenu.intro,
  };
}

export default async function PitchLangPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const contenu = PITCH_CONTENT[lang as LangPitch];
  if (!contenu) notFound();

  return <PitchPage lang={lang as LangPitch} contenu={contenu} />;
}
