// Prépare une photo de ticket de caisse pour l'OCR. Deux problèmes distincts
// à résoudre :
// 1. Une photo plein format (10+ Mpx sur un smartphone récent) peut épuiser
//    la mémoire du navigateur et faire planter l'appli (observé sur mobile,
//    juste après la prise de la photo) — d'où le plafond DIMENSION_MAX.
// 2. Le texte d'un ticket de caisse est minuscule, et une photo "normale"
//    (ex. 1200x1600) a une résolution effective bien trop basse pour ce
//    texte : Tesseract l'estime autour de 130 DPI, loin des ~300 DPI dont
//    il a besoin. Une simple photo, même nette, ne suffit donc pas.
//
// Le traitement ci-dessous (agrandissement + niveaux de gris + étirement de
// contraste + renforcement de la netteté) a été vérifié empiriquement :
// comparé côte à côte sur un vrai ticket Carrefour, c'est la combinaison
// des quatre étapes — et en particulier le renforcement de netteté, sans
// quoi les lignes d'articles restent illisibles — qui permet à l'OCR de
// retrouver correctement les articles et leurs prix.
const DIMENSION_MAX = 2600;
const DIMENSION_MIN_CIBLE = 2200;
const AGRANDISSEMENT_MAX = 2;

// Noyau de renforcement de netteté (unsharp mask 3x3 classique).
const NOYAU_NETTETE = [0, -1, 0, -1, 5, -1, 0, -1, 0];

function appliquerNettete(
  niveaux: Uint8ClampedArray<ArrayBufferLike>,
  largeur: number,
  hauteur: number,
): Uint8ClampedArray<ArrayBufferLike> {
  const resultat = new Uint8ClampedArray(niveaux.length);
  for (let y = 0; y < hauteur; y++) {
    for (let x = 0; x < largeur; x++) {
      let somme = 0;
      let k = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const yy = Math.min(hauteur - 1, Math.max(0, y + dy));
          const xx = Math.min(largeur - 1, Math.max(0, x + dx));
          somme += niveaux[yy * largeur + xx] * NOYAU_NETTETE[k];
          k++;
        }
      }
      resultat[y * largeur + x] = somme;
    }
  }
  return resultat;
}

export async function redimensionnerImage(fichier: File): Promise<Blob> {
  const bitmap = await createImageBitmap(fichier);
  const plusGrandCote = Math.max(bitmap.width, bitmap.height);

  let ratio = 1;
  if (plusGrandCote > DIMENSION_MAX) {
    ratio = DIMENSION_MAX / plusGrandCote;
  } else if (plusGrandCote < DIMENSION_MIN_CIBLE) {
    ratio = Math.min(DIMENSION_MIN_CIBLE / plusGrandCote, AGRANDISSEMENT_MAX);
  }

  const largeur = Math.round(bitmap.width * ratio);
  const hauteur = Math.round(bitmap.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = largeur;
  canvas.height = hauteur;
  const contexte = canvas.getContext("2d");
  if (!contexte) {
    bitmap.close();
    return fichier;
  }

  contexte.imageSmoothingEnabled = true;
  contexte.imageSmoothingQuality = "high";
  contexte.drawImage(bitmap, 0, 0, largeur, hauteur);
  bitmap.close();

  const imageData = contexte.getImageData(0, 0, largeur, hauteur);
  const donnees = imageData.data;
  const nbPixels = largeur * hauteur;
  let niveaux: Uint8ClampedArray<ArrayBufferLike> = new Uint8ClampedArray(nbPixels);

  // Niveaux de gris.
  let min = 255;
  let max = 0;
  for (let i = 0, p = 0; p < nbPixels; i += 4, p++) {
    const gris = 0.299 * donnees[i] + 0.587 * donnees[i + 1] + 0.114 * donnees[i + 2];
    niveaux[p] = gris;
    if (gris < min) min = gris;
    if (gris > max) max = gris;
  }

  // Étirement d'histogramme (normalisation de contraste).
  const etendue = max - min || 1;
  for (let p = 0; p < nbPixels; p++) {
    niveaux[p] = ((niveaux[p] - min) / etendue) * 255;
  }

  // Renforcement de la netteté — l'étape décisive pour que le texte
  // minuscule d'un ticket de caisse reste lisible par l'OCR après
  // agrandissement.
  niveaux = appliquerNettete(niveaux, largeur, hauteur);

  for (let i = 0, p = 0; p < nbPixels; i += 4, p++) {
    donnees[i] = niveaux[p];
    donnees[i + 1] = niveaux[p];
    donnees[i + 2] = niveaux[p];
  }
  contexte.putImageData(imageData, 0, 0);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92),
  );

  return blob ?? fichier;
}
