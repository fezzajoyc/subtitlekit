import { ConverterEngine } from "../_engines/engine-converter";
import { defineTool } from "../_lib/types";

export default defineTool({
  slug: "srt-vtt-converter",
  category: "utility",
  icon: "swap",
  featured: true,
  engine: { component: ConverterEngine },
  related: ["subtitle-shifter", "subtitle-merger", "subtitle-fixer", "subtitle-converter-batch"],
  copy: {
    en: {
      name: "SRT to VTT Converter",
      tagline:
        "Convert subtitles between SRT and WebVTT in your browser — timestamps, cue settings and formatting tags survive the trip, and nothing is uploaded.",
      intro: [
        "SRT is the format every video player and most editing tools accept; WebVTT is what HTML5 video and streaming platforms expect. This converter moves subtitle files between the two without a server: the file is parsed in your browser, rebuilt in the target format and handed back as a download.",
        "Conversion is lossless where the formats overlap. Timing is preserved to the millisecond, <i>, <b> and <font> tags pass through untouched, and VTT cue settings (position, alignment, line) are kept when targeting WebVTT. BOM bytes, Windows line endings and missing cue numbers — the things that make files from random sources break — are cleaned up along the way.",
      ],
      steps: [
        "Paste subtitle content or load an .srt/.vtt file.",
        "Check the detected format and cue count shown under the input.",
        "Pick the target format: WebVTT or SubRip.",
        "Copy the result or download it with the right extension.",
      ],
      faqs: [
        {
          q: "What changes between SRT and WebVTT?",
          a: "WebVTT starts with a WEBVTT header, uses a dot before milliseconds instead of a comma, doesn't need cue numbers, and supports cue settings plus NOTE blocks. SRT uses strictly numbered, comma-separated timestamps. The converter rewrites all of these so the output follows the target spec, not just a find-and-replace.",
        },
        {
          q: "Will my styling tags survive?",
          a: "Yes. Inline tags such as <i>italic</i>, <b>bold</b> and <font color=\"#...\"> are plain text to the parser, so they are carried over exactly as written. Only structural cleanup happens: blank-line normalization inside cues and rebuilt sequence numbers.",
        },
        {
          q: "My file has weird characters at the start — does that matter?",
          a: "That is a UTF-8 BOM, and many editors add it. The converter strips it before parsing and accepts Windows (CRLF) or Mac line endings, so files exported from odd tools still convert cleanly.",
        },
        {
          q: "Is any part of my subtitle file uploaded?",
          a: "No. Parsing, conversion and download all happen in your browser with JavaScript. The page has no upload endpoint at all — the file never leaves your device.",
        },
      ],
    },
    zh: {
      name: "SRT 转 VTT 转换器",
      tagline:
        "在浏览器里把字幕在 SRT 与 WebVTT 之间互转——时间戳、cue 设置和样式标签原样保留,全程零上传。",
      intro: [
        "SRT 是所有播放器和多数剪辑工具都认的格式,WebVTT 则是 HTML5 视频和流媒体平台的标准。这个转换器在两种格式之间搬运字幕文件,不经过任何服务器:文件在你的浏览器里解析、按目标格式重建,然后直接下载。",
        "两种格式重叠的部分全部无损:时间精确到毫秒,<i>、<b>、<font> 标签原样保留,面向 WebVTT 输出时 cue 设置(position、align、line)也会带上。BOM 字节、Windows 换行、缺失的序号——这些让来路不明的文件打不开的坑,顺手一起清理。",
      ],
      steps: [
        "粘贴字幕内容,或载入 .srt/.vtt 文件。",
        "确认输入下方显示的识别格式与字幕条数。",
        "选择目标格式:WebVTT 或 SubRip。",
        "复制结果,或按正确扩展名下载。",
      ],
      faqs: [
        {
          q: "SRT 和 WebVTT 之间到底有什么区别?",
          a: "WebVTT 以 WEBVTT 头开头、毫秒前用点而不是逗号、不强制序号,还支持 cue 设置和 NOTE 块;SRT 则是严格编号、逗号分隔的时间戳。转换器会把这些结构差异全部重写,让输出真正符合目标规范,而不是简单替换字符。",
        },
        {
          q: "我的样式标签会保留吗?",
          a: "会。<i>斜体</i>、<b>粗体</b>、<font color=\"#...\"> 这类行内标签对解析器来说就是普通文本,原样带走。只有结构性整理会发生:字幕内部空行合并、序号重建。",
        },
        {
          q: "文件开头有奇怪的字符有关系吗?",
          a: "那是 UTF-8 BOM,很多编辑器会自动加上。转换器解析前会剥掉它,也接受 Windows(CRLF)和 Mac 换行,所以各种工具导出的文件都能正常转换。",
        },
        {
          q: "字幕文件会被上传吗?",
          a: "不会。解析、转换、下载全部在你的浏览器里用 JavaScript 完成,页面根本没有上传接口——文件从不离开你的设备。",
        },
      ],
    },
    ja: {
      name: "SRT→VTT 変換",
      tagline:
        "SRT と WebVTT をブラウザ内で相互変換。タイムスタンプ・cue 設定・タグはそのまま、アップロードは一切ありません。",
      intro: [
        "SRT はあらゆるプレイヤーとほとんどの編集ツールが受け入れる形式、WebVTT は HTML5 動画とストリーミング配信の標準です。この変換ツールはサーバーを介さず両者を往復させます。ファイルはブラウザ内で解析され、対象形式で組み立て直され、そのままダウンロードできます。",
        "両形式が重なる部分はすべてロスレスです。タイミングはミリ秒まで保持され、<i>・<b>・<font> タグは書かれた通りに通過します。WebVTT への出力では cue 設定(position・align・line)も維持。BOM、Windows 改行、欠落した連番——観測範囲を超えたツールが作る壊れやすいファイルの問題も、ついでに片付けます。",
      ],
      steps: [
        "字幕の内容を貼り付けるか、.srt/.vtt ファイルを読み込みます。",
        "入力の下に表示された判定形式とキュー数を確認します。",
        "変換先形式(WebVTT または SubRip)を選びます。",
        "結果をコピーするか、正しい拡張子でダウンロードします。",
      ],
      faqs: [
        {
          q: "SRT と WebVTT は何が違いますか?",
          a: "WebVTT は WEBVTT ヘッダーで始まり、ミリ秒の前がカンマではなくドット、連番は不要で、cue 設定や NOTE ブロックに対応しています。SRT は厳密に番号付きでカンマ区切りのタイムスタンプです。このツールは文字の置換ではなく、これらの構造をすべて書き直して対象仕様に準拠させます。",
        },
        {
          q: "装飾タグは残りますか?",
          a: "残ります。<i>斜体</i>・<b>太字</b>・<font color=\"#...\"> などのインラインタグはパーサーにとってただのテキストなので、書かれたまま引き継がれます。行われるのは構造的な整理(キュー内の空行の正規化と連番の再構築)だけです。",
        },
        {
          q: "ファイル先頭に奇妙な文字があるのですが、問題ですか?",
          a: "それは UTF-8 の BOM で、多くのエディタが自動的に付けます。変換ツールは解析前にこれを剥がし、Windows(CRLF)や Mac の改行も受け付けるので、普通でないツールから書き出されたファイルでも問題なく変換できます。",
        },
        {
          q: "字幕ファイルはアップロードされますか?",
          a: "されません。解析・変換・ダウンロードはすべてブラウザ内の JavaScript で完結し、このページにはアップロード先が存在しません。ファイルは端末の外に出ません。",
        },
      ],
    },
    es: {
      name: "Convertidor SRT a VTT",
      tagline:
        "Convierte subtítulos entre SRT y WebVTT en tu navegador — las marcas de tiempo, la configuración de cues y las etiquetas sobreviven, y nada se sube a ningún servidor.",
      intro: [
        "SRT es el formato que aceptan todos los reproductores y casi todas las herramientas de edición; WebVTT es lo que esperan el vídeo HTML5 y las plataformas de streaming. Este convertidor mueve archivos de subtítulos entre ambos sin servidor: el archivo se analiza en tu navegador, se reconstruye en el formato destino y se devuelve listo para descargar.",
        "La conversión es sin pérdidas donde los formatos coinciden. El tiempo se conserva al milisegundo, las etiquetas <i>, <b> y <font> pasan intactas, y al generar WebVTT se mantienen las opciones de cue (position, align, line). El BOM, los saltos de línea de Windows y los números de cue que faltan — lo que rompe archivos de fuentes dudosas — se limpian de paso.",
      ],
      steps: [
        "Pega el contenido de subtítulos o cargue un archivo .srt/.vtt.",
        "Comprueba el formato detectado y el número de cues bajo la entrada.",
        "Elige el formato destino: WebVTT o SubRip.",
        "Copia el resultado o descárgalo con la extensión correcta.",
      ],
      faqs: [
        {
          q: "¿Qué cambia entre SRT y WebVTT?",
          a: "WebVTT empieza con una cabecera WEBVTT, usa un punto antes de los milisegundos en vez de una coma, no necesita números de cue y admite configuración de cues y bloques NOTE. SRT usa marcas de tiempo estrictamente numeradas y con coma. El convertidor reescribe todo esto para que la salida cumpla la especificación destino, no un simple buscar y reemplazar.",
        },
        {
          q: "¿Sobreviven mis etiquetas de estilo?",
          a: "Sí. Las etiquetas en línea como <i>cursiva</i>, <b>negrita</b> y <font color=\"#...\"> son texto normal para el analizador y se trasladan tal cual. Solo hay limpieza estructural: normalización de líneas en blanco y numeración reconstruida.",
        },
        {
          q: "Mi archivo tiene caracteres raros al principio, ¿importa?",
          a: "Es un BOM UTF-8 que muchos editores añaden. El convertidor lo elimina antes de analizar y acepta saltos de línea de Windows (CRLF) o Mac, así que los archivos exportados por herramientas poco comunes también convierten bien.",
        },
        {
          q: "¿Se sube alguna parte de mi archivo?",
          a: "No. El análisis, la conversión y la descarga ocurren en tu navegador con JavaScript. La página no tiene ningún punto de subida: el archivo nunca sale de tu dispositivo.",
        },
      ],
    },
    pt: {
      name: "Conversor SRT para VTT",
      tagline:
        "Converta legendas entre SRT e WebVTT no seu navegador — timestamps, configurações de cue e tags de formatação sobrevivem, e nada é enviado para servidores.",
      intro: [
        "SRT é o formato que todo player e quase toda ferramenta de edição aceita; WebVTT é o que vídeo HTML5 e plataformas de streaming esperam. Este conversor transporta arquivos de legenda entre os dois sem servidor: o arquivo é lido no seu navegador, reconstruído no formato de destino e devolvido pronto para download.",
        "A conversão é sem perdas onde os formatos coincidem. O tempo é preservado ao milissegundo, as tags <i>, <b> e <font> passam intactas, e ao gerar WebVTT as configurações de cue (position, align, line) são mantidas. BOM, quebras de linha do Windows e numeração ausente — o que faz arquivos de fontes aleatórias quebrarem — é limpo no caminho.",
      ],
      steps: [
        "Cole o conteúdo da legenda ou carregue um arquivo .srt/.vtt.",
        "Confira o formato detectado e a contagem de cues abaixo da entrada.",
        "Escolha o formato de destino: WebVTT ou SubRip.",
        "Copia o resultado ou baixe com a extensão certa.",
      ],
      faqs: [
        {
          q: "O que muda entre SRT e WebVTT?",
          a: "O WebVTT começa com um cabeçalho WEBVTT, usa ponto antes dos milissegundos em vez de vírgula, não exige numeração e aceita configurações de cue e blocos NOTE. O SRT usa timestamps rigorosamente numerados e separados por vírgula. O conversor reescreve tudo isso para que a saída siga a especificação de destino, não um simples buscar-e-substituir.",
        },
        {
          q: "Minhas tags de estilo sobrevivem?",
          a: "Sim. Tags em linha como <i>itálico</i>, <b>negrito</b> e <font color=\"#...\"> são texto comum para o parser e passam exatamente como escritas. Só há limpeza estrutural: normalização de linhas em branco e numeração reconstruída.",
        },
        {
          q: "Meu arquivo tem caracteres estranhos no começo — isso importa?",
          a: "É um BOM UTF-8, que muitos editores adicionam. O conversor o remove antes de ler e aceita quebras de linha do Windows (CRLF) ou do Mac, então arquivos exportados por ferramentas incomuns também convertem bem.",
        },
        {
          q: "Alguma parte do meu arquivo é enviada para a internet?",
          a: "Não. Leitura, conversão e download acontecem no seu navegador com JavaScript. A página não tem nenhum ponto de upload — o arquivo nunca sai do seu aparelho.",
        },
      ],
    },
  },
});
