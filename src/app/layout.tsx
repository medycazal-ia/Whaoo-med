import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";
import { EnregistrerServiceWorker } from "@/components/enregistrer-service-worker";
import { BoutonAideFlottant } from "@/components/bouton-aide-flottant";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const TITRE = "whaoo — tes courses, sans les mauvaises surprises en caisse";
const DESCRIPTION =
  "Note tes courses à la voix, suis ton budget du mois en temps réel et laisse ta cagnotte se remplir toute seule.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://whaoo.site"),
  title: TITRE,
  description: DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "whaoo",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: TITRE,
    description: DESCRIPTION,
    siteName: "whaoo",
    locale: "fr_FR",
    type: "website",
    images: [{ url: "/banniere-og.png", width: 1200, height: 630, alt: "whaoo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITRE,
    description: DESCRIPTION,
    images: ["/banniere-og.png"],
  },
};

export const viewport = {
  themeColor: "#1e3a34",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <EnregistrerServiceWorker />
        {children}
        <BoutonAideFlottant />
      </body>
    </html>
  );
}
