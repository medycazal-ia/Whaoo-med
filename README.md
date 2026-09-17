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
