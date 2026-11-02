import { CleanerEngine } from "../_engines/engine-cleaner";
import { defineTool } from "../_lib/types";

export default defineTool({
  slug: "subtitle-converter-batch",
  category: "utility",
  icon: "text",
  engine: { component: CleanerEngine },
  related: ["srt-vtt-converter", "subtitle-shifter", "subtitle-merger", "subtitle-fixer"],
  copy: {
    en: {
      name: "Subtitle Text Cleaner",
      tagline:
        "Batch-clean subtitle text before restyling: strip markup tags, drop speaker labels and sound-effect markers, normalize case and re-wrap lines at a fixed width.",
      intro: [
        "Before you inject styling into a subtitle file — a font, colors, positioning — the text underneath should be clean. Fan subtitles carry <i> and <font> tags from five different tools, every other line is tagged \"NARRATOR:\", sound effects appear as [Music] and ♪♪, capitalization is whatever the transcriber felt like, and lines wrap at inconsistent widths. Fixing any of this by hand across thousands of cues is not a task, it is a punishment.",
        "This cleaner applies the whole batch at once, to every cue: remove markup tags, remove speaker labels, remove sound-effect markers (a cue that becomes empty is dropped and counted), lowercase everything, and re-wrap each cue's lines at a width you choose — counted in real characters, so CJK lines wrap correctly too. Dialogue dashes and actual speech are never touched.",
      ],
      steps: [
        "Paste or load the subtitle file — SRT or VTT, detected automatically.",
        "Tick the operations you want: strip tags, remove speaker labels, remove sound effects, lowercase.",
        "Set a wrap width in characters, or 0 to leave line breaks as they are.",
        "Check the modified/removed counts, then copy or download the cleaned file.",
      ],
      faqs: [
        {
          q: "Which tags does stripping remove?",
          a: "Anything that looks like a tag: <i>, <b>, <u>, <font color=\"#ffcc00\">, positioning spans — the parser removes well-formed <…> groups and keeps the text between them. It is a cleanup for re-styling, not a validator: malformed markup just comes along for the ride.",
        },
        {
          q: "How are speaker labels recognized?",
          a: "A label is the first thing on a line, optionally preceded by a dash, written in ALL CAPS or Title Case, and followed by a colon — like \"NARRATOR:\", \"John:\" or \"- MAN (O.S.):\". What follows the colon stays. Plain dialogue dashes (\"- hello\") are kept as-is.",
        },
        {
          q: "What counts as a sound effect?",
          a: "Square-bracketed markers like [Music] or [applause], ♪ and ♫ characters, and lines that consist only of a parenthetical stage direction like (laughs). If removing them empties a cue entirely, the cue is removed too and counted in the report.",
        },
        {
          q: "Why wrap lines at a fixed width?",
          a: "Players wrap text by their own rules, and hand-broken lines make it worse. A consistent 35–42 characters per line is the common subtitle guideline for readable two-line cues; the counter works on characters, not bytes, so Chinese and Japanese wrap at the same visual width.",
        },
      ],
    },
    zh: {
      name: "字幕文本清理",
      tagline:
        "在注入样式前批量清理字幕文本:去掉标签、说话人标签、音效标记,统一大小写,并按固定宽度重新折行。",
      intro: [
        "给字幕注入样式(字体、颜色、定位)之前,底下的文本应该先干净。粉丝字幕里混着五六个工具产出的 <i>、<font> 标签,隔行就是 \"NARRATOR:\",音效写成 [Music] 和 ♪♪,大小写全凭听写者心情,折行宽度乱七八糟。几千条 cue 手工改这些,不是活儿,是刑罚。",
        "这个清理器把整套操作一次应用到每条 cue:去标签、去说话人标签、去音效标记(清空了的 cue 会被移除并计数)、全部小写、按你选的宽度重新折行——按真实字符计数,中日韩文本也能正确折行。对话破折号和真正的台词绝不触碰。",
      ],
      steps: [
        "粘贴或载入字幕文件——SRT / VTT 自动识别。",
        "勾选需要的操作:去标签、去说话人、去音效、转小写。",
        "设置折行字符数,填 0 则保持原有换行。",
        "查看修改/移除计数,然后复制或下载清理后的文件。",
      ],
      faqs: [
        {
          q: "去标签会去掉哪些东西?",
          a: "所有形似标签的东西:<i>、<b>、<u>、<font color=\"#ffcc00\">、定位 span——解析器移除成对的 <…> 并保留中间文本。它是给重新样式化做的清理,不是校验器:残缺的标记会原样留下。",
        },
        {
          q: "说话人标签是怎么识别的?",
          a: "标签必须是行首(前面可有破折号)、全大写或驼峰首字母大写、后面跟冒号的词——比如 \"NARRATOR:\"、\"John:\"、\"- MAN (O.S.):\"。冒号后面的内容保留。普通对话破折号(\"- hello\")原样不动。",
        },
        {
          q: "什么算音效标记?",
          a: "方括号标记如 [Music]、[applause],♪ ♫ 字符,以及整行只剩 (laughs) 这类括号舞台指示的情况。如果去掉之后某条 cue 完全空了,这条 cue 也会移除并计入报告。",
        },
        {
          q: "为什么要按固定宽度折行?",
          a: "播放器按自己的规则换行,手工断行只会更乱。每行 35–42 字符是双行 cue 可读性的通行准则;计数按字符而不是字节,所以中文、日文按同样的视觉宽度折行。",
        },
      ],
    },
    ja: {
      name: "字幕テキスト クリーナー",
      tagline:
        "スタイル適用前に字幕テキストを一括クリーニング:タグ除去・話者ラベル除去・効果音表記除去・大文字小文字の統一・指定幅での再折り返し。",
      intro: [
        "字幕にスタイル(フォント、色、位置)を注入する前に、その下のテキストはきれいにしておくべきです。ファン字幕には 5 種類のツールが生んだ <i> や <font> タグが混ざり、一行おきに \"NARRATOR:\",効果音は [Music] や ♪♪ で表記され、大文字小文字は起こした人の気分次第、折り返し幅はめちゃくちゃ。数千キューを手で直すのは作業ではなく刑罰です。",
        "このクリーナーは全操作を全キューに一括適用します。タグ除去、話者ラベル除去、効果音表記除去(空になったキューは削除して計上)、全体の小文字化、選んだ幅での再折り返し——実文字数で数えるので CJK も正しく折れます。会話のダッシュと本来のセリフには触れません。",
      ],
      steps: [
        "字幕ファイルを貼り付けるか読み込みます。SRT / VTT は自動判定です。",
        "必要な操作にチェックを入れます:タグ除去、話者ラベル除去、効果音除去、小文字化。",
        "折り返し幅を文字数で設定します(0 なら改行をそのまま)。",
        "変更・削除の件数を確認し、クリーニング後のファイルをコピーまたはダウンロードします。",
      ],
      faqs: [
        {
          q: "タグ除去は何を取り除きますか?",
          a: "タグらしきもの全部です:<i>、<b>、<u>、<font color=\"#ffcc00\">、配置スパンなど。パーサーは整形された <…> を取り除き、間のテキストを残します。再スタイリングのための掃除であってバリデータではありません。壊れたマークアップはそのまま残ります。",
        },
        {
          q: "話者ラベルはどう認識されますか?",
          a: "行の先頭(直前にダッシュがあってもよい)にあり、ALL CAPS か Title Case で書かれ、コロンが続く語——\"NARRATOR:\",\"John:\",\"- MAN (O.S.):\" のようなものです。コロンの後は残ります。普通の会話ダッシュ(\"- hello\")はそのまま保持します。",
        },
        {
          q: "何が効果音と見なされますか?",
          a: "[Music] や [applause] のような角括弧の表記、♪ ♫ の記号、そして (laughs) のような括弧だけの舞台指示でできた行。除去して空になったキューは削除され、レポートに計上されます。",
        },
        {
          q: "なぜ固定幅で折り返すのですか?",
          a: "プレイヤーは独自の規則で折り返し、手で折った行はそれを乱します。1 行 35–42 文字の一定幅は 2 行キューを読みやすくする一般的な指針です。文字数は文字で数えるので、中国語も日本語も同じ見た目の幅で折れます。",
        },
      ],
    },
    es: {
      name: "Limpiador de texto de subtítulos",
      tagline:
        "Limpia por lotes el texto del subtítulo antes de aplicar estilos: quite etiquetas, nombres de hablante y marcadores de efectos, unifique mayúsculas y reajuste las líneas a un ancho fijo.",
      intro: [
        "Antes de inyectar estilos en un archivo de subtítulos — una fuente, colores, posiciones — el texto de debajo debería estar limpio. Los subtítulos de aficionados traen etiquetas <i> y <font> de cinco herramientas distintas, una de cada dos líneas pone \"NARRATOR:\", los efectos aparecen como [Music] y ♪♪, las mayúsculas dependen del ánimo de quien transcribió y las líneas se parten a anchos inconsistentes. Arreglarlo a mano entre miles de cues no es una tarea, es un castigo.",
        "Este limpiador aplica todo el lote de golpe, a cada cue: quitar etiquetas, quitar hablantes, quitar marcadores de efectos (un cue que quede vacío se elimina y se cuenta), pasar todo a minúsculas y volver a partir las líneas de cada cue al ancho que elija — contado en caracteres reales, así el CJK también parte bien. Los guiones de diálogo y el habla real nunca se tocan.",
      ],
      steps: [
        "Pega o cargue el archivo — SRT o VTT, detectado automáticamente.",
        "Marca las operaciones que quieras: quitar etiquetas, quitar hablantes, quitar efectos, minúsculas.",
        "Fija un ancho de línea en caracteres, o 0 para dejar los saltos como están.",
        "Revisa los contadores de modificados/eliminados y copie o descargue el archivo limpio.",
      ],
      faqs: [
        {
          q: "¿Qué elimina el quitar etiquetas?",
          a: "Todo lo que parezca una etiqueta: <i>, <b>, <u>, <font color=\"#ffcc00\">, spans de posicionamiento — el analizador quita los grupos <…> bien formados y conserva el texto entre ellos. Es una limpieza para re-estilar, no un validador: el marcado malformado se queda como está.",
        },
        {
          q: "¿Cómo se reconocen los nombres de hablante?",
          a: "Una etiqueta es lo primero de la línea, opcionalmente tras un guion, escrito EN MAYÚSCULAS o Tipo Título y seguido de dos puntos — como \"NARRATOR:\", \"John:\" o \"- MAN (O.S.):\". Lo que sigue a los dos puntos se queda. Los guiones de diálogo (\"- hello\") se mantienen tal cual.",
        },
        {
          q: "¿Qué cuenta como efecto de sonido?",
          a: "Los marcadores entre corchetes como [Music] o [applause], los caracteres ♪ y ♫, y las líneas compuestas solo por una acotación entre paréntesis como (laughs). Si al quitarlos un cue queda vacío, el cue también se elimina y se cuenta en el informe.",
        },
        {
          q: "¿Por qué partir las líneas a un ancho fijo?",
          a: "Los reproductores parten el texto con sus propias reglas, y las líneas partidas a mano lo empeoran. Unos 35–42 caracteres por línea es la guía habitual para cues de dos líneas legibles; el contador trabaja con caracteres, no con bytes, así que chino y japonés parten al mismo ancho visual.",
        },
      ],
    },
    pt: {
      name: "Limpador de texto de legendas",
      tagline:
        "Limpe o texto da legenda em lote antes de estilizar: remova tags, rótulos de falante e marcadores de efeitos, padronize maiúsculas e requebre as linhas numa largura fixa.",
      intro: [
        "Antes de injetar estilo num arquivo de legenda — uma fonte, cores, posicionamento — o texto por baixo deve estar limpo. Legendas de fãs carregam tags <i> e <font> de cinco ferramentas diferentes, uma a cada duas linhas vem com \"NARRATOR:\", efeitos aparecem como [Music] e ♪♪, as maiúsculas dependem do humor de quem transcreveu, e as linhas quebram em larguras inconsistentes. Consertar isso à mão em milhares de cues não é tarefa, é punição.",
        "Este limpador aplica o lote inteiro de uma vez, a cada cue: remove tags, remove rótulos de falante, remove marcadores de efeito (um cue que ficar vazio é descartado e contado), passa tudo para minúsculas e requebra as linhas de cada cue na largura que você escolher — contada em caracteres de verdade, então CJK também quebra certo. Travessões de diálogo e fala de verdade nunca são tocados.",
      ],
      steps: [
        "Cole ou carregue o arquivo — SRT ou VTT, detectado automaticamente.",
        "Marca as operações que quiser: remover tags, remover falantes, remover efeitos, minúsculas.",
        "Defina a largura de quebra em caracteres, ou 0 para manter as quebras como estão.",
        "Confira os contadores de modificados/removidos e copie ou baixe o arquivo limpo.",
      ],
      faqs: [
        {
          q: "O que a remoção de tags tira?",
          a: "Tudo o que parece uma tag: <i>, <b>, <u>, <font color=\"#ffcc00\">, spans de posicionamento — o parser remove os grupos <…> bem formados e mantém o texto entre eles. É uma limpeza para re-estilizar, não um validador: marcação malformada passa como está.",
        },
        {
          q: "Como os rótulos de falante são reconhecidos?",
          a: "Um rótulo é a primeira coisa da linha, opcionalmente precedida de travessão, escrita EM MAIÚSCULAS ou Capitalizada e seguida de dois-pontos — como \"NARRATOR:\", \"John:\" ou \"- MAN (O.S.):\". O que vem depois dos dois-pontos fica. Travessões de diálogo comuns (\"- hello\") ficam como estão.",
        },
        {
          q: "O que conta como efeito sonoro?",
          a: "Marcadores entre colchetes como [Music] ou [applause], os caracteres ♪ e ♫, e linhas compostas apenas por uma indicação entre parênteses como (laughs). Se removê-los esvaziar um cue por completo, o cue também sai e entra na contagem do relatório.",
        },
        {
          q: "Por que quebrar as linhas numa largura fixa?",
          a: "Players quebram o texto pelas regras deles, e linhas quebradas à mão pioram o resultado. Uns 35–42 caracteres por linha é a diretriz comum para cues de duas linhas legíveis; a contagem é por caracteres, não por bytes, então chinês e japonês quebram na mesma largura visual.",
        },
      ],
    },
  },
});
