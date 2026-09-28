# whaoo — consignes pour les sessions Claude

Application de liste de courses et de budget (Next.js App Router, Supabase,
déployée sur Render à whaoo.site). Branche de travail :
`claude/whaoo-med-specs-8xx0r4` (chaque push redéploie Render). Les
migrations `supabase/migrations/` sont appliquées à la main par Medy dans
le SQL Editor Supabase : le lui signaler à chaque nouvelle migration.

Le dépôt est **public** : ne jamais y committer de clé, de mot de passe,
de données personnelles ni l'historique de conversation.

## Sauvegardes versionnées (demande de Medy)

Chaque session de travail produit une nouvelle version sauvegardée, à la
suite de la v1.0 du 2026-09-28 : v1.1, v1.2, etc. (lire
`sauvegardes/SAUVEGARDES.md` pour connaître la dernière).

Une fois le travail de la session committé et poussé (ou quand Medy le
demande) :

1. Ajouter en tête des versions de `sauvegardes/SAUVEGARDES.md` l'entrée
   `## vX.Y — AAAA-MM-JJ` qui résume les changements de la session.
2. Committer et pousser.
3. Lancer `scripts/sauvegarde.sh` (numéro de version automatique ; passer
   un dossier d'extras en 3e argument pour y joindre des fichiers hors
   dépôt, sans secrets).
4. Pousser le tag : `git push origin vX.Y`.
5. Envoyer le zip à Medy avec SendUserFile.

Pour rouvrir une version : `git checkout vX.Y`, ou demander à Medy le zip
correspondant et suivre son `LISEZ-MOI-RESTAURATION.md`.
