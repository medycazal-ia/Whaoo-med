# Cahier des charges — Application "Courses & Budget"

## 0. Contexte et objectif

Application mobile-first (web app installable, PWA) permettant de :
- Noter ses courses à la voix ou manuellement pendant les achats
- Suivre un budget mensuel avec alerte de rythme de dépense
- Calculer une "cagnotte" d'épargne virtuelle selon le rythme réel vs idéal
- Gérer des comptes utilisateurs (inscription/connexion) avec choix de la base de données de stockage (Airtable, Google Sheets, ou base de données dédiée)
- Proposer un système de parrainage
- Offrir un mode démo pré-rempli pour présenter l'outil sans créer de compte

Un prototype visuel/fonctionnel existe déjà (HTML/JS autonome, localStorage, sans compte). Il sert de référence UX pour cette version réelle : voir section 8 (Design system) et section 9 (fonctionnalités déjà validées).

**Objectif de ce document** : servir de spécification à un agent de développement (Claude Code) pour construire une version réelle, avec vrais comptes et vraie base de données.

---

## 1. Points à trancher AVANT de coder (décisions produit)

Ces choix ont un impact structurant. Recommandation concrète pour chaque point, pensée pour un lancement solo à budget maîtrisé — à valider ou modifier avant le développement :

| Sujet | Question ouverte | Recommandation | Pourquoi |
|---|---|---|---|
| Hébergement | Où l'app tournera-t-elle en production ? | **Vercel**, région Paris (`cdg1`) si disponible pour le projet | Gratuit pour démarrer, scale automatiquement, déploiement direct depuis le dépôt de code, aucune administration serveur |
| Backend | Framework serveur | **Next.js** | Front + API dans un seul projet, écosystème le plus documenté pour ce genre d'app, s'intègre nativement à Vercel |
| Authentification | Fait maison ou service tiers ? | **Supabase Auth** | Gratuit jusqu'à 50 000 utilisateurs actifs/mois, gère nativement email/mot de passe + Google OAuth, hashage des mots de passe pris en charge automatiquement, et fournit la base de données au même endroit (voir ligne suivante) — évite de payer et de gérer deux services séparés (Clerk est très bien aussi mais facturé plus vite dès qu'il y a du volume) |
| Base de données comptes | Où vivent les comptes utilisateurs eux-mêmes ? | **PostgreSQL fourni par Supabase, région Frankfurt (UE)** | Même fournisseur que l'auth = une seule facture, un seul tableau de bord ; région UE = conformité RGPD simplifiée dès le départ. **Règle stricte : les connecteurs Airtable/Sheets/Excel ne stockent QUE les données de courses de l'utilisateur, jamais les mots de passe ni les données de compte** |
| Excel | Fichier local ou OneDrive/Excel Online ? | **OneDrive/Excel Online via Microsoft Graph API** | Seule option connectable en ligne sans que l'utilisateur envoie un fichier manuellement à chaque fois |
| Modèle économique | Gratuit, freemium, abonnement ? | **Freemium** suggéré à titre d'exemple : gratuit avec 1 connecteur au choix + fonctions de base ; palier payant (~2-4 €/mois) pour changer de connecteur librement, export PDF illimité et parrainage récompensé | Un modèle gratuit pur ne finance pas l'hébergement/la maintenance ; un abonnement seul freine l'adoption initiale. **Chiffres à ajuster selon le nombre d'utilisateurs visé — ce n'est qu'un point de départ, pas une étude de marché** |
| RGPD | Qui héberge les données ? | **Supabase région Frankfurt** + éviter tout sous-traitant hors UE (attention aux services d'envoi d'email, d'analytics, etc. — vérifier leur localisation aussi) | Le simple fait de choisir un hébergeur UE ne suffit pas si un service tiers branché dessus (emailing, stats) traite les données ailleurs |

**⚠️ Ne pas démarrer le développement des sections 3 et 5 sans avoir tranché ce tableau.**
**Ces recommandations optimisent pour "démarrer vite et pas cher en solo" — si le projet prend de l'ampleur (au-delà de quelques milliers d'utilisateurs), elles seront à revoir avec un professionnel (hébergement dédié, DPO, etc.).**

---

## 2. Utilisateurs et comptes

### 2.1 Inscription
Champs à collecter :
- Nom
- Prénom
- Email (unique, sert d'identifiant)
- Mot de passe (jamais stocké en clair — hashage bcrypt/argon2, ou délégué à un service d'auth tiers)
- Téléphone mobile (optionnel à la création, vérifiable par SMS plus tard si besoin)
- Réseau social de provenance (optionnel — ex: connexion via Google/Facebook en plus du formulaire classique)
- Avatar (voir section 7)
- Code de parrainage saisi (optionnel, voir 2.4)

### 2.2 Connexion
- Email + mot de passe
- Option "connexion via Google" recommandée en complément (réduit la friction et le risque de mot de passe faible)
- Lien "mot de passe oublié" avec envoi d'email de réinitialisation

### 2.3 Choix du connecteur de données (à l'inscription ou dans les paramètres)
L'utilisateur choisit où sont stockées SES données de courses (pas son compte, voir tableau section 1) :
- **Airtable** (connexion OAuth, l'utilisateur autorise l'app à créer une base dans son propre compte Airtable)
- **Google Sheets** (connexion OAuth Google, l'app crée une feuille dans son Drive)
- **Excel / OneDrive** (connexion OAuth Microsoft)
- **Stockage interne par défaut** (base de données propre de l'application — option la plus simple, à proposer en premier choix)

Chaque connecteur nécessite :
- Un flux OAuth2 côté du fournisseur choisi
- Un schéma de données identique en sortie (mêmes colonnes/champs) quel que soit le connecteur, pour que l'app fonctionne pareil derrière
- Une gestion d'erreur si le token expire ou si l'utilisateur révoque l'accès (message clair, pas de perte de données silencieuse)

### 2.4 Parrainage
- Chaque utilisateur a un code/lien de parrainage unique
- Bouton "Inviter" avec partage natif (Web Share API) du lien
- Écran listant les filleuls et leur statut (inscrit / actif)
- Récompense à définir (ex : mois offert, badge, avantage sur la cagnotte) — **à trancher avant dev**

---

## 3. Fonctionnalités métier (déjà validées dans le prototype)

À reprendre telles quelles, en les connectant à la vraie base de données choisie par l'utilisateur au lieu du localStorage :

1. **Saisie vocale** (Web Speech API) : article, prix, quantité, destination (acheté / à acheter plus tard) — avec écran de confirmation avant enregistrement (la reconnaissance vocale n'est jamais fiable à 100 %)
2. **Saisie manuelle** en secours/complément
3. **Deux listes** : Acheté / À acheter plus tard, avec bascule entre les deux
4. **Rappels** : à chaque ouverture de l'app, afficher les articles encore en attente ; ajouter si possible une **vraie notification push** (via service worker + Push API) puisque cette version aura un vrai backend capable de déclencher des notifications programmées — amélioration par rapport au prototype
5. **Budget mensuel** : saisie, jauge de progression, statut de rythme (serein / vigilant / attention) calculé sur le rythme jour par jour
6. **Cagnotte virtuelle** : écart entre rythme idéal et dépenses réelles, avec suggestions de paliers (petit plaisir / sortie / voyage)
7. **Export facture PDF** : génération PDF téléchargeable (pas seulement l'impression navigateur du prototype — utiliser une lib serveur type Puppeteer ou react-pdf pour un vrai fichier)
8. **Renouvellement mensuel** : archivage de l'historique du mois précédent au lieu d'une simple remise à zéro (permet des statistiques futures)

---

## 4. Mode démo

- Compte fictif accessible sans inscription (bouton "Essayer la démo" sur l'écran de connexion)
- Pré-rempli avec des données réalistes : budget du mois, 10-15 articles répartis entre acheté/à acheter, historique de 2-3 mois passés pour montrer les statistiques
- Toute modification dans ce mode est temporaire (réinitialisée à chaque session, ou stockée dans une session isolée non persistante) — préciser clairement à l'utilisateur que c'est une démo ("Mode démo — vos modifications ne seront pas conservées")
- Ne doit jamais écrire dans une vraie base connectée (Airtable/Sheets/Excel) — uniquement des données factices en mémoire ou dans une base de démo dédiée

---

## 5. Sécurité et conformité (non négociable)

- Mots de passe : jamais stockés en clair, hashage systématique — **avec Supabase Auth (recommandé section 1), c'est géré automatiquement, à ne pas redévelopper à la main**
- Tokens OAuth des connecteurs (Airtable/Google/Microsoft) : chiffrés en base, jamais exposés côté client — Supabase propose un stockage chiffré (Vault) utilisable pour ça
- HTTPS obligatoire partout — automatique sur Vercel, rien à configurer
- RGPD : puisque des données personnelles réelles (nom, email, téléphone) seront collectées pour de vrais utilisateurs :
  - Politique de confidentialité obligatoire avant mise en ligne publique
  - Consentement explicite à la création de compte
  - Possibilité pour l'utilisateur de supprimer son compte et ses données
  - Hébergement des données en UE recommandé si utilisateurs français/européens
- Ces points doivent être traités par une personne compétente en droit numérique avant toute ouverture au public — ce n'est pas un détail technique à cocher rapidement

### 5.1 Suggestions concrètes pour démarrer sans budget juridique important

Ceci est un point de départ réaliste pour une phase de test/lancement restreint (quelques dizaines à quelques centaines d'utilisateurs), pas un substitut à un vrai conseil juridique dès que l'app grossit ou devient payante :

- **Politique de confidentialité et CGU** : utiliser un générateur reconnu (ex. l'outil de la CNIL, ou un générateur type Termly/Iubenda) pour produire un premier document conforme, puis le faire relire par un professionnel avant toute mise en ligne publique ou toute prise de paiement — le générateur seul ne suffit pas pour une app commerciale, il donne juste une base sérieuse à moindre coût
- **Registre des traitements** : la CNIL fournit un modèle simple (tableur) — le remplir dès le début (quelles données, pourquoi, combien de temps conservées, qui y a accès) évite de devoir tout reconstituer sous pression en cas de contrôle
- **Consentement** : case à cocher explicite (non pré-cochée) à l'inscription, distincte de la case "j'accepte les CGU" — un consentement pour la collecte de données personnelles ne doit pas être noyé dans l'acceptation générale des conditions
- **Droit à l'oubli** : un bouton "Supprimer mon compte" dans les paramètres qui déclenche une vraie suppression des données (pas juste une désactivation) sous un délai raisonnable (ex. 30 jours), y compris chez les connecteurs externes si des données y ont été copiées
- **Droit à la portabilité** : un bouton "Exporter mes données" (fichier JSON ou CSV téléchargeable) — techniquement simple à ajouter et couvre une obligation légale
- **Sous-traitants tiers** : dresser la liste de tout service qui touche des données utilisateur (hébergeur, service d'email transactionnel type Resend/SendGrid, outil d'analytics) et vérifier que chacun a un DPA (Data Processing Agreement) et une localisation compatible RGPD — beaucoup de services gratuits populaires (ex. certains outils d'analytics US) posent problème ici
- **Pas de DPO obligatoire** à cette échelle (un DPO n'est obligatoire qu'à partir d'un traitement à grande échelle de données sensibles ou d'une administration publique), mais garder une seule personne responsable en interne de ces sujets, même informellement
- **Seuil d'alerte** : dès que l'app dépasse quelques milliers d'utilisateurs actifs, prend des paiements, ou traite des données considérées sensibles, prévoir un budget pour un avocat spécialisé en droit du numérique — le développement peut avancer avec les bases ci-dessus, mais l'ouverture publique à grande échelle ne devrait pas se faire sans cette relecture

---

## 6. Avatars (10 modèles)

Style : moderne, ludique, tendance illustration vectorielle plate (flat design), variété de genres, couleurs et styles pour que chacun trouve le sien. Livrés en SVG pour rester légers et nets sur tous les écrans.

Proposition de gamme (à ajuster selon le rendu) :
1. Portrait rond stylisé, dégradé pastel, cheveux courts
2. Portrait avec lunettes, palette vive (orange/jaune)
3. Silhouette minimaliste géométrique, monochrome bleu
4. Portrait bouclé, palette terracotta/vert sauge
5. Avatar animal stylisé (renard) façon mascotte
6. Portrait avec foulard/turban, palette violette
7. Avatar animal stylisé (chat) façon mascotte
8. Portrait barbu, palette sombre/contrastée
9. Portrait avec chapeau, style rétro pop
10. Avatar abstrait (forme/pattern) pour ceux qui préfèrent ne pas avoir de visage

Ces 10 avatars peuvent être produits séparément (session dédiée avec l'outil de visualisation de Claude), indépendamment du reste du développement — ce n'est pas un point bloquant pour démarrer le backend.

---

## 7. Design system (repris du prototype, à conserver)

- **Concept** : tableau d'épicerie/marché — un bandeau "ardoise" sombre pour le budget, une zone "ticket de caisse" claire pour les listes
- **Couleurs** :
  - Ardoise : `#2B3A32` / `#33453B`
  - Craie : `#F1EDE1`
  - Papier ticket : `#FBF8F1`
  - Tomate (alerte) : `#C1452D`
  - Basilic (positif) : `#5E7C52`
  - Ambre (vigilance) : `#C98A2C`
- **Typographies** : Space Grotesk (titres), IBM Plex Mono (chiffres/prix, esprit ticket de caisse), Inter (texte courant)
- Voir le fichier prototype `courses-agent.html` pour le détail complet des composants (jauge, cartes, badges de statut)

---

## 8. Pile technique suggérée (à valider avec Claude Code selon ses préférences d'exécution)

- **Frontend** : Next.js (React) + Tailwind CSS
- **Auth** : Auth.js (NextAuth) ou Supabase Auth
- **Base de données comptes** : PostgreSQL (Supabase ou Neon)
- **Connecteurs externes** : APIs officielles Airtable, Google Sheets, Microsoft Graph (Excel/OneDrive), chacun derrière une interface commune côté code (un seul contrat de données, plusieurs implémentations)
- **Notifications** : Web Push API + service worker
- **PDF** : react-pdf ou Puppeteer côté serveur
- **Hébergement** : Vercel

---

## 9. Ordre de développement recommandé

1. Authentification + compte utilisateur (email/mot de passe + Google), sans connecteur externe, stockage interne uniquement
2. Fonctionnalités métier de base (liste, budget, cagnotte) branchées sur le stockage interne
3. Mode démo
4. Un seul connecteur externe (Airtable en premier, car déjà disponible) pour valider l'architecture "plusieurs sources de données"
5. Ajout des connecteurs Google Sheets et Excel/OneDrive une fois le premier validé
6. Notifications push
7. Export PDF réel
8. Parrainage
9. Avatars (peut être fait en parallèle, à tout moment)
10. Durcissement sécurité/RGPD + politique de confidentialité avant toute mise en ligne publique

---

## 10. Page d'accueil (landing page) — argumentaire, démo et soutien facultatif

Page publique (avant connexion), dans le même design system que l'app (section 7 : ardoise/ticket de caisse, mêmes couleurs et typographies), qui sert à la fois de vitrine et de porte d'entrée.

### 10.1 Argumentaire (contenu à adapter/valider, base de départ)

**Titre** : "Tes courses, sans les mauvaises surprises en caisse"

**Accroche** : Une appli simple qui note tes courses à la voix pendant que tu fais tes achats, suit ton budget du mois en temps réel, et te dit quand tu peux te faire plaisir — sans tableur, sans y penser.

**Trois arguments courts** (à illustrer chacun d'une icône ou petite capture d'écran) :
1. **Note à la voix, pas de saisie fastidieuse** — dis l'article et le prix, l'appli fait le reste
2. **Ton budget du mois, en clair** — un indicateur simple pour savoir si tu peux encore y aller ou s'il faut ralentir
3. **Une cagnotte qui se remplit toute seule** — quand tu dépenses moins que prévu, l'appli te le dit et te suggère un petit plaisir mérité

**Ton** : pratique, direct, pas de jargon technique ni de vocabulaire "startup" — cohérent avec le reste de l'app (voir section 7, écriture "conversationnelle, verbes actifs, sans remplissage").

### 10.2 Boutons d'action principaux

Deux boutons bien visibles, côte à côte ou empilés selon l'écran :

- **"Essayer la démo"** → ouvre l'application en mode démo (section 4), sans inscription, pour que le visiteur teste tout de suite
- **"Créer mon compte"** → lance le parcours d'inscription (section 2.1)

Un troisième point, plus discret (lien texte, pas un gros bouton) :
- **"Inviter quelqu'un"** → génère/affiche le lien de parrainage de l'utilisateur connecté (section 2.4) avec partage natif (Web Share API). Ce lien n'apparaît que pour un utilisateur déjà connecté, pas pour un visiteur anonyme sur la landing page.

### 10.3 Cagnotte de soutien (facultative) — à distinguer de la cagnotte budget in-app

**Important pour l'agent de développement** : bien nommer différemment ces deux notions dans le code et dans l'interface pour éviter toute confusion :
- la **"cagnotte"** de la section 3.6 est une fonctionnalité interne à chaque compte (calcul d'épargne budgétaire personnelle)
- la **"cagnotte de soutien"** décrite ici est un lien externe, unique, vers une plateforme de dons (Ko-fi, PayPal, Tipeee, ou équivalent — le lien exact sera fourni par l'utilisateur plus tard, prévoir un champ de configuration modifiable sans redéploiement, ex. variable d'environnement ou champ dans un panneau d'administration simple)

**Emplacement** : un lien discret sur la landing page (par exemple en pied de page ou dans une petite section dédiée), pas un bouton agressif ni une pop-up.

**Texte d'explication à afficher à côté du lien** (base de départ, à ajuster) :
> Cette appli est gratuite à l'usage de base et développée seule. Si elle te rend service, tu peux soutenir son développement et celui d'autres outils pratiques et accessibles, sans obligation — chaque contribution aide à continuer sans faire payer l'essentiel.

**Points de vigilance** :
- Le caractère facultatif doit être explicite dans le texte, pas seulement dans le fait de ne pas forcer le clic
- Ne jamais conditionner une fonctionnalité de l'app à cette contribution (sinon ce n'est plus un don libre mais un modèle payant déguisé — à séparer clairement du modèle freemium éventuel de la section 1)
- Si l'app devient un jour payante (abonnement), ce lien de soutien reste distinct et ne doit pas se substituer à une vraie tarification

---

## 11. Ce qui reste à faire par l'utilisateur (pas par l'agent de développement)

- Trancher le tableau de la section 1 (hébergement, auth, base par défaut, modèle économique, RGPD)
- Créer les comptes développeur nécessaires (Airtable API, Google Cloud Console, Microsoft Azure App Registration) et fournir les clés API à l'agent
- Rédiger ou faire rédiger la politique de confidentialité et les CGU
- Valider la récompense de parrainage
- Fournir le lien réel de la cagnotte de soutien (Ko-fi/PayPal/Tipeee ou équivalent) une fois choisi, et valider le texte d'explication affiché à côté (section 10.3)
- Décider si l'app sera un jour publiée sur les stores iOS/Android (nécessite comptes développeur Apple/Google payants et un vrai processus de soumission) ou reste une web app installable
