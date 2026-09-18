export type LangPitch = "fr" | "en" | "es";

export const LANGUES_PITCH: { code: LangPitch; label: string }[] = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

export type MockupItem = {
  image: string;
  titre: string;
  texte: string;
};

export type ContenuPitch = {
  nomBouton: string;
  tagline: string;
  intro: string;
  ctaDemo: string;
  ctaContact: string;
  problemeTitre: string;
  problemeTexte: string;
  solutionTitre: string;
  solutionTexte: string;
  mockups: MockupItem[];
  pourquoiTitre: string;
  pourquoiPoints: string[];
  modeleTitre: string;
  modeleTexte: string;
  feuilleTitre: string;
  feuillePoints: string[];
  contactTitre: string;
  contactTexte: string;
};

export const PITCH_CONTENT: Record<LangPitch, ContenuPitch> = {
  fr: {
    nomBouton: "whaoo",
    tagline: "L'appli de courses qui t'écoute — et qui tient ton budget pour toi.",
    intro:
      "whaoo transforme la corvée des courses en une conversation : tu parles, l'appli ajoute, estime le prix et met à jour ton budget en temps réel. Sans compte pour essayer, sans jargon, sans tableur.",
    ctaDemo: "Essayer la démo",
    ctaContact: "Nous contacter",
    problemeTitre: "Le problème",
    problemeTexte:
      "Faire ses courses en gardant un œil sur le budget est une charge mentale permanente : additionner de tête, se souvenir de tout, puis découvrir le total à la caisse. Les outils existants sont soit des listes simples sans budget, soit des applis bancaires sans lien avec le panier réel.",
    solutionTitre: "La solution",
    solutionTexte:
      "whaoo réunit liste de courses, dictée vocale et suivi budgétaire dans une seule appli mobile-first. Chaque article dicté ou tapé reçoit une estimation de prix automatique, issue d'une base communautaire anonyme, et le budget du mois se met à jour sans aucune saisie manuelle.",
    mockups: [
      {
        image: "/pitch/mockup-budget.png",
        titre: "Budget en temps réel",
        texte: "Dépenses, reste à dépenser et cagnotte d'économies visibles en un coup d'œil.",
      },
      {
        image: "/pitch/mockup-ajout.png",
        titre: "Prix estimé automatiquement",
        texte: "Tape ou dicte un article : le prix indicatif apparaît sans rien chercher.",
      },
      {
        image: "/pitch/mockup-liste.png",
        titre: "Liste toujours à jour",
        texte: "Historique mensuel et suivi des achats, prêts à consulter à tout moment.",
      },
      {
        image: "/pitch/mockup-faq.png",
        titre: "Aide intégrée",
        texte: "Un assistant qui répond aux questions des utilisateurs, à la voix ou à l'écrit.",
      },
    ],
    pourquoiTitre: "Pourquoi maintenant",
    pourquoiPoints: [
      "Inflation alimentaire durable : le contrôle du budget courses est redevenu une priorité pour les foyers.",
      "Adoption massive des interfaces vocales, encore absente des applis de courses grand public.",
      "Aucun acteur ne combine liste vocale, budget en temps réel et prix communautaires anonymes.",
      "Techniquement prêt : PWA installable en un lien, sans passer par les stores, sur Android et iPhone.",
    ],
    modeleTitre: "Modèle économique",
    modeleTexte:
      "Gratuit et sans compte pour découvrir l'appli. Un don volontaire soutient déjà le développement. À terme : un palier premium (historique illimité, partage familial, export avancé) et des partenariats ciblés avec des enseignes ou marques alimentaires locales, une fois une audience mesurable atteinte.",
    feuilleTitre: "Feuille de route",
    feuillePoints: [
      "Phase 1 — Tests fermés avec un premier cercle d'utilisateurs, validation du cœur de l'appli.",
      "Phase 2 — Bêta élargie, mesure de la rétention réelle sur plusieurs semaines.",
      "Phase 3 — Lancement public, communication multicanale et premiers partenariats.",
    ],
    contactTitre: "Discutons",
    contactTexte:
      "Investisseur, partenaire ou simplement curieux·se de tester whaoo avec ton groupe ? Écris-nous.",
  },
  en: {
    nomBouton: "whaoo",
    tagline: "The grocery app that listens — and keeps your budget for you.",
    intro:
      "whaoo turns grocery shopping into a conversation: you speak, the app adds the item, estimates its price, and updates your budget in real time. No account needed to try it, no jargon, no spreadsheet.",
    ctaDemo: "Try the demo",
    ctaContact: "Get in touch",
    problemeTitre: "The problem",
    problemeTexte:
      "Grocery shopping while keeping an eye on the budget is a constant mental load: adding up prices in your head, remembering everything, then facing the real total at checkout. Existing tools are either plain lists with no budget tracking, or banking apps disconnected from the actual cart.",
    solutionTitre: "The solution",
    solutionTexte:
      "whaoo combines a shopping list, voice dictation, and budget tracking in a single mobile-first app. Every item, spoken or typed, gets an automatic price estimate from an anonymous community database, and the monthly budget updates itself with zero manual entry.",
    mockups: [
      {
        image: "/pitch/mockup-budget.png",
        titre: "Real-time budget",
        texte: "Spending, remaining balance, and savings pot visible at a glance.",
      },
      {
        image: "/pitch/mockup-ajout.png",
        titre: "Automatic price estimate",
        texte: "Type or dictate an item: an indicative price appears instantly.",
      },
      {
        image: "/pitch/mockup-liste.png",
        titre: "Always up to date",
        texte: "Monthly history and purchase tracking, ready whenever you need it.",
      },
      {
        image: "/pitch/mockup-faq.png",
        titre: "Built-in help",
        texte: "An assistant that answers user questions, by voice or by text.",
      },
    ],
    pourquoiTitre: "Why now",
    pourquoiPoints: [
      "Persistent food inflation has made grocery budget control a household priority again.",
      "Mass adoption of voice interfaces, still missing from mainstream grocery apps.",
      "No competitor combines voice-first lists, real-time budgeting, and anonymous community pricing.",
      "Technically ready: an installable PWA via a single link, no app store, on both Android and iPhone.",
    ],
    modeleTitre: "Business model",
    modeleTexte:
      "Free and account-free to try. A voluntary donation already supports development today. Long term: a premium tier (unlimited history, family sharing, advanced export) and targeted partnerships with local grocery chains or food brands once a measurable audience is reached.",
    feuilleTitre: "Roadmap",
    feuillePoints: [
      "Phase 1 — Closed testing with a first circle of users, validating the core experience.",
      "Phase 2 — Expanded beta, measuring real retention over several weeks.",
      "Phase 3 — Public launch, multichannel outreach and first partnerships.",
    ],
    contactTitre: "Let's talk",
    contactTexte:
      "Investor, partner, or just curious to try whaoo with your group? Reach out.",
  },
  es: {
    nomBouton: "whaoo",
    tagline: "La app de la compra que te escucha — y lleva tu presupuesto por ti.",
    intro:
      "whaoo convierte la compra semanal en una conversación: hablas, la app añade el artículo, estima su precio y actualiza tu presupuesto en tiempo real. Sin necesidad de cuenta para probarla, sin jerga, sin hojas de cálculo.",
    ctaDemo: "Probar la demo",
    ctaContact: "Contáctanos",
    problemeTitre: "El problema",
    problemeTexte:
      "Hacer la compra controlando el presupuesto es una carga mental constante: sumar de cabeza, recordarlo todo y descubrir el total en la caja. Las herramientas actuales son listas simples sin presupuesto, o apps bancarias desconectadas de la cesta real.",
    solutionTitre: "La solución",
    solutionTexte:
      "whaoo une lista de la compra, dictado por voz y control de presupuesto en una sola app mobile-first. Cada artículo, hablado o escrito, recibe una estimación de precio automática a partir de una base comunitaria anónima, y el presupuesto mensual se actualiza solo, sin introducir nada a mano.",
    mockups: [
      {
        image: "/pitch/mockup-budget.png",
        titre: "Presupuesto en tiempo real",
        texte: "Gasto, saldo restante y hucha de ahorro, visibles de un vistazo.",
      },
      {
        image: "/pitch/mockup-ajout.png",
        titre: "Precio estimado automáticamente",
        texte: "Escribe o dicta un artículo: el precio orientativo aparece al instante.",
      },
      {
        image: "/pitch/mockup-liste.png",
        titre: "Siempre al día",
        texte: "Historial mensual y seguimiento de compras, listos cuando los necesites.",
      },
      {
        image: "/pitch/mockup-faq.png",
        titre: "Ayuda integrada",
        texte: "Un asistente que responde a las preguntas de los usuarios, por voz o por texto.",
      },
    ],
    pourquoiTitre: "Por qué ahora",
    pourquoiPoints: [
      "La inflación alimentaria persistente ha vuelto a poner el control del presupuesto en el centro.",
      "Adopción masiva de interfaces de voz, todavía ausente en las apps de compra habituales.",
      "Ningún competidor combina lista por voz, presupuesto en tiempo real y precios comunitarios anónimos.",
      "Técnicamente lista: una PWA instalable con un solo enlace, sin tiendas de apps, en Android y iPhone.",
    ],
    modeleTitre: "Modelo de negocio",
    modeleTexte:
      "Gratis y sin cuenta para probarla. Una donación voluntaria ya apoya el desarrollo hoy. A largo plazo: un nivel premium (historial ilimitado, uso compartido familiar, exportación avanzada) y colaboraciones con cadenas o marcas locales una vez alcanzada una audiencia medible.",
    feuilleTitre: "Hoja de ruta",
    feuillePoints: [
      "Fase 1 — Pruebas cerradas con un primer círculo de usuarios, validando el núcleo de la app.",
      "Fase 2 — Beta ampliada, midiendo la retención real durante varias semanas.",
      "Fase 3 — Lanzamiento público, comunicación multicanal y primeras colaboraciones.",
    ],
    contactTitre: "Hablemos",
    contactTexte:
      "¿Inversor, socio, o simplemente curioso por probar whaoo con tu grupo? Escríbenos.",
  },
};
