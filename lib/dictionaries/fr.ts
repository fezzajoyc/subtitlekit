import type { Dictionary } from "../i18n";

// Français (fr) — vouvoiement constant, sans anglicismes évitables.
// Contrat : forme des clés identique à en (tests/seo.test.ts), valeurs en français.
const fr: Dictionary = {
  brand: "SubtitleKit",
  tagline: "Chaque correction de sous-titres se fait dans votre navigateur.",
  metaDesc: "Outils de sous-titres gratuits : conversion SRT ↔ VTT, décalage et mise à l'échelle de la timeline, fusion bilingue, réparation du timing et nettoyage du texte. Tout dans votre navigateur — vos fichiers ne quittent jamais votre appareil.",

  nav: {
    tools: "Tous les outils",
    categories: "Catégories",
    about: "À propos",
    menu: "Menu",
    language: "Langue",
  },

  home: {
    heroTitle: "Vos sous-titres réparés en quelques secondes — sans envoi, sans compte",
    heroSub: "SubtitleKit est une panoplie d'outils de sous-titres pour créateurs vidéo : convertissez entre SRT et WebVTT, décalez ou mettez à l'échelle les timelines, fusionnez deux pistes bilingues, réparez un timing cassé et nettoyez le texte par lots. Tout dans votre navigateur — rapide, gratuit, rien n'est envoyé nulle part.",
    browseAll: "Voir tous les outils",
    pinned: "Épinglés",
    pin: "Épingler",
    unpin: "Désépingler",
    popular: "Populaires en ce moment",
    categoriesTitle: "Catégories",
    featuredTitle: "Outils populaires",
    trustLocal: "Vos fichiers restent sur votre appareil",
    trustFree: "Gratuit, sans compte",
    trustFast: "Instantané, fonctionne hors ligne",
    rotating: [
      "Convertissez SRT vers VTT et inversement — balises, réglages et timing préservés",
      "Sous-titres désynchronisés ? Décalez tous les sous-titres de secondes ou de millisecondes",
      "Copie PAL 25 fps ou master 23.976 ? Remettez la timeline à l'échelle en un clic",
      "Superposez deux pistes en un fichier bilingue, alignées dans le temps",
    ],
    statsLabels: { tools: "outils", languages: "langues", uploads: "envois", accounts: "comptes" },
    eyebrow: "Gratuit, pour toujours",
    heroCtaSecondary: "Comment ça marche",
    statsTools: "{n} outils",
    statsLanguages: "{n} langues",
    statsUploads: "0 envoi",
    statsAccounts: "0 compte",
    categoriesSub: "Cinq outils de sous-titres, tous sur votre appareil.",
    popularSub: "Les outils que l'on ouvre le plus.",
    privacyTitle: "Vos sous-titres ne quittent jamais votre appareil.",
    privacySub:
      "Il n'y a aucune étape d'envoi. Les outils sont du JavaScript exécuté dans votre navigateur — ce n'est pas une promesse de politique de confidentialité, c'est ainsi qu'ils sont conçus.",
    privacyPoint1T: "Traitement local",
    privacyPoint1D:
      "Les fichiers sont lus avec la File API du navigateur et traités en mémoire. Rien n'est transmis, nulle part.",
    privacyPoint2T: "Aucun compte",
    privacyPoint2D: "Pas d'inscription, pas d'e-mail, pas d'historique conservé. Ouvrez un outil et utilisez-le.",
    privacyPoint3T: "Honnête par conception",
    privacyPoint3D:
      "Si quelque chose ne peut réellement pas être fait dans le navigateur, nous le disons au lieu de le faire semblant.",
    privacyLink: "Lire la note de confidentialité complète",
    endTitle: "Choisissez un outil. Il fonctionne, tout simplement.",
    endSub: "Quinze langues, zéro envoi, rien à installer.",
  },

  tools: {
    title: "Tous les outils",
    subtitle: "Cherchez parmi {count} outils gratuits dans le navigateur. Sans envoi, sans inscription.",
    filterPlaceholder: "Rechercher un outil…",
    count: "{count} outils",
    empty: "Aucun outil ne correspond à « {query} ».",
  },

  categories: {
    pdf: { name: "PDF", desc: "Fusionnez, divisez, convertissez et modifiez des fichiers PDF sans les envoyer nulle part." },
    image: { name: "Image", desc: "Compressez, redimensionnez, recadrez et convertissez des images directement dans votre navigateur." },
    text: { name: "Texte", desc: "Comptez, nettoyez, triez et transformez du texte instantanément, pendant la saisie." },
    developer: { name: "Développement", desc: "Formateurs, encodeurs, décodeurs et générateurs pour le quotidien du développeur." },
    seo: { name: "SEO", desc: "Balises meta, données structurées, aperçu SERP et autres assistants de référencement." },
    security: { name: "Sécurité", desc: "Mots de passe, empreintes et vérifications — générés et contrôlés sur votre appareil." },
    utility: { name: "Sous-titres", desc: "Convertissez, décalez, fusionnez, réparez et nettoyez vos fichiers de sous-titres — SRT et VTT, sans les envoyer nulle part." },
  },

  tool: {
    howTo: "Mode d'emploi",
    faq: "Questions fréquentes",
    related: "Outils associés",
    nextStep: "Étapes suivantes",
    copyLink: "Copier le lien",
    privacyNote:
      "Cet outil s'exécute entièrement dans votre navigateur. Vos données ne quittent jamais votre appareil — elles ne sont envoyées à aucun serveur.",
    inCategory: "Plus d'outils dans {category}",
    backToCategory: "Tous les outils {category}",
  },

  common: {
    openTool: "Ouvrir l'outil",
    copy: "Copier",
    copied: "Copié",
    download: "Télécharger",
    reset: "Réinitialiser",
    swap: "Inverser",
    clear: "Effacer",
    error: "Une erreur est survenue. Vérifiez votre saisie et réessayez.",
    input: "Entrée",
    output: "Résultat",
    settings: "Options",
    dropFiles: "Déposez des fichiers ici ou cliquez pour choisir",
    dropFile: "Déposez un fichier ici ou cliquez pour choisir",
    processing: "Traitement…",
    fileSize: "Taille",
    sample: "Essayer un exemple",
    uppercase: "MAJUSCULES",
  },

  unit: {
    from: "De",
    to: "Vers",
    amount: "Quantité",
    result: "Résultat",
    common: "Conversions courantes",
    formula: "Formule",
    allUnits: "Toutes les unités",
  },

  text: {
    stats: {
      words: "Mots",
      characters: "Caractères",
      charsNoSpaces: "Sans espaces",
      sentences: "Phrases",
      paragraphs: "Paragraphes",
      lines: "Lignes",
      readingTime: "Temps de lecture",
      readingMinutes: "{n} min de lecture",
    },
  },

  footer: {
    line: "Outils de sous-titres gratuits. Rien de ce que vous faites ici ne quitte votre appareil.",
    privacy: "Confidentialité",
    terms: "Conditions",
    about: "À propos",
    badges: "Badges",
    language: "Langue",
  },

  badge: {
    title: "Badges SubtitleKit",
    desc: "Affichez un badge SubtitleKit sur votre site, votre README ou votre documentation. Il renvoie ici et signale que les outils de sous-titres fonctionnent entièrement dans le navigateur.",
    voluntary: "L'intégration est entièrement volontaire — prenez un badge si le projet vous plaît. Aucune autorisation nécessaire.",
    md: "Markdown (README)",
    html: "HTML (site web)",
    thanks: "Merci de faire passer le mot — chaque intégration aide plus de personnes à découvrir des outils qui respectent leurs fichiers.",
  },

  embed: {
    title: "Intégrer cet outil",
    desc: "Ajoutez cet outil à votre site en une ligne — il s'exécute dans le navigateur du visiteur.",
  },

    mcp: {
    title: "Serveur MCP — outils accessibles aux IA",
    desc1: "SubtitleKit embarque un serveur MCP (Model Context Protocol) : les assistants IA comme Claude ou Cursor peuvent convertir, décaler, fusionner, réparer et nettoyer les mêmes fichiers de sous-titres que ce site — même logique testée, aucune réimplémentation.",
    desc2: "Les outils exécutent les fonctions pures du site lui-même : analyse SRT/VTT, calculs temporels, nettoyage de texte. Les sous-titres entrent et sortent en texte ; l'exécution se fait sur la machine du client IA via npx — rien n'est envoyé à nos serveurs.",
    toolsTitle: "Outils exécutables ({n})",
    requiresNode: "Nécessite Node.js 18+. Le serveur tourne localement en stdio ; seuls les appels que vous lancez sont calculés sur votre machine.",
    privacy: "Nécessite Node.js 18+. Le serveur tourne localement en stdio ; seuls les appels que vous lancez sont calculés sur votre machine.",
  },

    notFound: {
    title: "Page introuvable",
    body: "L'outil que vous cherchez n'existe pas. Parcourez plutôt tous les outils.",
    home: "Retour à l'accueil",
  },
};

export default fr;
