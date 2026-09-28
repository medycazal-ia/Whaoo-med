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

1. Ajouter en tête des versions de `sauvegardes/SAUVEGARDES.md` (au-dessus
   de la précédente) l'entrée `## vX.Y — AAAA-MM-JJ`, version précédente
   + 0.1, qui résume les changements de la session.
2. Committer avec le message `Sauvegarde vX.Y — AAAA-MM-JJ` et pousser : ce
   commit est le point de restauration (pousser un tag est refusé depuis les
   sessions Claude).
3. Lancer `scripts/sauvegarde.sh <dossier-scratchpad> [dossier-extras]` :
   il lit la version dans le journal. Les extras (fichiers hors dépôt, par
   exemple l'historique de conversation) doivent être expurgés des clés.
4. Envoyer à Medy avec SendUserFile le zip de l'application et les
   volumes de l'historique (limite de 30 Mo par fichier).

Pour rouvrir une version :
`git checkout $(git log --format=%H -1 --grep='^Sauvegarde vX.Y ')`, ou
demander à Medy le zip correspondant et suivre son
`LISEZ-MOI-RESTAURATION.md`.

## Demandes en attente (à traiter en début de session suivante)

- **Stripe** : Medy veut intégrer Stripe (connecteur validé côté claude.ai).
- **Rangement Google Drive** (Medy est sur Chromebook) : le connecteur
  Google Drive renvoyait « Insufficient scope » ; Medy doit l'avoir
  reconnecté avec toutes les autorisations. Puis :
  1. Créer dans Mon Drive l'arborescence `whaoo/` : `00 - À trier`,
     `01 - Sauvegardes` (sous-dossiers par version), `02 - Sécurité`,
     `03 - Vidéos et réseaux`, `04 - Logo et visuels`,
     `05 - Juridique et RGPD`, `06 - Présentations`,
     `07 - Support et emails`, et un dossier `Téléchargements` à la racine
     de Mon Drive.
  2. Ranger dans ces dossiers ce que Medy aura déposé dans `00 - À trier`.
     Ne jamais y ranger le code de récupération du coffre des clés.
  3. Mettre en place l'automatisation : les téléchargements du Chromebook
     vont dans `Mon Drive/Téléchargements` (réglage à faire par Medy), et
     un script Google Apps Script `rangerTelechargementsWhaoo`, déclenché
     toutes les 10 minutes, déplace les fichiers dont le nom commence par
     « whaoo » vers `whaoo/00 - À trier`. Si le connecteur ne peut pas
     créer le projet Apps Script, guider Medy pas à pas.
