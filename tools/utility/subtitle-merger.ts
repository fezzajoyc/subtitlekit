import { MergerEngine } from "../_engines/engine-merger";
import { defineTool } from "../_lib/types";

export default defineTool({
  slug: "subtitle-merger",
  category: "utility",
  icon: "layers",
  engine: { component: MergerEngine },
  related: ["srt-vtt-converter", "subtitle-shifter", "subtitle-fixer", "subtitle-converter-batch"],
  copy: {
    en: {
      name: "Subtitle Merger",
      tagline:
        "Stack two subtitle tracks into one bilingual file — Chinese on top, English below, aligned by time — or extract any time range as its own subtitle file.",
      intro: [
        "Bilingual subtitles are usually two separate files from two sources: the original-language track and the translation. Players that support two tracks are rare, so the practical answer is one file with both lines. This tool aligns the second track to the first by timestamp — longest overlap wins, nearest start within a tolerance as fallback — and stacks the text, with the primary line on top.",
        "The same tool also splits: give it a start and end time and it extracts that range into a standalone file, trimming cues to the range and optionally renumbering from zero so the clip's subtitles start at 00:00. Useful for cutting a scene out of a film or making a short clip with its own captions.",
      ],
      steps: [
        "Choose Merge or Extract at the top of the tool.",
        "Merge: load the primary track (top line) and the secondary track (bottom line), set the align tolerance if needed.",
        "Extract: load one file and enter the from/to times, choose whether to trim cues and whether to restart at 00:00.",
        "Copy or download the result — it uses the primary file's format.",
      ],
      faqs: [
        {
          q: "How are the two tracks aligned?",
          a: "For every cue in the primary track, the tool picks the secondary cue with the longest time overlap; if none overlaps, it takes the nearest start within the tolerance (500 ms by default). Each secondary cue is used at most once, and leftover secondary cues are appended at the end unless you turn that off.",
        },
        {
          q: "Can the two tracks be different formats?",
          a: "Yes. Any combination of SRT and VTT works; the merged output follows the primary track's format. Both are parsed with the same tolerant parser, so mixed line endings and BOMs are fine.",
        },
        {
          q: "Will the two lines collide if one track has longer cues?",
          a: "The merged cue keeps the primary track's timing, so the secondary line displays for exactly as long as the primary one. Very long secondary lines stay readable because the text is stacked, not interleaved — players render the two lines as a block.",
        },
        {
          q: "What does 'restart at 00:00' do in Extract?",
          a: "It subtracts the range start from every remaining timestamp, so the extracted file starts at 00:00:00,000 and can be played next to a trimmed video clip without re-syncing.",
        },
      ],
    },
    zh: {
      name: "字幕合并拆分",
      tagline:
        "把两条字幕轨叠成一个双语文件——中文在上、英文在下、按时间对齐;也可以抽取任意时间段,单独存成一个字幕文件。",
      intro: [
        "双语字幕通常是两个来源的两条轨:原语言一条、翻译一条。支持双轨的播放器很少,所以实际可行的方案是合成一个上下两行的文件。本工具按时间戳把副轨对齐到主轨——重叠时间最长者优先,其次取容差内起点最近的——然后上下堆叠文本,主轨在上。",
        "同一个工具也能拆分:给定起止时间,把这段抽出来存成独立文件,cue 会按区间裁边,还可以选择把时间归零,让抽出片段的字幕从 00:00 开始。从整部电影里切一场戏、给短视频配自己的字幕,都靠这一步。",
      ],
      steps: [
        "在工具顶部选择“合并”或“抽取”。",
        "合并:载入主轨(上排)和副轨(下排),按需调整对齐容差。",
        "抽取:载入一个文件,填起止时间,选择是否裁边、是否从 00:00 重新开始。",
        "复制或下载结果——输出采用主轨的格式。",
      ],
      faqs: [
        {
          q: "两条轨是怎么对齐的?",
          a: "对主轨的每条字幕,工具挑时间重叠最长的副轨字幕;没有重叠时,取容差范围内(默认 500 毫秒)起点最近的一条。每条副轨最多用一次,没用上的副轨字幕会附在末尾,也可以关掉。",
        },
        {
          q: "两条轨可以是不同格式吗?",
          a: "可以。SRT 和 VTT 任意组合都行,合并结果跟随主轨格式。两条轨用同一套宽容解析器处理,混合换行符和 BOM 都没问题。",
        },
        {
          q: "其中一条轨的字幕更长,两行会不会打架?",
          a: "合并后的 cue 沿用主轨时间,所以副轨那行显示时长与主轨完全一致。很长的副轨文本依然可读,因为两行是上下堆叠而不是交错——播放器把两行当一块渲染。",
        },
        {
          q: "抽取里的“从 00:00 重新开始”是什么意思?",
          a: "它会把剩余每条时间戳都减去区间起点,让抽出的文件从 00:00:00,000 开始,可以直接配剪好的视频片段,不用再对一次时间。",
        },
      ],
    },
    ja: {
      name: "字幕統合・分割",
      tagline:
        "2 つの字幕トラックを時間で整列して 1 枚のバイリンガル ファイルに——上に中国語、下に英語。任意の時間帯を切り出して独立ファイルにもできます。",
      intro: [
        "バイリンガル字幕は大抵、元言語と翻訳の別々のファイルです。2 トラックを扱えるプレイヤーは少ないので、実用的な答えは両方の行を 1 ファイルにまとめること。このツールはタイムスタンプで第 2 トラックを第 1 トラックに整列し(重なりが最も長いものを優先、なければ許容差内で最も近い開始)、主行を上にしてテキストを積みます。",
        "同じツールで分割もできます。開始と終了を指定するとその範囲を独立したファイルとして取り出し、キューを範囲に切り詰め、必要なら 00:00 から始まるように時刻を詰めます。映画から一場面を切り出すときや、短いクリップに専用の字幕を付けるときに使います。",
      ],
      steps: [
        "ツール上部で「統合」か「抽出」を選びます。",
        "統合:主トラック(上の行)と副トラック(下の行)を読み込み、必要なら整列許容差を調整します。",
        "抽出:1 つのファイルを読み込み、開始・終了時刻を入力し、切り詰めと 00:00 起点の要否を選びます。",
        "結果をコピーまたはダウンロード。出力は主トラックの形式になります。",
      ],
      faqs: [
        {
          q: "2 つのトラックはどう整列しますか?",
          a: "主トラックの各キューについて、時間の重なりが最も長い副トラックのキューを選びます。重なりがなければ許容差(既定 500ms)内で開始が最も近いものを採用します。副トラックのキューは最大 1 回しか使われず、余ったものは末尾に追加されます(オフにできます)。",
        },
        {
          q: "2 つのトラックは別形式でも大丈夫?",
          a: "大丈夫です。SRT と VTT の任意の組み合わせが動き、統合結果は主トラックの形式に従います。両方とも同じ寛容なパーサーで読むので、改行コードの混在や BOM も問題ありません。",
        },
        {
          q: "片方のキューが長いと 2 行は衝突しませんか?",
          a: "統合後のキューは主トラックのタイミングを保つので、副の行は主とまったく同じ長さ表示されます。長い副テキストも読みやすさは保たれます。行は積み重ねであって差し込みではないため、プレイヤーは 2 行を 1 ブロックとして描画します。",
        },
        {
          q: "抽出の「00:00 から始める」は何をしますか?",
          a: "残った全タイムスタンプから範囲の開始時刻を引きます。抽出ファイルが 00:00:00,000 から始まるので、カットした動画クリップと並べて再生してもう一度同期を取る必要がありません。",
        },
      ],
    },
    es: {
      name: "Fusionar subtítulos",
      tagline:
        "Apila dos pistas de subtítulos en un archivo bilingüe — chino arriba, inglés abajo, alineadas por tiempo — o extrae cualquier rango como archivo aparte.",
      intro: [
        "Los subtítulos bilingües suelen ser dos archivos de dos fuentes: la pista original y la traducción. Los reproductores que admiten dos pistas son raros, así que la respuesta práctica es un archivo con las dos líneas. Esta herramienta alinea la segunda pista con la primera por marca de tiempo — gana la superposición más larga, o el inicio más cercano dentro de una tolerancia — y apila el texto, con la línea principal arriba.",
        "La misma herramienta también divide: dele un inicio y un fin y extrae ese rango como archivo independiente, recortando los cues al rango y, si quiere, reiniciando desde cero para que los subtítulos del clip empiecen en 00:00. Útil para sacar una escena de una película o poner subtítulos propios a un clip corto.",
      ],
      steps: [
        "Elige Fusionar o Extraer en la parte superior de la herramienta.",
        "Fusionar: cargue la pista principal (línea superior) y la secundaria (línea inferior), y ajusta la tolerancia si hace falta.",
        "Extraer: cargue un archivo, escriba los tiempos de inicio y fin, y decide si recortar cues y si reiniciar en 00:00.",
        "Copia o descargue el resultado — usa el formato del archivo principal.",
      ],
      faqs: [
        {
          q: "¿Cómo se alinean las dos pistas?",
          a: "Para cada cue de la pista principal, la herramienta elige el cue secundario con la superposición temporal más larga; si ninguna se superpone, toma el inicio más cercano dentro de la tolerancia (500 ms por defecto). Cada cue secundario se usa como máximo una vez, y los sobrantes se añaden al final salvo que lo desactive.",
        },
        {
          q: "¿Pueden ser formatos distintos?",
          a: "Sí. Cualquier combinación de SRT y VTT funciona; la fusión sigue el formato de la pista principal. Ambas se analizan con el mismo parser tolerante, así que saltos de línea mixtos y BOM no son problema.",
        },
        {
          q: "¿Chocan las dos líneas si una pista tiene cues más largos?",
          a: "El cue fusionado conserva el tiempo de la pista principal, así que la línea secundaria se muestra exactamente lo que dura la principal. Las líneas secundarias muy largas siguen legibles porque el texto se apila, no se intercala — el reproductor dibuja las dos líneas como un bloque.",
        },
        {
          q: "¿Qué hace 'reiniciar en 00:00' en Extraer?",
          a: "Resta el inicio del rango a todas las marcas restantes, de modo que el archivo extraído empieza en 00:00:00,000 y puede reproducirse junto a un clip recortado sin volver a sincronizar.",
        },
      ],
    },
    pt: {
      name: "Mesclar legendas",
      tagline:
        "Empilhe duas trilhas de legenda num arquivo bilíngue — chinês em cima, inglês embaixo, alinhadas pelo tempo — ou extraia qualquer faixa como arquivo próprio.",
      intro: [
        "Legendas bilíngues costumam ser dois arquivos de duas fontes: a trilha original e a tradução. Players que aceitam duas trilhas são raros, então a resposta prática é um arquivo com as duas linhas. Esta ferramenta alinha a segunda trilha à primeira por timestamp — vence a maior sobreposição, ou o início mais próximo dentro de uma tolerância — e empilha o texto, com a linha principal em cima.",
        "A mesma ferramenta também divide: dê um início e um fim e ela extrai a faixa como arquivo independente, aparando os cues à faixa e, se quiser, reiniciando do zero para que as legendas do clipe comecem em 00:00. Serve para recortar uma cena de um filme ou legendá-la por conta própria.",
      ],
      steps: [
        "Escolha Mesclar ou Extrair no topo da ferramenta.",
        "Mesclar: carregue a trilha principal (linha de cima) e a secundária (linha de baixo), ajustando a tolerância se precisar.",
        "Extrair: carregue um arquivo, digite os tempos de início e fim, e decide se aparar cues e se reiniciar em 00:00.",
        "Copia ou baixe o resultado — ele usa o formato do arquivo principal.",
      ],
      faqs: [
        {
          q: "Como as duas trilhas são alinhadas?",
          a: "Para cada cue da trilha principal, a ferramenta escolhe o cue secundário com a maior sobreposição de tempo; se nenhuma sobrepõe, pega o início mais próximo dentro da tolerância (500 ms por padrão). Cada cue secundário é usado no máximo uma vez, e os que sobrarem vão para o fim, a menos que você desative isso.",
        },
        {
          q: "As trilhas podem ser de formatos diferentes?",
          a: "Sim. Qualquer combinação de SRT e VTT funciona; a mesclagem segue o formato da trilha principal. Ambas passam pelo mesmo parser tolerante, então quebras de linha mistas e BOM não são problema.",
        },
        {
          q: "As duas linhas colidem se uma trilha tiver cues mais longos?",
          a: "O cue mesclado mantém o tempo da trilha principal, então a linha secundária aparece exatamente pelo tempo da principal. Linhas secundárias muito longas continuam legíveis porque o texto é empilhado, não intercalado — o player desenha as duas linhas como um bloco.",
        },
        {
          q: "O que 'reiniciar em 00:00' faz na Extração?",
          a: "Subtrai o início da faixa de todas as marcações restantes, de modo que o arquivo extraído comece em 00:00:00,000 e possa ser reproduzido junto a um clipe cortado sem ressincronizar.",
        },
      ],
    },
  },
});
