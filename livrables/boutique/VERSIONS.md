# Versions du dossier boutique

La plus récente en haut. À chaque évolution de la boutique (produits,
paiements, CGV, domaines, partenaires…) : mettre à jour
`dossier-boutique.html`, ajouter ici l'entrée `## vX.Y — AAAA-MM-JJ`
(version précédente + 0.1), puis lancer `scripts/dossier-boutique.sh` qui
génère `whaoo-dossier-boutique-vX.Y-AAAA-MM-JJ.pdf`.

## v1.1 — 2026-09-29

- Étude de l'offre revendeur LWS (hébergement cPanel/WHM en marque
  blanche, domaines, API) : conseils pour démarrer (petite formule,
  facturation Stripe plutôt que WHMCS, automatisation plus tard par l'API)
  et points à vérifier dans le contrat avant de signer.

## v1.0 — 2026-09-29

- Première version : contribution libre Stripe en mode réel, Klarna (via
  Stripe et page directe), boutique « Bons plans » alimentée par Stripe,
  abonnements, CGV avec article domaines et hébergement et annexe RGPD,
  rubriques, domaine dédié, page partenaires et affiche QR code, feuille de
  route et actions restantes.
