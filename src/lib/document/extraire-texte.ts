// Extraction de texte côté navigateur pour un PDF importé (aucun envoi à un
// serveur, même logique de confidentialité que le scan de ticket par OCR).
// Chargé dynamiquement uniquement quand un fichier PDF est réellement
// importé, pour ne pas alourdir le chargement initial de la page.
export async function extraireTextePdf(fichier: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const buffer = await fichier.arrayBuffer();
  const document = await pdfjsLib.getDocument({ data: buffer }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= document.numPages; i++) {
    const page = await document.getPage(i);
    const contenu = await page.getTextContent();

    let texte = "";
    let dernierY: number | null = null;
    for (const item of contenu.items) {
      if (!("str" in item)) continue;
      const y = item.transform[5];
      if (dernierY !== null && Math.abs(y - dernierY) > 2) {
        texte += "\n";
      } else if (texte && !texte.endsWith(" ") && !texte.endsWith("\n")) {
        texte += " ";
      }
      texte += item.str;
      dernierY = y;
    }
    pages.push(texte);
  }

  return pages.join("\n");
}
