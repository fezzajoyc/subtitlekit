import { ShifterEngine } from "../_engines/engine-shifter";
import { defineTool } from "../_lib/types";

export default defineTool({
  slug: "subtitle-shifter",
  category: "utility",
  icon: "clock",
  engine: { component: ShifterEngine },
  related: ["srt-vtt-converter", "subtitle-merger", "subtitle-fixer", "subtitle-converter-batch"],
  copy: {
    en: {
      name: "Subtitle Shifter",
      tagline:
        "Move every subtitle earlier or later by hours, minutes, seconds or milliseconds — or rescale the whole timeline when the video runs at a different frame rate.",
      intro: [
        "Subtitles drifting out of sync is the most common subtitle problem there is: a release that starts at a different second, a title card trimmed, a version with slightly different pacing. Instead of nudging cues one by one in an editor, this tool moves every start and end time by the same offset — positive to delay, negative to advance — and clamps anything that would land before zero.",
        "The second mode rescales time. When the same film exists as a 25 fps PAL print and a 23.976 fps master, every event happens at a different second; multiplying all timestamps by 25 ÷ 23.976 re-times the file for the other version. Common conversions are one click, and custom factors work for anything else.",
      ],
      steps: [
        "Paste or load an SRT or VTT file — the format is detected automatically.",
        "Choose Shift and enter the offset, or choose Scale and pick a frame-rate preset or type a factor.",
        "Set the direction: later (delay) or earlier (advance), and whether to clamp at 00:00:00,000.",
        "Copy or download the shifted file — it comes back in the same format it went in.",
      ],
      faqs: [
        {
          q: "How do I know how much to shift?",
          a: "Open the video, note when the first line should be spoken and when your subtitle file shows it. The difference is your offset. Enter it once, apply to the whole file — the error does not grow over the runtime because every cue moves by exactly the same amount.",
        },
        {
          q: "When do I need the scale mode instead of a shift?",
          a: "When the desync grows over time. A constant offset fixes files that start wrong; a growing desync means the two videos run at different speeds, which is what frame-rate conversion corrects. Rule of thumb: constant error → shift, proportional error → scale.",
        },
        {
          q: "What does 25 fps to 23.976 fps actually do?",
          a: "A PAL-speedup print of a film runs about 4.17% faster than the 23.976 fps original. Subtitles made for one don't line up with the other, growing to a full second of error every 24 seconds. Multiplying timestamps by 25/23.976 ≈ 1.042709 re-times them exactly.",
        },
        {
          q: "What happens to cues that would start before zero?",
          a: "By default they are clamped at 00:00:00,000 so the file stays valid — players reject negative times. Turn the clamp off if your pipeline handles the cleanup itself.",
        },
      ],
    },
    zh: {
      name: "字幕时间轴平移",
      tagline:
        "把所有字幕整体提前或延后任意时、分、秒、毫秒——片源帧率不同时,还能把整条时间轴按比例缩放。",
      intro: [
        "字幕不同步是最常见的字幕问题:版本开头差了几秒、片头被剪掉、节奏略有不同的剪辑版。与其在编辑器里一条条挪,不如让工具把每条字幕的开始和结束时间平移同一个偏移量——正值延后、负值提前——提前到 0 以前的部分自动截断。",
        "第二种模式是缩放。同一部片子往往同时存在 25fps 的 PAL 版和 23.976fps 的母版,同一画面出现在不同的秒数;把所有时间戳乘以 25 ÷ 23.976,就能把文件换算到另一个版本。常用帧率一键选,其他系数手填也行。",
      ],
      steps: [
        "粘贴或载入 SRT / VTT 文件——格式自动识别。",
        "选“平移”并输入偏移量,或选“缩放”并点选帧率预设、手填系数。",
        "设置方向:延后或提前,以及是否在 00:00:00,000 处截断。",
        "复制或下载——输出与输入保持同一格式。",
      ],
      faqs: [
        {
          q: "怎么知道该平移多少?",
          a: "打开视频,记下第一句台词该出现的时间和你的字幕文件显示的时间,差值就是偏移量。只需输入一次、应用到全文件——每条字幕移动完全相同的量,误差不会随片长增长。",
        },
        {
          q: "什么时候用缩放而不是平移?",
          a: "看偏差是否随时间变大。固定偏差用平移;越来越歪说明两个视频播放速度不同,得用帧率换算。经验法则:误差恒定 → 平移,误差成比例 → 缩放。",
        },
        {
          q: "25fps 转 23.976fps 具体做了什么?",
          a: "PAL 加速版的片子比 23.976fps 的原速版快约 4.17%,为其中一版做的字幕对不上另一版,每 24 秒就会累积出整整 1 秒的误差。把时间戳乘以 25/23.976 ≈ 1.042709 即可精确换算。",
        },
        {
          q: "提前到 0 以前的字幕怎么办?",
          a: "默认在 00:00:00,000 处截断,保证文件合法——播放器不接受负时间。如果你的下游流程自己会清理,可以关掉截断。",
        },
      ],
    },
    ja: {
      name: "字幕ズレ調整",
      tagline:
        "すべての字幕を時・分・秒・ミリ秒単位で前後にズラす——フレームレートが違う動画には時間軸をスケールもできます。",
      intro: [
        "字幕のズレは最もありがちな字幕トラブルです。版によって冒頭が違う秒から始まる、タイトルカットが詰められた、テンポの少し違う編集版——。エディタで一つずつ動かす代わりに、このツールは全キューの開始・終了を同じオフセットだけ動かします(正で遅らせ、負で早める)。ゼロより前に落ちる分は自動でクランプします。",
        "2 つ目のモードはスケールです。同じ作品に 25fps の PAL 版と 23.976fps のマスターがあると、同じ場面でも秒数が変わります。全タイムスタンプに 25 ÷ 23.976 を掛ければもう片方の版に合わせられます。よく使う変換はワンクリック、それ以外は係数を直接入力。",
      ],
      steps: [
        "SRT か VTT を貼り付けるか読み込みます。形式は自動判定です。",
        "「オフセット」なら値を入力、「スケール」ならプリセットを選ぶか係数を入力します。",
        "方向(遅らせる/早める)と、00:00:00,000 でのクランプの有無を設定します。",
        "コピーまたはダウンロード。出力は入力と同じ形式で返ります。",
      ],
      faqs: [
        {
          q: "どれだけズラすべきか知るには?",
          a: "動画を開いて、最初のセリフが話されるべき時刻と字幕ファイルが示す時刻を比べます。その差がオフセットです。一度入力して全体に適用すれば、全キューが同じ分だけ動くので誤差は上映時間の中で増えません。",
        },
        {
          q: "ズラすのでなくスケールするのはいつ?",
          a: "ズレが時間とともに広がるときです。一定のズレは冒頭だけずれているファイルで、スケールが必要なのは 2 つの動画の再生速度が違う場合。目安:誤差が一定 → オフセット、誤差が比例 → スケール。",
        },
        {
          q: "25fps → 23.976fps は実際何をしますか?",
          a: "PAL 加速版のフィルムは 23.976fps の原版より約 4.17% 速く流れます。片方用の字幕はもう片方に合わず、24 秒ごとに 1 秒ずつズレが溜まります。タイムスタンプに 25/23.976 ≈ 1.042709 を掛ければ正確に合わせられます。",
        },
        {
          q: "ゼロより前に始まるキューはどうなりますか?",
          a: "既定では 00:00:00,000 でクランプされ、ファイルは有効なままです(プレイヤーは負の時刻を拒否します)。後段で自分で整理するならクランプをオフにできます。",
        },
      ],
    },
    es: {
      name: "Desplazador de subtítulos",
      tagline:
        "Adelante o retrase todos los subtítulos por horas, minutos, segundos o milisegundos — o reescale toda la línea de tiempo cuando el vídeo corre a otra tasa de fotogramas.",
      intro: [
        "Los subtítulos desincronizados son el problema más común que existe: una versión que empieza en otro segundo, una cabecera recortada, un montaje con ritmo ligeramente distinto. En lugar de mover cue tras cue en un editor, esta herramienta desplaza todos los tiempos con el mismo offset — positivo para retrasar, negativo para adelantar — y recorta lo que caería antes de cero.",
        "El segundo modo reescala el tiempo. Cuando la misma película existe como copia PAL de 25 fps y máster de 23.976 fps, cada escena ocurre en otro segundo; multiplicar todas las marcas por 25 ÷ 23.976 ajusta el archivo a la otra versión. Las conversiones habituales van a un clic, y cualquier otro factor se escribe a mano.",
      ],
      steps: [
        "Pega o cargue un archivo SRT o VTT — el formato se detecta solo.",
        "Elige Desplazar y escribe el offset, o Escalar y elige un preajuste de fps o escribe un factor.",
        "Fija la dirección: más tarde (retraso) o más temprano (adelanto), y si recortar en 00:00:00,000.",
        "Copia o descargue el archivo desplazado — vuelve en el mismo formato de entrada.",
      ],
      faqs: [
        {
          q: "¿Cómo sé cuánto desplazar?",
          a: "Abra el vídeo, anote cuándo se debería decir la primera línea y cuándo la muestra tu archivo. La diferencia es su offset. Se introduce una vez y se aplica a todo el archivo — el error no crece durante la película porque cada cue se mueve exactamente lo mismo.",
        },
        {
          q: "¿Cuándo uso escala en vez de desplazamiento?",
          a: "Cuando el desfase crece con el tiempo. Un offset constante arregla archivos que empiezan mal; un desfase creciente significa que los dos vídeos van a distinta velocidad, y eso lo corrige la conversión de fps. Regla: error constante → desplazar, error proporcional → escalar.",
        },
        {
          q: "¿Qué hace exactamente 25 fps a 23.976 fps?",
          a: "Una copia con aceleración PAL corre un 4,17 % más rápida que el original de 23.976 fps. Los subtítulos hechos para una no cuadran con la otra, y el error llega a un segundo completo cada 24 segundos. Multiplicar las marcas por 25/23.976 ≈ 1.042709 las ajusta con exactitud.",
        },
        {
          q: "¿Qué pasa con los cues que empezarían antes de cero?",
          a: "Por defecto se recortan en 00:00:00,000 para que el archivo siga siendo válido — los reproductores rechazan tiempos negativos. Quita el recorte si tu flujo posterior se encarga de la limpieza.",
        },
      ],
    },
    pt: {
      name: "Ajuste de tempo de legendas",
      tagline:
        "Adiante ou atrase todas as legendas em horas, minutos, segundos ou milissegundos — ou reescale a linha do tempo inteira quando o vídeo roda em outra taxa de quadros.",
      intro: [
        "Legenda fora de sincronia é o problema mais comum que existe: uma versão que começa em outro segundo, uma abertura cortada, uma montagem com ritmo levemente diferente. Em vez de empurrar cue por cue num editor, esta ferramenta move todo início e fim pelo mesmo deslocamento — positivo para atrasar, negativo para adiantar — e limita o que cairia antes de zero.",
        "O segundo modo reescala o tempo. Quando o mesmo filme existe numa cópia PAL de 25 fps e num master de 23.976 fps, cada cena acontece em outro segundo; multiplicar todos os timestamps por 25 ÷ 23.976 ajusta o arquivo à outra versão. As conversões comuns ficam a um clique, e qualquer outro fator pode ser digitado.",
      ],
      steps: [
        "Cole ou carregue um arquivo SRT ou VTT — o formato é detectado sozinho.",
        "Escolha Deslocar e digite o deslocamento, ou Escalar e escolha uma predefinição de fps ou digite um fator.",
        "Defina a direção: mais tarde (atraso) ou mais cedo (adiantamento), e se limitar em 00:00:00,000.",
        "Copia ou baixe o arquivo ajustado — ele volta no mesmo formato de entrada.",
      ],
      faqs: [
        {
          q: "Como sei quanto deslocar?",
          a: "Abra o vídeo, anote quando a primeira fala deveria acontecer e quando seu arquivo mostra. A diferença é o deslocamento. Digite uma vez e aplique ao arquivo todo — o erro não cresce ao longo do filme porque cada cue se move exatamente o mesmo tanto.",
        },
        {
          q: "Quando uso escala em vez de deslocamento?",
          a: "Quando o dessincronismo cresce com o tempo. Um deslocamento constante conserta arquivos que começam errados; um dessincronismo crescente significa que os dois vídeos rodam em velocidades diferentes, e isso a conversão de fps corrige. Regra: erro constante → deslocar, erro proporcional → escalar.",
        },
        {
          q: "O que 25 fps para 23.976 fps faz de fato?",
          a: "Uma cópia com aceleração PAL roda cerca de 4,17% mais rápido que o original de 23.976 fps. Legendas feitas para uma não batem com a outra, e o erro chega a um segundo inteiro a cada 24 segundos. Multiplicar os timestamps por 25/23.976 ≈ 1.042709 ajusta tudo com exatidão.",
        },
        {
          q: "E os cues que começariam antes de zero?",
          a: "Por padrão são limitados em 00:00:00,000 para o arquivo continuar válido — players rejeitam tempos negativos. Desligue o limite se seu fluxo seguinte cuida da limpeza.",
        },
      ],
    },
  },
});
