import type { Dictionary } from "../i18n";

const pt: Dictionary = {
  brand: "SubtitleKit",
  tagline: "Todo conserto de legenda acontece no seu navegador.",
  metaDesc: "Ferramentas de legenda gratuitas: conversão SRT ↔ VTT, deslocamento e reescala da linha do tempo, mesclagem bilíngue, reparo de tempos e limpeza de texto. Tudo no seu navegador — seus arquivos nunca saem do seu aparelho.",

  nav: {
    tools: "Todas as ferramentas",
    categories: "Categorias",
    about: "Sobre",
    menu: "Menu",
    language: "Idioma",
  },

  home: {
    heroTitle: "Arquivos de legenda consertados em segundos — sem upload, sem cadastro",
    heroSub: "SubtitleKit é um conjunto de ferramentas de legenda para criadores de vídeo: converta entre SRT e WebVTT, desloque ou reescale linhas do tempo, mescle trilhas bilíngues, conserte tempos quebrados e limpe texto em lote. Tudo no seu navegador — rápido, grátis, nada enviado a ninguém.",
    browseAll: "Ver todas as ferramentas",
    pinned: "Fixados",
    pin: "Fixar no topo",
    unpin: "Remover dos fixados",
    popular: "Populares agora",
    categoriesTitle: "Categorias",
    featuredTitle: "Ferramentas populares",
    trustLocal: "Seus arquivos ficam no seu dispositivo",
    trustFree: "Grátis, sem conta",
    trustFast: "Instantâneo, funciona offline",
    rotating: [
      "Converta SRT em VTT e vice-versa — tags, configurações e tempos preservados",
      "Legenda fora de sincronia? Desloque todos os cues por segundos ou milissegundos",
      "Cópia PAL de 25 fps ou master de 23.976? Reescale a linha do tempo num clique",
      "Empilhe duas trilhas num arquivo bilíngue, alinhadas pelo tempo",
    ],
    statsLabels: { tools: "ferramentas", languages: "idiomas", uploads: "envios", accounts: "contas" },
    eyebrow: "Grátis sempre",
    heroCtaSecondary: "Como funciona",
    statsTools: "{n} ferramentas",
    statsLanguages: "{n} idiomas",
    statsUploads: "0 envios",
    statsAccounts: "0 contas",
    categoriesSub: "Cinco ferramentas de legenda, todas rodando no seu aparelho.",
    popularSub: "As ferramentas mais usadas.",
    privacyTitle: "Suas legendas nunca saem do seu aparelho.",
    privacySub: "Não existe a etapa de envio: as ferramentas são JavaScript rodando no seu navegador. Não é promessa de política, é como elas são feitas.",
    privacyPoint1T: "Processamento local",
    privacyPoint1D: "Os arquivos são lidos pela File API do navegador e processados na memória. Nada é transmitido.",
    privacyPoint2T: "Sem contas",
    privacyPoint2D: "Sem cadastro, sem e-mail, sem histórico. Abra e use.",
    privacyPoint3T: "Honestos por design",
    privacyPoint3D: "Se algo não dá para fazer no navegador, dizemos em vez de fingir.",
    privacyLink: "Ler a nota de privacidade",
    endTitle: "Escolha uma ferramenta. Ela funciona.",
    endSub: "Quinze idiomas, zero uploads, nada para instalar.",
  },

  tools: {
    title: "Todas as ferramentas",
    subtitle: "Pesquise entre {count} ferramentas gratuitas. Sem uploads, sem cadastro.",
    filterPlaceholder: "Pesquisar ferramentas…",
    count: "{count} ferramentas",
    empty: "Nenhuma ferramenta corresponde a “{query}”.",
  },

  categories: {
    pdf: { name: "PDF", desc: "Junte, divida, converta e edite PDFs sem enviar nada para servidores." },
    image: { name: "Imagem", desc: "Comprima, redimensione, recorte e converta imagens no navegador." },
    text: { name: "Texto", desc: "Conte, limpe, ordene e transforme texto na hora, enquanto digita." },
    developer: { name: "Desenvolvedor", desc: "Formatadores, codificadores, decodificadores e geradores para o dia a dia." },
    seo: { name: "SEO", desc: "Meta tags, dados estruturados, prévia de SERP e outros auxiliares de SEO." },
    security: { name: "Segurança", desc: "Senhas, hashes e consultas — gerados e verificados no seu dispositivo." },
    utility: { name: "Legendas", desc: "Converta, desloque, mescle, conserte e limpe arquivos de legenda — SRT e VTT, sem enviar nada para servidores." },
  },

  tool: {
    howTo: "Como usar",
    faq: "Perguntas frequentes",
    related: "Ferramentas relacionadas",
    nextStep: "Próximos passos",
    copyLink: "Copiar link",
    privacyNote:
      "Esta ferramenta roda inteiramente no seu navegador. Seus dados nunca saem do seu dispositivo e não são enviados a nenhum servidor.",
    inCategory: "Mais em {category}",
    backToCategory: "Todas as ferramentas de {category}",
  },

  common: {
    openTool: "Abrir ferramenta",
    copy: "Copiar",
    copied: "Copiado",
    download: "Baixar",
    reset: "Redefinir",
    swap: "Inverter",
    clear: "Limpar",
    error: "Algo deu errado. Verifique os dados e tente novamente.",
    input: "Entrada",
    output: "Resultado",
    settings: "Opções",
    dropFiles: "Arraste arquivos aqui ou clique para escolher",
    dropFile: "Arraste um arquivo aqui ou clique para escolher",
    processing: "Processando…",
    fileSize: "Tamanho",
    sample: "Testar um exemplo",
    uppercase: "MAIÚSCULAS",
  },

  unit: {
    from: "De",
    to: "Para",
    amount: "Quantidade",
    result: "Resultado",
    common: "Conversões comuns",
    formula: "Fórmula",
    allUnits: "Todas as unidades",
  },

  text: {
    stats: {
      words: "Palavras",
      characters: "Caracteres",
      charsNoSpaces: "Sem espaços",
      sentences: "Frases",
      paragraphs: "Parágrafos",
      lines: "Linhas",
      readingTime: "Tempo de leitura",
      readingMinutes: "{n} min de leitura",
    },
  },

  footer: {
    line: "Ferramentas de legenda gratuitas. Nada do que você faz aqui sai do seu aparelho.",
    privacy: "Privacidade",
    terms: "Termos",
    about: "Sobre",
    badges: "Selos",
    language: "Idioma",
  },

  badge: {
    title: "Selos do SubtitleKit",
    desc: "Coloque um selo do SubtitleKit no seu site, README ou documentação. Ele linka para cá e conta que as ferramentas de legenda rodam inteiramente no navegador.",
    voluntary: "Incorporar é totalmente voluntário — escolha um selo se gostar do projeto. Não precisa de permissão.",
    md: "Markdown (README)",
    html: "HTML (site)",
    thanks: "Obrigado por divulgar — cada incorporação ajuda mais pessoas a descobrir ferramentas que respeitam seus arquivos.",
  },

    embed: {
    title: "Incorporar esta ferramenta",
    desc: "Coloque esta ferramenta no seu site com uma linha — ela roda no navegador do visitante.",
  },

    mcp: {
    title: "Servidor MCP — ferramentas acessíveis para IA",
    desc1: "O SubtitleKit inclui um servidor MCP (Model Context Protocol): assistentes de IA como Claude ou Cursor podem converter, deslocar, mesclar, consertar e limpar os mesmos arquivos de legenda deste site — a mesma lógica testada, sem reimplementar.",
    desc2: "As ferramentas executam as funções puras do próprio site: leitura de SRT/VTT, cálculos de tempo e limpeza de texto. Legendas entram e saem como texto; a execução acontece na máquina do cliente de IA via npx — nada é enviado aos nossos servidores.",
    toolsTitle: "Ferramentas executáveis ({n})",
    requiresNode: "Requer Node.js 18+. O servidor roda localmente via stdio; apenas as chamadas que você fizer são calculadas na sua máquina.",
    privacy: "Requer Node.js 18+. O servidor roda localmente via stdio; apenas as chamadas que você fizer são calculadas na sua máquina.",
  },

    notFound: {
    title: "Página não encontrada",
    body: "A ferramenta que você procura não existe. Explore todas as ferramentas.",
    home: "Ir para a página inicial",
  },
};

export default pt;
