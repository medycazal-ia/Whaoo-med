export type ScriptTeleprompter = {
  id: string;
  titre: string;
  lignes: string[];
};

// Scripts prêts à l'emploi pour s'enregistrer en train de présenter whaoo en
// direct. Les trois premiers reprennent les scénarios déjà utilisés pour les
// vidéos IA (mêmes messages, cohérence de discours) ; le dernier sert de fil
// conducteur pour une démo complète plus longue (interview, webinaire...).
export const SCRIPTS_TELEPROMPTER: ScriptTeleprompter[] = [
  {
    id: "scenario-cuisine",
    titre: "Scénario 1 — Dans la cuisine",
    lignes: [
      "Tu es dans ta cuisine,",
      "il manque du lait, des œufs, du pain ?",
      "Dis-le à voix haute,",
      "whaoo ajoute chaque article",
      "avec un prix estimé.",
      "Une fois tes courses faites,",
      "marque-les achetées",
      "et ajuste les prix sur ton ticket.",
      "Ton budget se met à jour tout seul.",
      "Plus aucun oubli,",
      "une liste toujours prête.",
      "Ça, c'est whaoo.",
    ],
  },
  {
    id: "scenario-budget",
    titre: "Scénario 2 — Budget serré et cagnotte",
    lignes: [
      "Tu dois tenir un budget serré ce mois-ci ?",
      "whaoo te montre en temps réel où tu en es,",
      "et remplit ta cagnotte si tu économises.",
      "Trop gourmand pour les bonbons ou les chips ?",
      "Vois leur poids dans ton budget,",
      "et reprends le contrôle, sans culpabiliser.",
      "Un budget clair, une cagnotte qui grandit :",
      "voilà pourquoi whaoo.",
    ],
  },
  {
    id: "scenario-caisse",
    titre: "Scénario 3 — Calcul en caisse",
    lignes: [
      "Marre de calculer ta note dans ta tête",
      "pendant les courses ?",
      "Avec whaoo, parle à voix haute :",
      "« deux packs de lait »,",
      "« pommes trois euros »",
      "— l'appli fait le calcul pour toi,",
      "en temps réel.",
      "Seule condition :",
      "ne sois pas timide devant les rayons !",
      "Fini les additions de tête,",
      "place à whaoo.",
    ],
  },
  {
    id: "presentation-complete",
    titre: "Présentation complète (démo longue)",
    lignes: [
      "whaoo, c'est l'appli de courses qui t'écoute.",
      "Pas besoin de compte pour essayer :",
      "je lance la démo directement.",
      "Je dicte un article à voix haute...",
      "...et il apparaît avec un prix déjà estimé.",
      "Le prix vient de la moyenne communautaire,",
      "ou d'une estimation indicative sinon.",
      "Je peux aussi dicter mon budget du mois.",
      "Tout se met à jour en temps réel :",
      "budget dépensé, reste à dépenser, cagnotte.",
      "Si je fais mes courses avec une recette,",
      "je colle la liste d'ingrédients d'un coup.",
      "Une fois au magasin, je marque acheté,",
      "et j'ajuste les prix réels de mon ticket.",
      "Je peux même scanner mon ticket de caisse",
      "pour enrichir la base de prix communautaire.",
      "Si j'ai une question, je dis juste « aide moi »,",
      "et la FAQ s'ouvre automatiquement.",
      "Tout ça, sans jamais taper sur un clavier.",
      "C'est gratuit, sans engagement : voilà whaoo.",
    ],
  },
];
