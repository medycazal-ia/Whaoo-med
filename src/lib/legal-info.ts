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
  nom: "Render Services, Inc.",
  formeJuridique: "Société de droit américain (Delaware, États-Unis)",
  adresse: "525 Brannan Street, Ste 300, San Francisco, CA 94107, États-Unis",
  rcs: "Non applicable (société immatriculée aux États-Unis, pas de RCS français)",
  telephone: "+1 415-319-8186",
  siteWeb: "render.com",
};

// Le nom de domaine whaoo.site est enregistré et géré chez LWS (registrar),
// mais l'application elle-même est hébergée techniquement chez Render —
// deux rôles distincts. Adresse Render source : leurs conditions
// d'utilisation officielles (render.com/terms).

export const NOM_APPLICATION = "whaoo";
