import { dict } from "@/lib/i18n";
import { isLocale, LOCALES, type Locale } from "@/lib/site";
import { ALL_TOOLS } from "@/tools/registry";
import { Container, Prose, SectionHead } from "@/components/ui";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

const CONTENT: Partial<Record<Locale, string[]>> = {
  en: [
    "SubtitleKit is a set of subtitle tools that run entirely in your browser. There is no backend: the subtitle file you paste or open is parsed, transformed and rebuilt by JavaScript on your own device, and the result is handed straight back as a download.",
    "That design gives us three properties we care about. It is private by construction — there is no upload step, so nothing can leak. It is fast — there is no round trip to a server. And it is honest — every tool does exactly what the page says, no tricks.",
    "The current tools cover the everyday subtitle pipeline: converting between SRT and WebVTT, shifting and rescaling timelines, merging two tracks into a bilingual file, extracting a time range, repairing broken timing and batch-cleaning text before styling. Subtitle generation needs AI models and stays out of scope on purpose — everything here is deterministic file processing you can verify.",
  ],
  zh: [
    "SubtitleKit 是一组完全在浏览器里运行的字幕工具。没有后端:你粘贴或打开的字幕文件,由你自己设备上的 JavaScript 解析、变换、重建,结果直接交还给你下载。",
    "这个设计带来三个我们看重的性质:隐私是构造出来的——没有上传这一步,就谈不上泄露;速度快——没有服务器往返;诚实——每个工具都做页面所说的事,不玩花样。",
    "现有工具覆盖字幕处理的日常链路:SRT 与 WebVTT 互转、时间轴平移与缩放、双轨合并成双语文件、区间抽取、时间轴修复、注入样式前的文本批量清理。字幕生成需要 AI 模型,刻意不在范围内——这里的每件事都是可验证的确定性文件处理。",
  ],
  ja: [
    "SubtitleKit は、完全にブラウザ内で動く字幕ツールのコレクションです。バックエンドはありません。貼り付けたり開いたりした字幕ファイルは、自分のデバイス上の JavaScript が解析・変換・再構築し、結果はそのままダウンロードとして手元に戻ります。",
    "この設計には、私たちが大切にする 3 つの性質があります。プライバシーは構造的に保証される(アップロードという行程がないので漏えいもない)、速い(サーバー往復がない)、そして誠実(各ツールはページに書かれた通りのことだけをする)。",
    "現在のツールは字幕処理の日常的な流れをカバーします。SRT と WebVTT の相互変換、タイムラインのズラしとスケール、2 トラックのバイリンガル統合、時間範囲の抽出、タイミング修復、スタイル適用前のテキスト一括クリーニング。字幕生成は AI モデルが必要なので、意図的に対象外です。ここにあるのはすべて、検証可能な決定論的なファイル処理です。",
  ],
  es: [
    "SubtitleKit es un conjunto de herramientas de subtítulos que funcionan por completo en tu navegador. No hay backend: el archivo que pegas o abres se analiza, transforma y reconstruye con JavaScript en tu propio dispositivo, y el resultado vuelve directo como descarga.",
    "Ese diseño nos da tres propiedades que nos importan. Privacidad por construcción: no hay paso de subida, así que no puede haber fugas. Velocidad: sin viajes de ida y vuelta al servidor. Honestidad: cada herramienta hace exactamente lo que dice su página, sin trucos.",
    "Las herramientas actuales cubren el flujo cotidiano de subtítulos: convertir entre SRT y WebVTT, desplazar y reescalar líneas de tiempo, fusionar dos pistas en un archivo bilingüe, extraer un rango de tiempo, reparar tiempos rotos y limpiar el texto por lotes antes de aplicar estilos. Generar subtítulos requiere modelos de IA y queda fuera del alcance a propósito: aquí todo es procesamiento de archivos determinista que puedes verificar.",
  ],
  pt: [
    "SubtitleKit é um conjunto de ferramentas de legenda que rodam inteiramente no seu navegador. Não há backend: o arquivo que você cola ou abre é lido, transformado e reconstruído por JavaScript no seu próprio aparelho, e o resultado volta direto como download.",
    "Esse design nos dá três propriedades que valorizamos. Privacidade por construção: não há etapa de upload, logo não há vazamento. Velocidade: sem viagem ao servidor. Honestidade: cada ferramenta faz exatamente o que a página diz, sem truques.",
    "As ferramentas atuais cobrem o fluxo cotidiano de legendas: converter entre SRT e WebVTT, deslocar e reescalar linhas do tempo, mesclar duas trilhas num arquivo bilíngue, extrair uma faixa de tempo, consertar tempos quebrados e limpar texto em lote antes de estilizar. Gerar legendas exige modelos de IA e fica de fora de propósito — aqui tudo é processamento de arquivos determinístico que você pode verificar.",
  ],
};

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) return null;
  const t = dict(lang as Locale);
  return (
    <Container className="max-w-3xl py-12">
      <SectionHead title={t.nav.about} />
      <Prose paragraphs={CONTENT[lang as Locale] ?? CONTENT.en!} />
      <p className="mt-6 text-[14px] text-[var(--color-sub)]">
        {ALL_TOOLS.length} tools · {LOCALES.length} languages
      </p>
    </Container>
  );
}
