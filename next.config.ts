import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Évite que Next.js régénère AGENTS.md/CLAUDE.md à chaque `next dev`.
  agentRules: false,

  // Protection contre le décalage de version : une page restée ouverte
  // (appli installée sur le téléphone) pendant un déploiement garde les
  // identifiants des Server Actions de l'ancienne version, que le nouveau
  // serveur refuse — tous les boutons qui enregistrent échouent alors en
  // silence. Avec un identifiant par déploiement, Next.js détecte l'écart
  // et recharge la page. Render fournit le commit déployé dans
  // RENDER_GIT_COMMIT (absent en local : protection simplement inactive).
  deploymentId: process.env.RENDER_GIT_COMMIT,

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
          // Restreint les origines autorisées à charger/exécuter sur la
          // page — limite les dégâts d'une éventuelle faille XSS.
          // ElevenLabs/Claude/OpenAI sont appelés côté serveur (nos routes
          // /api/* et Server Actions), les polices sont auto-hébergées par
          // next/font et les avatars sont des SVG locaux. Seules exceptions
          // appelées depuis le navigateur, listées ci-dessous :
          // - cdn.jsdelivr.net : lecture de ticket hors ligne (Tesseract.js)
          //   charge son script, son moteur WebAssembly et le dictionnaire
          //   français depuis ce CDN, dans un worker créé en blob: ;
          // - nominatim.openstreetmap.org : ville approximative pour les
          //   promotions locales ;
          // - www.facebook.com : publication de l'accueil, après un clic.
          //
          // 'unsafe-inline' sur script-src ET style-src (et pas une CSP à
          // base de nonce, plus stricte) : testé en conditions réelles —
          // un nonce casse toutes les pages statiques/pré-générées au
          // build (mentions légales, CGU, pitch, pages de partage), qui ne
          // passent jamais par le serveur au moment de la requête et ne
          // peuvent donc jamais recevoir de nonce frais. Next.js a aussi
          // besoin d'exécuter ses propres scripts d'hydratation inline, et
          // les quelques style={{...}} calculés dynamiquement (curseur de
          // taille de texte, position glissée à la souris) sont des
          // attributs inline jamais nonçables.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data:",
              "font-src 'self'",
              // blob: pour la lecture du son de bienvenue/au revoir généré
              // à la volée (URL.createObjectURL sur le résultat de
              // /api/voix).
              "media-src 'self' blob:",
              "connect-src 'self' https://cdn.jsdelivr.net https://nominatim.openstreetmap.org",
              "frame-src https://www.facebook.com",
              "worker-src 'self' blob:",
              "manifest-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              // Klarna : le formulaire de /paiement/klarna est redirigé vers
              // la page de paiement hébergée par Klarna.
              "form-action 'self' https://*.klarna.com",
              "frame-ancestors 'none'",
            ].join("; "),
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
