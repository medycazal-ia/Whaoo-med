export type QuestionFaq = {
  id: string;
  question: string;
  reponse: string;
  motsCles: string[];
};

// 26 questions couvrant : usage de l'appli, scanner de ticket, écoute
// vocale continue, import de document par photo, sécurité, implications
// d'avoir un compte, bénéfices apportés, la cagnotte, contacter le
// fondateur, suggestions. Les mots-clés servent à la recherche simple
// (texte tapé ou dicté), sans dépendre d'un service externe.
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
      "Trois façons : tape le nom dans le champ « Article » du formulaire, clique sur « 🎙️ Parlez-moi » et dis par exemple « deux yaourts à un euro cinquante », ou scanne directement un ticket de caisse. En mode écoute continue, whaoo peut aussi ajouter automatiquement plusieurs articles à la suite pendant que tu parles, sans avoir à ré-appuyer sur le bouton entre chaque article.",
    motsCles: ["ajouter", "article", "courses", "liste", "parlez moi"],
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
      "Par exemple « deux yaourts à un euro cinquante », « trois pommes », ou juste « pain ». Tu peux aussi citer plusieurs articles dans une seule phrase, comme « du lait, des œufs et du pain » : whaoo les détecte et les ajoute un par un. Le lien « Voir des exemples de phrases à dire » sous le bouton micro en donne d'autres.",
    motsCles: ["phrase", "dicter", "voix", "vocal", "exemple", "plusieurs articles"],
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
      "La cagnotte, c'est simplement ton budget du mois auquel on retire au fur et à mesure chaque achat marqué « acheté ». Par exemple, avec 200 € de budget, dès que tu achètes pour 59 €, ta cagnotte affiche 141 € — quel que soit le jour du mois où cet achat a lieu. Elle te permet de voir en un coup d'œil ce qu'il te reste à dépenser, et à partir de certains paliers (15 €, 50 €, 150 €), whaoo te propose une idée de petit plaisir à t'offrir avec ce qu'il te reste.",
    motsCles: ["cagnotte", "économie", "budget", "épargne", "reste", "solde"],
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
    question: "Puis-je ajouter plusieurs ingrédients d'un coup depuis une recette ou un document ?",
    reponse:
      "Oui, avec « + Ajouter depuis une recette » : colle un texte (recette, menu, liste) ou importe directement une photo du document. whaoo l'analyse avec une IA pour créer une ligne par article — y compris des articles non-alimentaires — et propose un prix pour chaque article reconnu. Il sépare aussi automatiquement les phrases du type « potage ou carotte » ou « miel/fromage/yaourt » en plusieurs articles distincts, sans créer de ligne inutile pour des mentions comme « autres alternatives ».",
    motsCles: ["recette", "ingrédient", "liste", "coller", "photo", "ia", "non alimentaire", "document"],
  },
  {
    id: "installer-pwa",
    question: "Comment installer whaoo comme application sur mon téléphone ?",
    reponse:
      "Depuis la page d'accueil, utilise le bouton d'installation (ou le menu de ton navigateur → « Ajouter à l'écran d'accueil »). Pas besoin de passer par l'App Store ou le Play Store.",
    motsCles: ["installer", "application", "pwa", "téléphone", "écran d'accueil"],
  },
  {
    id: "scanner-ticket",
    question: "Comment scanner un ticket de caisse ?",
    reponse:
      "Clique sur « 📷 Scanner un ticket », prends-le en photo ou importe une image : whaoo lit automatiquement chaque article et son prix grâce à une IA de lecture très précise, puis te propose de les ajouter. Tu peux cocher « Ajouter aussi ces articles à mon budget du mois (déjà achetés) » pour qu'ils soient comptés immédiatement dans tes dépenses de ce mois, sans avoir à repasser par « Marquer acheté ».",
    motsCles: ["scanner", "ticket", "caisse", "photo", "ocr", "reconnaissance", "budget", "achete"],
  },
  {
    id: "parlez-moi-continu",
    question: "Comment fonctionne le bouton « Parlez-moi » en écoute continue ?",
    reponse:
      "Appuie une fois sur « 🎙️ Parlez-moi » : whaoo t'écoute en continu, sans que tu aies besoin de ré-appuyer entre chaque article. Dis par exemple « du lait, deux yaourts à un euro cinquante, et du pain » : whaoo reconnaît et ajoute chaque article automatiquement, et t'affiche un petit message de confirmation avec un bouton pour annuler si besoin. L'écoute continue jusqu'à ce que tu appuies à nouveau sur le bouton pour l'arrêter.",
    motsCles: ["parlez moi", "ecoute continue", "dicter", "vocal", "automatique", "micro", "permanence"],
  },
  {
    id: "import-document-photo",
    question: "Puis-je importer une liste ou un document par photo ?",
    reponse:
      "Oui : depuis « + Ajouter depuis une recette », un bouton « 📷 Prendre/importer une photo » te permet de photographier ou d'importer n'importe quel document (menu, liste manuscrite, recette, ticket...). whaoo reconnaît aussi les articles non-alimentaires, sépare intelligemment les phrases comme « potage ou carotte » en plusieurs articles distincts, et ignore les mentions génériques comme « autres solutions » ou « autres alternatives ».",
    motsCles: ["photo", "document", "importer", "recette", "menu", "non alimentaire", "scan"],
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
