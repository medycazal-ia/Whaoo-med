# whaoo (ex. "Courses & Budget")

Application mobile-first (PWA installable) pour noter ses courses à la voix,
suivre un budget mensuel et calculer une cagnotte d'épargne virtuelle.

Voir `docs/cahier-des-charges.md` pour la spécification complète et
`DECISIONS.md` pour les décisions produit (hébergement, auth, base de
données, modèle économique, statut du nom "whaoo").

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (Auth + Postgres, région Frankfurt)
- Connecteurs de données externes (Airtable, Google Sheets, Excel/OneDrive)
  derrière une interface commune

## Développement

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

Copier `.env.example` vers `.env.local` et renseigner les clés (Supabase,
Google OAuth, Airtable, Microsoft Graph...) au fur et à mesure de
l'intégration de chaque fonctionnalité.

## Authentification (Supabase)

1. Créer un projet Supabase (région Frankfurt recommandée, voir DECISIONS.md)
   et copier son URL + clé anonyme dans `.env.local`.
2. Appliquer la migration `supabase/migrations/0001_profiles.sql` (table
   `profiles`, génération du code de parrainage, création automatique du
   profil à l'inscription) : `npx supabase db push` ou en collant le contenu
   du fichier dans l'éditeur SQL du tableau de bord Supabase.
3. Dans Supabase → Authentication → Providers, activer "Google" et renseigner
   `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (à créer sur Google Cloud
   Console). L'URL de redirection à autoriser côté Google est
   `<URL_SUPABASE>/auth/v1/callback`.
4. Renseigner `NEXT_PUBLIC_APP_URL` (ex. `http://localhost:3000` en local,
   l'URL Vercel en production) — utilisée pour les redirections OAuth et de
   réinitialisation de mot de passe.
