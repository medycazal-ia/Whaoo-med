# Décisions produit — whaoo (ex. "Courses & Budget")

Ce document trace les décisions prises sur la base de la section 1 du cahier des
charges. Par défaut, les recommandations du cahier ont été **adoptées telles
quelles** (optimisées pour un lancement solo, budget maîtrisé) afin de ne pas
bloquer le développement. Elles restent modifiables à tout moment — voir la
colonne "Statut".

## 1. Tableau des décisions

| Sujet | Décision adoptée | Statut |
|---|---|---|
| Hébergement | Vercel, région Paris (`cdg1`) si dispo pour le projet | ✅ Adopté par défaut |
| Backend/Frontend | Next.js (App Router) + Tailwind CSS | ✅ Adopté par défaut |
| Authentification | Supabase Auth (email/mot de passe + Google OAuth) | ✅ Adopté par défaut |
| Base de données comptes | PostgreSQL Supabase, région Frankfurt (UE) | ✅ Adopté par défaut |
| Stockage courses par défaut | Base interne (même instance Supabase Postgres), séparée logiquement des données de compte | ✅ Adopté par défaut |
| Connecteur Excel | OneDrive/Excel Online via Microsoft Graph API | ✅ Adopté par défaut |
| Modèle économique | Freemium : gratuit avec 1 connecteur au choix + fonctions de base ; palier payant (~2-4 €/mois, montant indicatif) pour connecteur libre, export PDF illimité, parrainage récompensé | ⚠️ Montant à ajuster par l'utilisateur — placeholder dans le code |
| RGPD / hébergement données | Supabase région Frankfurt ; vérifier la localisation de chaque sous-traitant tiers (email transactionnel, analytics) avant de le brancher | ✅ Principe adopté — liste des sous-traitants à tenir à jour au fil de l'intégration |

## 2. Points encore ouverts (à trancher par l'utilisateur, cf. section 11)

- **Récompense de parrainage** : non définie. Un mécanisme technique sera prévu
  (table de suivi filleul/statut) mais la récompense elle-même (mois offert,
  badge, bonus cagnotte...) reste un paramètre à configurer, pas une valeur en
  dur.
- **Lien de la cagnotte de soutien** (Ko-fi/PayPal/Tipeee...) : à fournir par
  l'utilisateur. Prévu comme variable d'environnement modifiable sans
  redéploiement (`SUPPORT_LINK_URL`), pas en dur dans le code.
- **Politique de confidentialité / CGU** : non rédigées ici (hors périmètre
  technique). Emplacement réservé dans la landing page et le parcours
  d'inscription (case à cocher dédiée, distincte des CGU), contenu à fournir.
- **Comptes développeur tiers** : Airtable API, Google Cloud Console, Microsoft
  Azure App Registration, Supabase, Vercel — à créer par l'utilisateur, clés à
  fournir via variables d'environnement (`.env.example` tenu à jour au fil du
  développement).

## 3. Nom de l'application ("whaoo")

Vérification de disponibilité effectuée (recherche web, accès direct WHOIS/INPI/
stores non disponible depuis cet environnement) :

- **whaoo.com** : déjà pris, utilisé par une marque active de crêpes fourrées
  au chocolat (Whaoo!, marché UK, whaoo-uk.com), avec un compte Twitter/X
  (@whaoo) actif.
- **whaoo.fr** : ne résout pas en DNS — semble libre, à confirmer via un
  registrar.
- **INPI (marques françaises), App Store, Google Play** : non vérifiables
  automatiquement depuis cet environnement (accès réseau bloqué). À vérifier
  manuellement avant tout dépôt de marque ou publication sur les stores.

**Décision de l'utilisateur (2026-09-17)** : continuer le développement avec
"whaoo" comme nom de travail dans le code et le dépôt. Décision finale de
marque/domaine reportée — ne bloque pas le développement.

## 4. Ordre de développement

Suivi via la liste de tâches du projet, dans l'ordre de la section 9 du cahier
des charges (auth → fonctionnalités de base → démo → connecteur Airtable →
Sheets/Excel → notifications → PDF → parrainage → avatars → durcissement
sécurité/RGPD), avec la landing page (section 10) intégrée en parallèle des
étapes de fonctionnalités.
