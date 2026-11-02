// de:Deutsche Übersetzung — Werte natürlich übersetzt, Schlüsselform identisch mit en.
// Vertrag: Schlüsselform muss mit en exakt übereinstimmen (tests/seo.test.ts tiefvergleichend), Werte müssen de sein.
const de = {
  brand: "SubtitleKit",
  tagline: "Jede Untertitel-Korrektur passiert in Ihrem Browser.",
  metaDesc: "Kostenlose Untertitel-Tools: SRT ↔ VTT-Konvertierung, Zeitverschiebung und -skalierung, zweisprachiges Zusammenführen, Timing-Reparatur und Textbereinigung. Alles in Ihrem Browser — Ihre Dateien verlassen niemals Ihr Gerät.",

  nav: {
    tools: "Alle Tools",
    categories: "Kategorien",
    about: "Über uns",
    menu: "Menü",
    language: "Sprache",
  },

  home: {
    heroTitle: "Untertitel-Dateien in Sekunden repariert — ohne Upload, ohne Konto",
    heroSub: "SubtitleKit ist ein Set von Untertitel-Tools für Videomacher: SRT und WebVTT konvertieren, Timelines verschieben oder skalieren, zweisprachige Spuren zusammenführen, kaputtes Timing reparieren und Text im Batch säubern. Alles im Browser — schnell, kostenlos, nichts wird versendet.",
    browseAll: "Alle Tools ansehen",
    categoriesTitle: "Kategorien",
    featuredTitle: "Beliebte Tools",
    trustLocal: "Dateien bleiben auf Ihrem Gerät",
    trustFree: "Kostenlos, ohne Konto",
    trustFast: "Sofort, funktioniert offline",
    rotating: [
      "SRT zu VTT und zurück — Tags, Einstellungen und Timing bleiben erhalten",
      "Untertitel aus dem Takt? Verschieben Sie jeden Cue um Sekunden oder Millisekunden",
      "25-fps-PAL-Kopie oder 23.976-Master? Timeline mit einem Klick skalieren",
      "Zwei Spuren zu einer zweisprachigen Untertiteldatei stapeln, zeitsynchron",
    ],
    statsLabels: { tools: "Tools", languages: "Sprachen", uploads: "Uploads", accounts: "Konten" },
    eyebrow: "Für immer kostenlos",
    heroCtaSecondary: "So funktioniert es",
    statsTools: "{n} Tools",
    statsLanguages: "{n} Sprachen",
    statsUploads: "0 Uploads",
    statsAccounts: "0 Konten",
    categoriesSub: "Fünf Untertitel-Tools, alle auf Ihrem Gerät.",
    popularSub: "Die Tools, die am häufigsten geöffnet werden.",
    privacyTitle: "Ihre Untertitel verlassen niemals Ihr Gerät.",
    privacySub:
      "Es gibt keinen Upload-Schritt. Die Tools sind JavaScript, das in Ihrem Browser läuft — das ist kein Versprechen in einer Datenschutzerklärung, sondern die Art, wie sie gebaut sind.",
    privacyPoint1T: "Lokale Verarbeitung",
    privacyPoint1D:
      "Dateien werden mit der eigenen File-API des Browsers gelesen und im Arbeitsspeicher verarbeitet. Nichts wird übertragen — nirgendwohin.",
    privacyPoint2T: "Keine Konten",
    privacyPoint2D: "Keine Anmeldung, keine E-Mail, kein gespeicherter Verlauf. Tool öffnen und loslegen.",
    privacyPoint3T: "Ehrlich von Grund auf",
    privacyPoint3D:
      "Wenn etwas im Browser wirklich nicht geht, sagen wir das — statt es so zu tun, als würde es funktionieren.",
    privacyLink: "Die vollständigen Datenschutzhinweise lesen",
    endTitle: "Wählen Sie ein Tool. Es funktioniert einfach.",
    endSub: "Fünfzehn Sprachen, null Uploads, nichts zu installieren.",
  },

  tools: {
    title: "Alle Tools",
    subtitle: "Durchsuchen Sie {count} kostenlose Browser-Tools. Kein Upload, keine Anmeldung.",
    filterPlaceholder: "Tools suchen…",
    count: "{count} Tools",
    empty: "Keine Tools passen zu „{query}“.",
  },

  categories: {
    pdf: { name: "PDF", desc: "PDF-Dateien zusammenfügen, teilen, konvertieren und bearbeiten — ohne sie irgendwo hochzuladen." },
    image: { name: "Bilder", desc: "Bilder direkt im Browser komprimieren, skalieren, zuschneiden und konvertieren." },
    text: { name: "Text", desc: "Text zählen, bereinigen, sortieren und umwandeln — sofort bei jeder Eingabe." },
    developer: { name: "Entwickler", desc: "Formatierer, Encoder, Decoder und Generatoren für die tägliche Entwicklerarbeit." },
    seo: { name: "SEO", desc: "Meta-Tags, Schema-Markup, SERP-Vorschau und weitere On-Page-SEO-Helfer." },
    security: { name: "Sicherheit", desc: "Passwörter, Hashes und Lookups — auf Ihrem Gerät erzeugt und geprüft." },
    utility: { name: "Untertitel", desc: "Konvertieren, verschieben, zusammenführen, reparieren und bereinigen Sie Untertiteldateien — SRT und VTT, ohne sie irgendwohin hochzuladen." },
  },

  tool: {
    howTo: "So verwenden Sie es",
    faq: "Häufige Fragen",
    related: "Verwandte Tools",
    privacyNote:
      "Dieses Tool läuft vollständig in Ihrem Browser. Ihre Daten verlassen Ihr Gerät nie — sie werden auf keinen Server hochgeladen.",
    inCategory: "Mehr in {category}",
    backToCategory: "Alle {category}-Tools",
  },

  common: {
    copy: "Kopieren",
    copied: "Kopiert",
    download: "Herunterladen",
    reset: "Zurücksetzen",
    swap: "Tauschen",
    clear: "Leeren",
    error: "Etwas ist schiefgelaufen. Prüfen Sie Ihre Eingabe und versuchen Sie es erneut.",
    input: "Eingabe",
    output: "Ergebnis",
    settings: "Optionen",
    dropFiles: "Dateien hierher ziehen oder klicken zum Auswählen",
    dropFile: "Datei hierher ziehen oder klicken zum Auswählen",
    processing: "Verarbeitung…",
    fileSize: "Größe",
    sample: "Beispiel ausprobieren",
    uppercase: "GROSSBUCHSTABEN",
  },

  unit: {
    from: "Von",
    to: "Nach",
    amount: "Menge",
    result: "Ergebnis",
    common: "Häufige Umrechnungen",
    formula: "Formel",
    allUnits: "Alle Einheiten",
  },

  text: {
    stats: {
      words: "Wörter",
      characters: "Zeichen",
      charsNoSpaces: "Ohne Leerzeichen",
      sentences: "Sätze",
      paragraphs: "Absätze",
      lines: "Zeilen",
      readingTime: "Lesezeit",
      readingMinutes: "{n} Min. Lesezeit",
    },
  },

  footer: {
    line: "Kostenlose Untertitel-Tools. Nichts, was Sie hier tun, verlässt Ihr Gerät.",
    privacy: "Datenschutz",
    terms: "Nutzungsbedingungen",
    about: "Über uns",
    badges: "Badges",
    language: "Sprache",
  },

  badge: {
    title: "SubtitleKit-Badges",
    desc: "Setzen Sie ein SubtitleKit-Badge auf Ihre Website, Ihr README oder Ihre Doku. Es verlinkt hierher und zeigt, dass die Untertitel-Tools dahinter komplett im Browser laufen.",
    voluntary: "Das Einbetten ist völlig freiwillig — nehmen Sie ein Badge, wenn Ihnen das Projekt gefällt. Keine Erlaubnis nötig.",
    md: "Markdown (README)",
    html: "HTML (Website)",
    thanks: "Danke für die Weiterempfehlung — jede Einbettung hilft mehr Menschen, Tools zu entdecken, die ihre Dateien respektieren.",
  },

    embed: {
    title: "Dieses Tool einbetten",
    desc: "Binden Sie dieses Tool mit einer Zeile in Ihre Website ein — es läuft im Browser des Besuchers.",
  },

    mcp: {
    title: "MCP-Server — KI-zugängliche Tools",
    desc1: "SubtitleKit liefert einen MCP-Server (Model Context Protocol): KI-Assistenten wie Claude oder Cursor konvertieren, verschieben, führen zusammen, reparieren und bereinigen dieselben Untertiteldateien wie diese Website — dieselbe getestete Logik, keine Neuimplementierung.",
    desc2: "Die Tools führen die reinen Funktionen der Website selbst aus: SRT/VTT-Parsing, Zeitberechnung, Textbereinigung. Untertitel gehen als Text hinein und heraus; die Ausführung erfolgt über npx auf dem Rechner des KI-Clients — nichts wird an unsere Server gesendet.",
    toolsTitle: "Ausführbare Tools ({n})",
    requiresNode: "Benötigt Node.js 18+. Der Server läuft lokal über stdio; nur die von Ihnen aufgerufenen Tools werden auf Ihrer Maschine berechnet.",
    privacy: "Benötigt Node.js 18+. Der Server läuft lokal über stdio; nur die von Ihnen aufgerufenen Tools werden auf Ihrer Maschine berechnet.",
  },

    notFound: {
    title: "Seite nicht gefunden",
    body: "Das gesuchte Tool existiert nicht. Sehen Sie sich stattdessen alle Tools an.",
    home: "Zur Startseite",
  },
};

export default de;
