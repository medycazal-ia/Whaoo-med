# Journal des sauvegardes whaoo

Chaque version correspond à un commit « Sauvegarde vX.Y — date » sur la
branche `claude/whaoo-med-specs-8xx0r4` et à un zip daté
`whaoo-vX.Y-AAAA-MM-JJ.zip` remis à Medy. Une nouvelle version est créée à
chaque session de travail (procédure : `CLAUDE.md`). La plus récente est
toujours en haut.

Pour rouvrir une version : revenir à son commit
(`git log --grep='^Sauvegarde vX.Y '`), ou dézipper le zip et suivre
`LISEZ-MOI-RESTAURATION.md`.

---

## v1.0 — 2026-09-28

Première sauvegarde complète : l'application telle qu'elle tourne sur
whaoo.site (Render, service `whaoo`, région Frankfurt), base Supabase
`hqbysglomilntvcyvcqa` avec les migrations 0001 à 0010 appliquées.

**Application**
- Comptes : inscription, connexion, mot de passe oublié, suppression de
  compte, export RGPD des données, avatars, parrainage.
- Courses : ajout manuel, par la voix (dictée navigateur, repli Whisper sur
  Safari iOS), depuis une recette, un régime ou un document ; estimation
  automatique des prix et base de prix communautaire anonyme ; scan de
  ticket de caisse (Claude vision puis OCR local Tesseract en repli).
- Budget : budget de la période, rythme de dépense, cagnotte estimée,
  « Budget immédiat » par session de courses, changement du budget à la voix.
- Période de budget personnalisable (jour de début 1 à 28, Paramètres).
- Liste groupée par date de courses (« Courses du 28/09 ») avec masquer,
  tout acheter, supprimer ; facturette PDF par session d'achat et facture
  PDF de la période ; export PDF de la liste.
- Notifications push (rappels), FAQ avec « aide moi », promotions locales
  (géolocalisation, bientôt disponible).
- Voix humaine ElevenLabs « Bonjour / Au revoir {prénom} » (active dès que
  le plan payant ElevenLabs est pris).
- Back-office `/app/admin` : réservé aux ADMIN_EMAILS, mot de passe en plus,
  carte Profils (recherche par nom, prénom, téléphone, email ; modification
  avec confirmation avant chaque écriture, email de connexion compris).
- Mode démo `/demo` sans compte ; page d'accueil avec vidéo de démo
  (sous-titres dans un bandeau en haut), publication Facebook intégrée ;
  pages de partage `/s/1` à `/s/4`, présentation `/pitch/fr|en|es`, studio
  d'enregistrement `/studio`.
- Palette claire vert et rose, contrastes conformes WCAG AA.

**Sécurité et conformité**
- En-têtes CSP, HSTS, limitation des tentatives de connexion (5 échecs par
  5 minutes, aussi sur le back-office), RLS Supabase sur toutes les tables.
- Mentions légales (non assujetti à la TVA), CGU, politique de
  confidentialité déclarant les sous-traitants ; registre CNIL des
  traitements (dans `livrables/registre-cnil/`, à compléter).

**Livrables inclus** (`livrables/`) : registre CNIL, logo et icônes,
extension navigateur « émulateur d'écran », sources de la vidéo de démo
(enregistrement brut, voix off, sous-titres, script d'enregistrement). La
vidéo finale et le Reel Facebook sont dans `public/videos/`.

**Restant à faire côté Medy** : plan payant ElevenLabs (voix) et Render
(pas de mise en veille), relecture juridique professionnelle, compléter le
registre CNIL, vérifier la période et les PDF sur de vraies données.

**Prochaine étape prévue** : connexion Stripe (nouvelle session).
