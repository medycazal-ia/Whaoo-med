import QRCode from "qrcode";

const URL_APP = (process.env.NEXT_PUBLIC_APP_URL || "https://whaoo.site").replace(/\/$/, "");

// « Boulangerie Ti Pain » → « boulangerie-ti-pain » : identifiant du
// commerçant partenaire dans le lien de son QR code.
export function identifiantPartenaire(nom: string) {
  return nom
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

// Lien vers whaoo depuis l'affiche d'un partenaire : le paramètre permet de
// savoir plus tard quels commerçants amènent des utilisateurs.
export function lienPartenaire(nom: string) {
  const id = identifiantPartenaire(nom);
  return id ? `${URL_APP}/?partenaire=${id}` : `${URL_APP}/`;
}

// QR code en SVG (généré ici, sans service externe).
export function qrCodeSvg(url: string) {
  return QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#264a41" } });
}
