import { notFound } from "next/navigation";
import { VideoPartage } from "@/components/video-partage";

const SCENARIOS: Record<string, { titre: string; video: string; poster: string }> = {
  "1": {
    titre: "Dans ta cuisine, dicte ta liste de courses",
    video: "/videos/whaoo-scenario1.mp4",
    poster: "/videos/whaoo-scenario1-poster.jpg",
  },
  "2": {
    titre: "Tiens ton budget et remplis ta cagnotte",
    video: "/videos/whaoo-scenario2.mp4",
    poster: "/videos/whaoo-scenario2-poster.jpg",
  },
  "3": {
    titre: "Plus de calcul de tête pendant les courses",
    video: "/videos/whaoo-scenario3.mp4",
    poster: "/videos/whaoo-scenario3-poster.jpg",
  },
};

export function generateStaticParams() {
  return Object.keys(SCENARIOS).map((slug) => ({ slug }));
}

export default async function PartagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const scenario = SCENARIOS[slug];
  if (!scenario) notFound();

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 bg-craie px-4 py-8">
      <h1 className="text-center font-heading text-2xl font-semibold text-ardoise">
        whaoo 🛒
      </h1>
      <VideoPartage videoSrc={scenario.video} posterSrc={scenario.poster} titre={scenario.titre} />
    </main>
  );
}
