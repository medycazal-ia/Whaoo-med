export type QuestionFaq = {
  id: string;
  question: string;
  reponse: string;
  motsCles: string[];
};

// 20 questions couvrant : usage de l'appli, sécurité, implications d'avoir
// un compte, bénéfices apportés, la cagnotte, contacter le fondateur,
// suggestions. Les mots-clés servent à la recherche simple (texte tapé ou
// dicté), sans dépendre d'un service externe.
export const FAQ: QuestionFaq[] = [
  {
    id: "scenario-usage-type",
    question: "Comment se déroule une utilisation typique de whaoo ?",
    reponse:
      "Tu es dans ta cuisine, tu vois qu'il manque du lait, des œufs, du pain : tu le dis à voix haute ou tu le tapes, whaoo ajoute chaque article à ta liste avec une estimation de prix. Au supermarché, tu coches chaque article dans ton caddie (« Marquer acheté »), puis tu ajustes les prix avec ceux réellement payés sur ton ticket — ton budget se met à jour tout seul. Pour aller plus loin : colle une liste d'ingrédients de recette pour l'ajouter en un clic, ou prépare une liste de courses mensuelle récurrente à réutiliser chaque mois sans tout retaper.",
    motsCles: ["scenario", "utilisation", "exemple", "typique", "comment ca marche", "cas d'usage"],
  },
  {
    id: "pour-qui-est-whaoo",
    question: "whaoo est fait pour quel genre de profil ?",
    reponse:
      "Deux profils types : tu dois tenir un budget serré ce mois-ci — whaoo te montre en temps réel où tu en es pour ne jamais dépasser sans t'en rendre compte, et si tu économises, ta cagnotte se remplit pour un petit plaisir mérité. Ou à l'inverse, tu sais que tu craques facilement sur les bonbons, les chips ou les pâtisseries — en voyant leur poids dans ton budget affiché noir sur blanc, whaoo t'aide à en prendre conscience et à réduire, sans culpabiliser. Que tu veuilles serrer les cordons de la bourse ou te faire plaisir intelligemment, whaoo s'adapte.",
    motsCles: ["budget serre", "economie", "gourmand", "bonbons", "gourmandise", "pour qui", "profil"],
  },
  {
    id: "ajouter-article",
    question: "Comment ajouter un article à ma liste de courses ?",
    reponse:
      "Deux façons : tape le nom dans le champ « Article » du formulaire, ou clique sur « 🎙️ Dicter un article » et dis par exemple « deux yaourts à un euro cinquante ».",
    motsCles: ["ajouter", "article", "courses", "liste"],
  },
  {
    id: "dictee-iphone-ipad",
    question: "La dictée ne fonctionne pas sur mon iPhone ou iPad, pourquoi ?",
    reponse:
      "C'est une limitation de Safari/Apple : la dictée intégrée de whaoo n'y est pas disponible (ni sur iPhone ni sur iPad), Apple n'ayant jamais ajouté cette fonction aux navigateurs. Astuce : dans le champ « Article », utilise le petit micro 🎤 du clavier iOS, qui dicte directement dans le champ.",
    motsCles: ["iphone", "ipad", "safari", "apple", "micro", "marche pas", "fonctionne pas", "tablette"],
  },
  {
    id: "phrases-vocales",
    question: "Quelles phrases puis-je dire pour dicter un article ?",
    reponse:
      "Par exemple « deux yaourts à un euro cinquante », « trois pommes », ou juste « pain ». Le lien « Voir des exemples de phrases à dire » sous le bouton micro en donne d'autres.",
    motsCles: ["phrase", "dicter", "voix", "vocal", "exemple"],
  },
  {
    id: "corriger-prix",
    question: "Comment corriger un prix si l'estimation est fausse ?",
    reponse:
      "Tu peux retaper le prix directement dans le champ, ou cliquer sur le petit micro à côté du champ prix et dire le bon montant, par exemple « trois euros cinquante ».",
    motsCles: ["corriger", "prix", "erreur", "faux", "modifier"],
  },
  {
    id: "estimation-prix",
    question: "D'où viennent les prix proposés automatiquement ?",
    reponse:
      "D'abord de la moyenne des prix partagés anonymement par d'autres utilisateurs pour un article similaire (badge « Moyenne communauté »), sinon d'une table de prix moyens indicatifs (badge « Prix indicatif »). Ce ne sont jamais des prix garantis exacts.",
    motsCles: ["prix", "estimation", "estimé", "communaute", "communauté", "indicatif"],
  },
  {
    id: "cagnotte-utilite",
    question: "À quoi sert la cagnotte de l'appli et pourquoi ?",
    reponse:
      "Quand tu dépenses moins que ton budget du mois, whaoo estime l'écart et te le montre comme une « cagnotte » : une façon simple de voir combien tu économises et de te motiver à continuer, ou à te faire plaisir avec.",
    motsCles: ["cagnotte", "économie", "budget", "épargne"],
  },
  {
    id: "budget-mensuel",
    question: "Comment fonctionne le budget mensuel ?",
    reponse:
      "Tu indiques un budget en début de mois (ou en le disant à voix haute : « budget du mois 250 euros »). L'appli additionne ensuite tes achats marqués « acheté » ce mois-ci et te montre où tu en es en temps réel.",
    motsCles: ["budget", "mensuel", "mois", "dépense"],
  },
  {
    id: "sans-compte",
    question: "Puis-je utiliser whaoo sans créer de compte ?",
    reponse:
      "Oui, la démo (bouton « Essayer la démo ») permet de tester toutes les fonctionnalités sans compte. Rien n'est sauvegardé de façon permanente : les données de la démo vivent seulement dans ton navigateur, le temps de la session.",
    motsCles: ["compte", "démo", "sans inscription", "essayer"],
  },
  {
    id: "implications-compte",
    question: "Qu'est-ce que créer un compte implique ?",
    reponse:
      "Un compte permet de sauvegarder tes courses et ton budget d'un mois sur l'autre. On stocke ton email, prénom, tes articles et montants — jamais de données bancaires. Tu peux exporter ou supprimer toutes tes données à tout moment depuis les Paramètres.",
    motsCles: ["compte", "inscription", "données", "implication"],
  },
  {
    id: "securite-donnees",
    question: "Mes données sont-elles en sécurité ?",
    reponse:
      "Oui : elles sont hébergées chez Supabase (base de données sécurisée), l'accès à tes courses et ton budget est protégé par des règles qui empêchent quiconque d'autre de les consulter. Aucune donnée bancaire n'est jamais stockée par whaoo.",
    motsCles: ["sécurité", "données", "protégé", "confidentialité"],
  },
  {
    id: "qui-voit-mes-prix",
    question: "Qui peut voir les prix que je partage avec la communauté ?",
    reponse:
      "Personne ne voit qui a partagé quoi : seule une moyenne anonyme et agrégée est utilisée pour améliorer les estimations de tout le monde. Il n'y a aucun moyen de retrouver un prix jusqu'à la personne qui l'a soumis.",
    motsCles: ["partage", "communauté", "anonyme", "qui voit"],
  },
  {
    id: "supprimer-compte",
    question: "Comment supprimer mon compte et mes données ?",
    reponse:
      "Dans Paramètres → « Supprimer mon compte », tape SUPPRIMER pour confirmer. C'est immédiat et irréversible : profil, budgets et articles sont définitivement effacés.",
    motsCles: ["supprimer", "compte", "effacer", "rgpd"],
  },
  {
    id: "exporter-donnees",
    question: "Comment récupérer une copie de mes données ?",
    reponse:
      "Dans Paramètres → « Exporter mes données », tu télécharges un fichier JSON avec ton profil, tes budgets et tes articles.",
    motsCles: ["exporter", "télécharger", "données", "copie"],
  },
  {
    id: "parrainage",
    question: "Comment fonctionne le parrainage ?",
    reponse:
      "Depuis la page Parrainage, tu as un lien unique à partager. Les personnes qui s'inscrivent avec apparaissent dans ta liste de filleuls.",
    motsCles: ["parrainage", "inviter", "filleul", "lien"],
  },
  {
    id: "impression-pdf",
    question: "Comment imprimer ma liste de courses ou ma facture ?",
    reponse:
      "Deux liens sous le formulaire d'ajout : « Facture PDF du mois » (tes achats déjà faits) et « Liste de courses PDF » (ce qu'il te reste à acheter), tous les deux prêts à imprimer.",
    motsCles: ["imprimer", "pdf", "facture", "liste"],
  },
  {
    id: "avantage-tableur",
    question: "En quoi whaoo est différent d'un simple tableur ?",
    reponse:
      "Pas besoin de taper des formules ni d'ouvrir un fichier : tu dictes tes achats pendant que tu fais tes courses, le budget se calcule tout seul, et l'appli te dit clairement où tu en es — le tout depuis ton téléphone.",
    motsCles: ["tableur", "excel", "différence", "avantage", "pourquoi"],
  },
  {
    id: "contacter-fondateur",
    question: "Comment contacter le fondateur de whaoo ?",
    reponse: "Par email à contact@medy.site — n'hésite pas à écrire directement.",
    motsCles: ["contacter", "fondateur", "email", "medy"],
  },
  {
    id: "suggestion",
    question: "Comment proposer une suggestion ou signaler un bug ?",
    reponse:
      "Utilise le bouton « ✉️ Envoyer une suggestion » ci-dessous : ça ouvre ton application email avec le sujet déjà rempli, envoyé directement au fondateur. Toutes les idées sont les bienvenues !",
    motsCles: ["suggestion", "idée", "bug", "problème", "améliorer"],
  },
  {
    id: "cagnotte-soutien",
    question: "La cagnotte de soutien (don) est-elle obligatoire ? Est-ce sécurisé ?",
    reponse:
      "Non, c'est entièrement facultatif, sans aucune obligation. Le paiement passe par Lydia, une plateforme bancaire française sécurisée : whaoo ne voit ni ne conserve aucune donnée bancaire.",
    motsCles: ["don", "cagnotte", "soutien", "lydia", "obligatoire", "paiement"],
  },
  {
    id: "recette",
    question: "Puis-je ajouter plusieurs ingrédients d'un coup depuis une recette ?",
    reponse:
      "Oui, avec « + Ajouter depuis une recette » : colle une liste (une ligne par ingrédient), whaoo l'analyse et propose même un prix pour chaque ingrédient reconnu.",
    motsCles: ["recette", "ingrédient", "liste", "coller"],
  },
  {
    id: "installer-pwa",
    question: "Comment installer whaoo comme application sur mon téléphone ?",
    reponse:
      "Depuis la page d'accueil, utilise le bouton d'installation (ou le menu de ton navigateur → « Ajouter à l'écran d'accueil »). Pas besoin de passer par l'App Store ou le Play Store.",
    motsCles: ["installer", "application", "pwa", "téléphone", "écran d'accueil"],
  },
];

/**
 * Cherche la question de la FAQ la plus pertinente pour un texte donné
 * (tapé ou dicté), par comptage de mots-clés en commun. Retourne null si
 * rien ne correspond suffisamment.
 */
export function chercherFaq(texte: string): QuestionFaq | null {
  const mots = texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  let meilleure: QuestionFaq | null = null;
  let meilleurScore = 0;

  for (const item of FAQ) {
    const cible = [item.question, ...item.motsCles]
      .join(" ")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");

    let score = 0;
    for (const mot of mots) {
      if (mot.length > 2 && cible.includes(mot)) score += 1;
    }
    if (score > meilleurScore) {
      meilleurScore = score;
      meilleure = item;
    }
  }

  return meilleurScore > 0 ? meilleure : null;
}
