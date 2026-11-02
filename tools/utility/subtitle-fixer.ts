import { FixerEngine } from "../_engines/engine-fixer";
import { defineTool } from "../_lib/types";

export default defineTool({
  slug: "subtitle-fixer",
  category: "utility",
  icon: "check",
  engine: { component: FixerEngine },
  related: ["srt-vtt-converter", "subtitle-shifter", "subtitle-merger", "subtitle-converter-batch"],
  copy: {
    en: {
      name: "Subtitle Fixer",
      tagline:
        "Find and fix the timing bugs that make players choke — overlapping cues, reversed timestamps, zero-length lines, gaps under 100 ms and scrambled order — with a before/after report.",
      intro: [
        "Subtitles downloaded from random sources come with a familiar pile of defects: cues that overlap because two translators worked from different cuts, timestamps written end-first, lines that flash for zero milliseconds, gaps so short the text flickers on some players, and cues out of order after a bad merge. Each one is trivial to fix by hand — for five cues. For five thousand you need a machine.",
        "This tool first reports every problem it finds, grouped by type with counts. Applying the fixes sorts out-of-order cues, swaps reversed timestamps, gives zero-length cues a display time, trims overlaps by cutting the earlier cue at the next cue's start, and closes gaps shorter than your threshold — all deterministically, and your <i> and <font> tags are never touched.",
      ],
      steps: [
        "Paste or load the broken SRT or VTT file.",
        "Read the diagnostic report — every issue is counted by type before anything changes.",
        "Set the minimum gap you want (100 ms is the usual player threshold) and apply the fixes.",
        "Compare the before/after table, then copy or download the repaired file.",
      ],
      faqs: [
        {
          q: "Which problems does it detect?",
          a: "Out-of-order cues, negative (reversed) durations, zero-duration cues, overlaps between adjacent cues, gaps shorter than your threshold, and cues with no text at all. The report shows the count of each before and after the fix so you can verify nothing was silently mangled.",
        },
        {
          q: "How is an overlap resolved?",
          a: "The earlier cue's end is trimmed to the next cue's start — the standard editor behavior. If a gap between two cues is shorter than your threshold instead, the earlier cue is extended to touch the next one, which removes the flicker some players show on rapid gaps.",
        },
        {
          q: "A cue ends before it starts — what happens?",
          a: "That is almost always a pair of timestamps written in the wrong order, so the tool swaps them. Cues with exactly zero duration get the minimum display time instead, capped so they never create a new overlap.",
        },
        {
          q: "Does it change my text or tags?",
          a: "No. Only timing and ordering are rewritten. Formatting tags like <i> and <font>, dialogue dashes and every character of the text pass through untouched, and cue numbers are rebuilt cleanly on export.",
        },
      ],
    },
    zh: {
      name: "字幕修复",
      tagline:
        "找出并修好让播放器卡壳的时间轴问题——时间重叠、起止写反、零时长、小于 100 毫秒的间隙、顺序错乱——并给出修复前后对照报告。",
      intro: [
        "从网上随机下载的字幕总带着一堆老毛病:两个译者对着不同剪辑版干活导致的时间重叠、起止写反的时间戳、闪现零毫秒的行、短到让部分播放器闪烁的间隙、以及坏合并之后的乱序。每一条手工修都不难——五条以内的话。五千条就需要机器了。",
        "本工具先把发现的问题按类型分组报数,再一键应用修复:乱序重新排序、写反的起止交换、零时长补显示时间、重叠把前一条截到后一条开始处、小于阈值的间隙闭合到贴合——全部确定性执行,<i>、<font> 等标签绝不触碰。",
      ],
      steps: [
        "粘贴或载入出问题的 SRT / VTT 文件。",
        "阅读诊断报告——动任何东西之前,每类问题都先报数。",
        "设置最小间隙(100 毫秒是常见播放器阈值),点应用修复。",
        "对照修复前后表格,然后复制或下载修好的文件。",
      ],
      faqs: [
        {
          q: "能检测哪些问题?",
          a: "乱序字幕、负时长(起止写反)、零时长、相邻重叠、小于阈值的间隙、完全没文本的 cue。报告会分别给出修复前后的计数,方便你确认没有被悄悄改坏的地方。",
        },
        {
          q: "重叠是怎么解决的?",
          a: "前一条的结束时间被截到后一条的开始——标准编辑器的做法。如果两条之间是短于阈值的间隙,则把前一条延长到贴合后一条,消除部分播放器在快速间隙上的闪烁。",
        },
        {
          q: "结束时间早于开始时间的 cue 会怎样?",
          a: "这几乎总是时间戳写反了,工具会直接交换。时长恰好为零的 cue 会被补上最短显示时间,并封顶处理,不会制造新的重叠。",
        },
        {
          q: "会改动我的文本和标签吗?",
          a: "不会。只重写时间和顺序。<i>、<font> 等格式标签、对话破折号、文本的每个字符都原样保留,序号在导出时干净地重建。",
        },
      ],
    },
    ja: {
      name: "字幕修復",
      tagline:
        "プレイヤーが詰まるタイミングの不具合——キューの重なり・逆転したタイムスタンプ・表示時間ゼロ・100ms 未満の隙間・順序の崩れ——を検出して修復し、修正前後のレポートを出します。",
      intro: [
        "出所の怪しい字幕にはお決まりの欠陥がつきものです。訳者が別々のカットで作業したために重なるキュー、終了を先に書いたタイムスタンプ、ゼロミリ秒で点滅する行、プレイヤーによってちらつくほど短い隙間、そして不正な統合の後で順序が崩れたキュー。一つずつなら手で直せますが、五千件は無理です。",
        "このツールはまず見つけた問題を種類ごとに集計して報告します。修正を適用すると、順序の崩れは並べ替え、逆転したタイムスタンプは入れ替え、表示時間ゼロのキューには時間を与え、重なりは前のキューを次の開始で切り詰め、閾値未満の隙間は閉じます。すべて決定論的で、<i> や <font> タグには一切触れません。",
      ],
      steps: [
        "壊れた SRT / VTT を貼り付けるか読み込みます。",
        "診断レポートを読みます。何も変える前に問題が種類ごとに集計されます。",
        "最小隙間(通常は 100ms)を設定して修正を適用します。",
        "修正前後の表を見比べ、修復済みファイルをコピーまたはダウンロードします。",
      ],
      faqs: [
        {
          q: "どんな問題を検出しますか?",
          a: "順序が崩れたキュー、負(逆転)の表示時間、表示時間ゼロのキュー、隣接キューの重なり、閾値未満の隙間、テキストが空のキュー。レポートは修正前後の件数を並べて示すので、黙って壊されていないか確認できます。",
        },
        {
          q: "重なりはどう解決しますか?",
          a: "前のキューの終了を次のキューの開始に切り詰めます。エディタの標準動作です。逆に 2 つのキューの隙間が閾値より短い場合は、前のキューを延ばして次にぴったり付け、隙間が早すぎる一部プレイヤーのちらつきを消します。",
        },
        {
          q: "終了が開始より前のキューはどうなりますか?",
          a: "ほぼ必ずタイムスタンプの書き順ミスなので、ツールが入れ替えます。ちょうど表示時間ゼロのキューには最短表示時間を与えますが、上限を設けて新しい重なりを作りません。",
        },
        {
          q: "テキストやタグは変更されますか?",
          a: "されません。書き直すのは時間と順序だけです。<i>・<font> などのタグ、会話のダッシュ、テキストの一文字一文字はそのまま通過し、キュー番号は書き出し時にきれいに再構築されます。",
        },
      ],
    },
    es: {
      name: "Reparador de subtítulos",
      tagline:
        "Encuentra y corrige los errores de tiempo que atascan a los reproductores — cues superpuestos, marcas invertidas, líneas de duración cero, huecos de menos de 100 ms y orden roto — con informe antes/después.",
      intro: [
        "Los subtítulos descargados de fuentes aleatorias traen un montón de defectos conocidos: cues que se solapan porque dos traductores trabajaron sobre cortes distintos, marcas escritas al revés, líneas que destellan cero milisegundos, huecos tan cortos que el texto parpadea en algunos reproductores, y cues desordenados tras una fusión mala. A mano cada uno es trivial — con cinco cues. Con cinco mil hace falta una máquina.",
        "Esta herramienta primero informa de cada problema encontrado, agrupado por tipo y contado. Al aplicar las correcciones ordena los cues fuera de secuencia, intercambia las marcas invertidas, da tiempo de pantalla a los cues de longitud cero, recorta las superposiciones cortando el cue anterior en el inicio del siguiente y cierra los huecos más cortos que tu umbral — todo de forma determinista, sin tocar tus etiquetas <i> y <font>.",
      ],
      steps: [
        "Pega o cargue el archivo SRT o VTT estropeado.",
        "Lee el informe de diagnóstico — cada problema se cuenta por tipo antes de cambiar nada.",
        "Fija el hueco mínimo (100 ms es el umbral habitual de los reproductores) y aplique las correcciones.",
        "Compara la tabla antes/después y copie o descargue el archivo reparado.",
      ],
      faqs: [
        {
          q: "¿Qué problemas detecta?",
          a: "Cues fuera de orden, duraciones negativas (invertidas), cues de duración cero, superposiciones entre cues adyacentes, huecos más cortos que tu umbral y cues sin texto. El informe muestra el recuento de cada uno antes y después, para que verifiques que nada se estropeó en silencio.",
        },
        {
          q: "¿Cómo se resuelve una superposición?",
          a: "El final del cue anterior se recorta en el inicio del siguiente — el comportamiento estándar de los editores. Si lo que hay entre dos cues es un hueco menor que tu umbral, el cue anterior se extiende hasta tocar el siguiente, lo que elimina el parpadeo que algunos reproductores muestran con huecos rápidos.",
        },
        {
          q: "Un cue acaba antes de empezar, ¿qué ocurre?",
          a: "Casi siempre son dos marcas escritas en orden contrario, y la herramienta las intercambia. Los cues de duración exactamente cero reciben un tiempo mínimo de pantalla, con tope para no crear nuevas superposiciones.",
        },
        {
          q: "¿Cambia mi texto o mis etiquetas?",
          a: "No. Solo se reescriben tiempos y orden. Las etiquetas como <i> y <font>, los guiones de diálogo y cada carácter del texto pasan intactos, y la numeración se reconstruye limpia al exportar.",
        },
      ],
    },
    pt: {
      name: "Consertador de legendas",
      tagline:
        "Encontre e corrija os bugs de tempo que travam players — cues sobrepostos, marcações invertidas, linhas de duração zero, intervalos menores que 100 ms e ordem embaralhada — com relatório antes/depois.",
      intro: [
        "Legendas baixadas de fontes aleatórias vêm com uma pilha de defeitos conhecidos: cues sobrepostos porque dois tradutores trabalharam com cortes diferentes, timestamps escritos ao contrário, linhas que piscam por zero milissegundos, intervalos tão curtos que o texto pisca em alguns players, e cues fora de ordem depois de uma mesclagem ruim. À mão, cada um é trivial — para cinco cues. Para cinco mil, é preciso uma máquina.",
        "Esta ferramenta primeiro relata cada problema encontrado, agrupado por tipo e contado. Ao aplicar as correções, ela ordena cues fora de sequência, troca marcações invertidas, dá tempo de exibição a cues de duração zero, apara sobreposições cortando o cue anterior no início do seguinte e fecha intervalos menores que o seu limite — tudo de forma determinística, sem tocar nas tags <i> e <font>.",
      ],
      steps: [
        "Cole ou carregue o arquivo SRT ou VTT com problemas.",
        "Leia o relatório de diagnóstico — cada problema é contado por tipo antes de qualquer mudança.",
        "Defina o intervalo mínimo (100 ms é o limite comum dos players) e aplique as correções.",
        "Compare a tabela antes/depois e copie ou baixe o arquivo consertado.",
      ],
      faqs: [
        {
          q: "Quais problemas ele detecta?",
          a: "Cues fora de ordem, durações negativas (invertidas), cues de duração zero, sobreposições entre cues adjacentes, intervalos menores que seu limite e cues sem texto. O relatório mostra a contagem de cada um antes e depois da correção, para você confirmar que nada foi estragado em silêncio.",
        },
        {
          q: "Como uma sobreposição é resolvida?",
          a: "O fim do cue anterior é aparado no início do seguinte — comportamento padrão dos editores. Se o que existe entre dois cues é um intervalo menor que o limite, o cue anterior é estendido até encostar no próximo, o que elimina a piscada que alguns players mostram em intervalos rápidos.",
        },
        {
          q: "Um cue termina antes de começar — o que acontece?",
          a: "Quase sempre são duas marcações escritas na ordem errada, e a ferramenta as troca. Cues de duração exatamente zero ganham um tempo mínimo de exibição, com teto para não criar novas sobreposições.",
        },
        {
          q: "Ele muda meu texto ou minhas tags?",
          a: "Não. Só tempo e ordem são reescritos. Tags como <i> e <font>, travessões de diálogo e cada caractere do texto passam intactos, e a numeração é reconstruída limpa na exportação.",
        },
      ],
    },
  },
});
