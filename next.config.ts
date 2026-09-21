import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Évite que Next.js régénère AGENTS.md/CLAUDE.md à chaque `next dev`.
  agentRules: false,

  // La limite par défaut (1 Mo) est bien trop basse pour une photo de
  // ticket de caisse envoyée à Claude vision (voir scanner-ticket.tsx) —
  // même réduite côté client, elle reste souvent au-delà de 1 Mo.
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },

  // Durcissement sécurité de base (section 5 du cahier des charges) —
  // le HTTPS lui-même est déjà forcé automatiquement par Render.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "microphone=(self), camera=(self)" },
          // Force le navigateur à toujours utiliser HTTPS pour whaoo.site
          // pendant un an, y compris pour les sous-domaines, même si un
          // lien ou un favori pointe encore vers du http://.
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },

  // Une fois les deux domaines personnalisés vérifiés sur Render,
  // www.whaoo.site redirige vers l'apex whaoo.site pour n'avoir qu'une
  // seule URL canonique — ne peut évidemment rien faire pour un domaine
  // qui n'arrive pas du tout à se connecter (voir avec Render/LWS).
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.whaoo.site" }],
        destination: "https://whaoo.site/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
