# Livrables hors application

- `registre-cnil/` : registre des traitements (xlsx, à compléter) et le
  script qui le génère.
- `logo/` : logo, icônes de l'application et bannière de partage (sources SVG).
- `extension-emulateur-ecran/` : extension navigateur pour afficher un site
  aux tailles d'écran téléphone et tablette.
- `video-demo/` : sources de la vidéo de démo de la page d'accueil
  (enregistrement brut de l'écran, voix off, sous-titres SRT/ASS, script
  Playwright d'enregistrement). Vidéo finale et Reel Facebook :
  `public/videos/`.
- `coffre-cles/whaoo-coffre-cles.html` : coffre des clés vierge (fichier
  HTML autonome, chiffré AES-256 avec le mot de passe choisi à sa
  création, et un code de récupération en cas d'oubli). Ne jamais
  committer une version remplie.
- `outils/modele-rangement-drive.html` : modèle réutilisable du script
  Google Apps Script de rangement automatique d'un dossier Drive par projet
  (champs à adapter surlignés en orange, script généré et copiable).
- `video-soutien/` : sources de la vidéo « Soutiens whaoo » (intro avatar,
  message dit avec la voix clonée de Medy sur ElevenLabs, sous-titres ASS,
  carton de fin). Vidéo finale : `public/videos/whaoo-soutien.mp4`.
