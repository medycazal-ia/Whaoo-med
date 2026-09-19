import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Évite que Next.js régénère AGENTS.md/CLAUDE.md à chaque `next dev`.
  agentRules: false,

  // Durcissement sécurité de base (section 5 du cahier des charges) —
  // HTTPS est déjà forcé automatiquement par Vercel.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "microphone=(self), camera=(self)" },
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
