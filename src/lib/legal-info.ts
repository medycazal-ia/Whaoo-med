// Informations légales centralisées, réutilisées par les pages
// /mentions-legales, /cgu et /confidentialite. Les champs marqués
// "[À COMPLÉTER]" sont des informations obligatoires que l'éditeur doit
// fournir — impossible de les deviner ou de les inventer sans produire un
// document légalement invalide.

export const EDITEUR = {
  nom: "La Maison du Crel",
  formeJuridique: "[À COMPLÉTER : forme juridique — SARL, SAS, entreprise individuelle...]",
  adresse: "231 rue du Faubourg Saint-Honoré, 75001 Paris",
  siret: "[À COMPLÉTER : numéro SIRET]",
  capitalSocial: "[À COMPLÉTER : capital social, si société]",
  rcs: "[À COMPLÉTER : ville d'immatriculation RCS]",
  tva: "[À COMPLÉTER : numéro de TVA intracommunautaire, si applicable]",
  directeurPublication: "[À COMPLÉTER : nom du directeur de la publication]",
  emailContact: "[À COMPLÉTER : email de contact]",
};

export const HEBERGEUR = {
  nom: "LWS (Ligne Web Services)",
  formeJuridique: "SARL",
  adresse: "4 rue Galvani, 75838 Paris Cedex 17",
  rcs: "RCS Paris B 450 453 881",
  telephone: "01 77 62 30 03",
  siteWeb: "www.lws.fr",
};

// ⚠️ Le site tourne actuellement sur Render (whaoo.onrender.com), pas sur
// LWS. Cette fiche hébergeur doit correspondre à l'hébergeur technique réel
// au moment de la publication — à corriger si l'hébergement effectif reste
// Render/Vercel plutôt que LWS.

export const NOM_APPLICATION = "whaoo";
