# whaoo — consignes pour les sessions Claude

Application de liste de courses et de budget (Next.js App Router, Supabase,
déployée sur Render à whaoo.site, offre payante Starter depuis le
2026-09-29 : pas de mise en veille). Branche de travail :
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

- **Arcads** : connecteur MCP ajouté. Vidéo « Soutiens whaoo » refaite le
  2026-09-28 (OmniHuman : avatar figurine animé sur la voix de Medy, 800
  crédits sur 8 000/mois, offre Starter). Méthode et sources dans
  `livrables/video-soutien/`. Reste à faire si Medy le demande : version
  9:16 en Reel. Règle : toujours annoncer le coût et obtenir l'accord de
  Medy avant toute génération payante (Arcads, ElevenLabs…).

- **Stripe** : contribution libre en **mode réel** depuis le 2026-09-28,
  sur un compte Stripe dédié « WHAOO » (distinct du compte medy.site). Lien
  de paiement à montant libre (1 à 500 €, 5 € proposé, redirection vers
  https://whaoo.site/merci), à mettre dans `STRIPE_SUPPORT_LINK_URL` sur
  Render. Le compte « environnement de test WHAOO » sert aux essais.
  Abonnement premium : pas encore décidé. Klarna est actif et disponible
  dans ce compte (boutique et contribution) mais n'est affiché qu'aux
  clients d'un pays accepté : pas depuis la Martinique (MQ, où est Medy),
  oui depuis la France métropolitaine. Google Pay actif depuis le 29/09.
- **Klarna en direct** : page de paiement partagée entre plusieurs sites
  pour tout produit numérique ou physique (catalogue à prix fixés par site)
  ou un montant libre : `/paiement/klarna?site=<id>&produit=<id>` ou
  `?site=<id>&montant=<euros>` (API HPP de Klarna ; sites, produits et
  pages de retour dans `src/lib/klarna/sites.ts`, catalogues encore vides :
  demander à Medy ses produits). Inactive tant que
  `KLARNA_API_USERNAME` / `KLARNA_API_PASSWORD` ne sont pas sur Render
  (contrat marchand Klarna nécessaire). Jamais testée contre la vraie API.
- **Boutique « Bons plans »** (`/boutique`, lien dans l'en-tête de l'appli) :
  affiche les produits du compte Stripe WHAOO qui ont la métadonnée
  `boutique` = `whaoo` (autres métadonnées : `type`, `frais_port`,
  `quantite_max`, `prix_barre`, `partenaire`, `lien`, `ordre`, voir
  `src/lib/boutique/stripe.ts`) ; paiement par Stripe Checkout (Klarna
  inclus), unique ou par abonnement si le prix par défaut est récurrent. Masquée tant que `STRIPE_BOUTIQUE_KEY` (clé restreinte) n'est
  pas sur Render. Produit d'exemple dans « environnement de test WHAOO ».
  CGV sur `/cgv` (2026-09-29, base à faire relire), rappelées sur la page
  de paiement Stripe ; restent à fournir par Medy : le médiateur de la
  consommation (`MEDIATEUR` dans `src/lib/legal-info.ts`) et le lien du
  portail client Stripe (`STRIPE_PORTAIL_URL`, résiliation en ligne des
  abonnements). Boutique et appli se font la promotion mutuellement (CGU à
  jour). Rubriques par la métadonnée `categorie` (ex. « Sites web &
  hébergement »). Medy devient revendeur LWS (domaines, hébergement, gérés
  techniquement par LWS) : CGV article 15 et annexe 2 (sous-traitance
  RGPD) ; produits Stripe à créer quand il donnera ses prix. Médiateur
  envisagé : ANM Consommation (à inscrire dans `MEDIATEUR` seulement une
  fois l'adhésion confirmée). Domaine dédié possible : `BOUTIQUE_DOMAINES`
  (accueil = boutique, retour après paiement sur ce domaine, voir
  `src/lib/boutique/domaines.ts` et `src/proxy.ts`).
- **Partenaires commerçants** (stratégie de promotion croisée, 2026-09-29) :
  page `/partenaires` (mise en avant dans la boutique + site vitrine contre
  promotion de whaoo) et affiche A4 imprimable avec QR code
  `/partenaires/affiche?nom=…` (lien `whaoo.site/?partenaire=<id>`, pas
  encore mesuré). Feuille de route : parrainage avec code promo Stripe,
  mesure du trafic, Reel 9:16. Dossier complet de la boutique :
  `livrables/boutique/`.
- **Rangement Google Drive** (Medy est sur Chromebook) : fait le
  2026-09-28. Dans le dossier `WHAOO` de Mon Drive : `00 - À trier` à
  `07 - Support et emails`, `01 - Sauvegardes/vX.Y - date`, et un dossier
  `Téléchargements` à la racine. Le script Apps Script « whaoo - Rangement
  automatique » (à installer par Medy : le connecteur ne peut pas créer de
  projet Apps Script) classe toutes les 10 minutes les fichiers « whaoo… »
  de `Téléchargements` et tout ce qui est dans `00 - À trier` ; il est
  installé (rangé à la racine de `WHAOO`). Les fichiers existants de Medy
  ont été rangés à la main le 2026-09-28. Ne jamais ranger dans le Drive le
  code de récupération du coffre des clés.
