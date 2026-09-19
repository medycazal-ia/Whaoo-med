import { TeleprompterStudio } from "@/components/teleprompter-studio";

export const metadata = {
  title: "Studio d'enregistrement — whaoo",
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return (
    <main className="min-h-screen fond-marche">
      <TeleprompterStudio />
    </main>
  );
}
