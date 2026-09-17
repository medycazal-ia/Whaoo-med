# Registre des traitements — whaoo

Point de départ technique, rempli à partir du schéma de données réel de
l'application (2026-09-17). **Ceci n'est pas un document juridique final** :
à faire relire par un professionnel avant toute mise en ligne publique ou
prise de paiement (voir section 5.1 du cahier des charges et `DECISIONS.md`).

## 1. Compte utilisateur

| Donnée | Finalité | Base légale | Conservation | Accès |
|---|---|---|---|---|
| Nom, prénom | Identification du compte | Exécution du contrat (CGU) | Durée de vie du compte + suppression sous 30 jours après demande | Utilisateur, hébergeur (Supabase, UE) |
| Email | Identifiant de connexion, communications de service | Exécution du contrat | Idem | Idem |
| Mot de passe (haché) | Authentification | Exécution du contrat | Idem | Jamais en clair, géré par Supabase Auth |
| Téléphone (optionnel) | Vérification SMS future, contact | Consentement | Idem | Utilisateur, hébergeur |
| Avatar choisi | Personnalisation de l'interface | Consentement | Idem | Utilisateur, hébergeur |
| Code de parrainage / parrain | Fonctionnement du programme de parrainage | Exécution du contrat | Idem | Utilisateur, son parrain (statut uniquement, voir `mes_filleuls`) |

## 2. Données de courses et de budget

| Donnée | Finalité | Base légale | Conservation | Accès |
|---|---|---|---|---|
| Budget mensuel, articles (label, détail, prix, quantité, statut) | Fonctionnalité principale de l'app | Exécution du contrat | Idem, exportable/supprimable par l'utilisateur à tout moment | Utilisateur uniquement (RLS), hébergeur |

Stockage par défaut : base interne (Supabase Postgres, région Frankfurt).
Si l'utilisateur choisit un connecteur externe (Airtable/Google
Sheets/Excel — non encore implémentés), ces mêmes données seront copiées
chez ce fournisseur, jamais les données de compte (voir tableau section 1
de `DECISIONS.md`).

## 3. Notifications push

| Donnée | Finalité | Base légale | Conservation | Accès |
|---|---|---|---|---|
| Abonnement push (endpoint, clés) | Envoi de rappels | Consentement explicite (bouton "Activer les rappels") | Jusqu'à désactivation ou expiration côté navigateur | Utilisateur, hébergeur |

## 4. Sous-traitants (à date)

| Service | Rôle | Localisation | DPA vérifié ? |
|---|---|---|---|
| Supabase | Auth + base de données | UE (Frankfurt, si configuré ainsi) | À vérifier par l'utilisateur avant lancement public |
| Vercel | Hébergement de l'application | À vérifier selon la région choisie (`cdg1` recommandé) | À vérifier |

À compléter dès qu'un service supplémentaire est branché (email
transactionnel, analytics, connecteurs Airtable/Google/Microsoft...).

## 5. Droits des utilisateurs — état d'implémentation

- **Accès / portabilité** : ✅ `/app/parametres` → export JSON complet.
- **Effacement** : ✅ `/app/parametres` → suppression réelle du compte
  (cascade sur profil, budgets, articles, abonnements push).
- **Consentement** : ✅ case dédiée distincte des CGU à l'inscription.
- **Opposition aux notifications** : ✅ bouton "Désactiver les rappels".
- **Rectification** : ⚠️ pas encore d'écran de modification du profil —
  à ajouter si besoin.

## 6. Ce qui reste à faire (hors périmètre technique)

- Rédaction finale de la politique de confidentialité et des CGU
  (actuellement des pages placeholder : `/cgu`, `/confidentialite`).
- Vérification des DPA et de la localisation réelle de chaque
  sous-traitant avant ouverture publique.
- Relecture de ce registre par une personne compétente en droit
  numérique avant toute mise en ligne publique.
