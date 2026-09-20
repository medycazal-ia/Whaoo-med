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

// Lit les dimensions d'un JPEG directement dans ses en-têtes (marqueur SOF),
// sans décoder l'image. Sur les tests précédents (photo déjà réduite à
// 1200x1600 par la messagerie), le décodage complet ne posait pas de
// problème — mais une vraie photo prise en direct par l'appareil peut être
// 4x plus grande dans chaque dimension (12+ Mpx), et c'est très
// probablement CE décodage complet, avant toute réduction, qui épuise la
// mémoire du navigateur sur mobile. Connaître les dimensions à l'avance
// permet de demander au navigateur de décoder directement à une taille
// réduite (voir decoderBitmapBorne) au lieu de matérialiser l'image
// pleine résolution en mémoire avant de la réduire.
async function lireDimensionsJpeg(fichier: File): Promise<{ largeur: number; hauteur: number } | null> {
  const enTete = await fichier.slice(0, 262144).arrayBuffer();
  const vue = new DataView(enTete);
  if (vue.byteLength < 4 || vue.getUint16(0) !== 0xffd8) return null;

  let offset = 2;
  while (offset + 8 < vue.byteLength) {
    if (vue.getUint8(offset) !== 0xff) {
      offset++;
      continue;
    }
    const marqueur = vue.getUint8(offset + 1);
    if (marqueur === 0xd8 || marqueur === 0xd9) {
      offset += 2;
      continue;
    }
    const longueurSegment = vue.getUint16(offset + 2);
    const estSOF = marqueur >= 0xc0 && marqueur <= 0xcf && marqueur !== 0xc4 && marqueur !== 0xc8 && marqueur !== 0xcc;
    if (estSOF) {
      return { hauteur: vue.getUint16(offset + 5), largeur: vue.getUint16(offset + 7) };
    }
    offset += 2 + longueurSegment;
  }
  return null;
}

// Décode l'image en demandant directement au navigateur une taille bornée
// quand ses dimensions réelles sont connues à l'avance et dépassent
// `dimensionMax`, au lieu de décoder à pleine résolution puis réduire via
// un canvas — ce qui évite le pic mémoire du décodage complet.
async function decoderBitmapBorne(fichier: File, dimensionMax: number): Promise<ImageBitmap> {
  const dimensions = await lireDimensionsJpeg(fichier).catch(() => null);
  if (dimensions) {
    const plusGrandCote = Math.max(dimensions.largeur, dimensions.hauteur);
    if (plusGrandCote > dimensionMax) {
      const ratio = dimensionMax / plusGrandCote;
      try {
        return await createImageBitmap(fichier, {
          resizeWidth: Math.round(dimensions.largeur * ratio),
          resizeHeight: Math.round(dimensions.hauteur * ratio),
          resizeQuality: "high",
        });
      } catch {
        // Le navigateur ne supporte pas les options de redimensionnement à
        // la volée — on retombe sur un décodage classique ci-dessous.
      }
    }
  }
  return createImageBitmap(fichier);
}

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

// Plafond de taille avant envoi à un service distant (Mindee) : uniquement
// pour éviter le même plantage mémoire mobile que le traitement Tesseract
// ci-dessous — une photo de smartphone récent (10+ Mpx, parfois 8-15 Mo)
// peut faire planter l'appli rien qu'en la préparant pour l'envoi. Pas de
// niveaux de gris ni de netteté ici : Mindee fait sa propre analyse sur une
// photo couleur, pas besoin (et pas souhaitable) de la lui pré-traiter.
const DIMENSION_MAX_ENVOI = 2600;

export async function redimensionnerPourEnvoi(fichier: File): Promise<Blob> {
  const bitmap = await decoderBitmapBorne(fichier, DIMENSION_MAX_ENVOI);
  const plusGrandCote = Math.max(bitmap.width, bitmap.height);

  if (plusGrandCote <= DIMENSION_MAX_ENVOI) {
    bitmap.close();
    return fichier;
  }

  const ratio = DIMENSION_MAX_ENVOI / plusGrandCote;
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

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.9),
  );

  return blob ?? fichier;
}

export async function redimensionnerImage(fichier: File): Promise<Blob> {
  const bitmap = await decoderBitmapBorne(fichier, DIMENSION_MAX);
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
