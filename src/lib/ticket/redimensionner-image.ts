// Réduit une photo (souvent 10+ Mpx sur un smartphone récent) à une taille
// raisonnable avant de la passer à Tesseract.js. Sans ça, l'OCR sur une
// photo plein format peut épuiser la mémoire du navigateur et faire
// planter l'appli (observé notamment sur mobile, juste après la prise de
// la photo) — largement plus que nécessaire pour lire du texte imprimé.
const DIMENSION_MAX = 1600;

export async function redimensionnerImage(fichier: File): Promise<Blob> {
  const bitmap = await createImageBitmap(fichier);
  const ratio = Math.min(1, DIMENSION_MAX / Math.max(bitmap.width, bitmap.height));

  if (ratio === 1) {
    bitmap.close();
    return fichier;
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

  contexte.drawImage(bitmap, 0, 0, largeur, hauteur);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.85),
  );

  return blob ?? fichier;
}
