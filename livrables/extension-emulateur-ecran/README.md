# Émulateur d'écran — extension de navigateur

Redimensionne la fenêtre de ton navigateur à la taille d'un PC, d'une
tablette ou d'un smartphone, pour tester rapidement le rendu d'un site.
Complètement indépendant de whaoo — utilisable sur n'importe quelle page.

## Comment ça marche

L'extension redimensionne la fenêtre du navigateur elle-même
(`chrome.windows.update`) — pas d'émulation pixel-parfaite façon outils de
développement, juste un redimensionnement direct. La zone de page réellement
affichée sera donc un peu plus petite que la taille choisie, à cause de la
barre d'adresse, des onglets et d'une éventuelle barre de favoris. C'est la
même méthode que des extensions connues comme "Window Resizer", choisie
justement parce qu'elle marche sur toutes les configurations (y compris les
Chromebooks gérés par une école ou une entreprise), sans permission
particulière ni bandeau d'avertissement.

## Installation (mode développeur, pas besoin du Chrome Web Store)

1. Dézippe ce dossier quelque part sur ton ordinateur (garde-le : ne le
   supprime pas après installation, Chrome le lit directement depuis là).
2. Ouvre `chrome://extensions` dans Chrome.
3. Active **"Mode développeur"** (interrupteur en haut à droite).
4. Clique sur **"Charger l'extension non empaquetée"**.
5. Sélectionne le dossier `emulateur-ecran` (celui qui contient
   `manifest.json` directement).
6. L'icône apparaît dans la barre d'outils (épingle-la avec l'icône
   puzzle 🧩 si tu ne la vois pas directement).

## Utilisation

1. Va sur le site que tu veux tester.
2. Clique sur l'icône de l'extension.
3. Choisis un format (PC, tablette portrait/paysage, smartphone
   portrait/paysage) ou entre une taille personnalisée.
4. Pour revenir à une grande fenêtre, clique sur "Agrandir la fenêtre".

## Limites à connaître

- La taille affichée dans la popup est celle de la **fenêtre**, pas
  exactement celle du contenu de la page — compte quelques dizaines de
  pixels de moins en hauteur pour la vraie zone visible.
- Si tu as plusieurs écrans, la fenêtre garde sa position actuelle en
  changeant de taille ; si elle dépasse de l'écran, déplace-la
  manuellement après coup.
