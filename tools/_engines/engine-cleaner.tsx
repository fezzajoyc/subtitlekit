"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { ToolPanel } from "@/components/ui";
import { cleanCues, detectFormat, formatSubtitle, parseSubtitle, type CleanOptions } from "../_lib/subtitle";
import { Check, Field, Note, OutBar, pick, Stats, SubInput, WarnBox } from "./subtitle-ui";

/**
 * 批量文本清理引擎:去标签、去说话人、去音效标记、小写、按宽度折行。
 * 为样式注入前的字幕做准备;输出保持输入格式。
 */

const S = {
  input: { en: "Subtitle file (SRT or VTT)", zh: "字幕文件(SRT 或 VTT)", ja: "字幕ファイル(SRT / VTT)", es: "Archivo de subtítulos (SRT o VTT)", pt: "Arquivo de legenda (SRT ou VTT)" },
  stripTags: { en: "Strip markup tags (<i>, <b>, <font …>)", zh: "去掉标签(<i>、<b>、<font …>)", ja: "タグを除去(<i>、<b>、<font …>)", es: "Quitar etiquetas (<i>, <b>, <font …>)", pt: "Remover tags (<i>, <b>, <font …>)" },
  speakers: { en: "Remove speaker labels (NARRATOR:, John:)", zh: "去掉说话人标签(NARRATOR:、John:)", ja: "話者ラベルを除去(NARRATOR:、John:) ", es: "Quitar nombres de hablante (NARRATOR:, John:)", pt: "Remover rótulos de falante (NARRATOR:, John:)" },
  sfx: { en: "Remove sound effects ([Music], (applause), ♪)", zh: "去掉音效标记([Music]、(applause)、♪)", ja: "効果音表記を除去([Music]、(applause)、♪)", es: "Quitar efectos de sonido ([Music], (applause), ♪)", pt: "Remover efeitos sonoros ([Music], (applause), ♪)" },
  lowercase: { en: "Convert all text to lowercase", zh: "全部转为小写", ja: "すべて小文字に変換", es: "Convertir todo a minúsculas", pt: "Converter tudo para minúsculas" },
  wrap: { en: "Wrap lines at (characters, 0 = off)", zh: "按字符数折行(0 = 关闭)", ja: "行を折り返す文字数(0 = オフ)", es: "Dividir líneas a (caracteres, 0 = no)", pt: "Quebrar linhas em (caracteres, 0 = não)" },
  cues: { en: "Cues", zh: "字幕条数", ja: "キュー数", es: "Cues", pt: "Cues" },
  changed: { en: "Cues modified", zh: "修改的条数", ja: "変更されたキュー", es: "Cues modificados", pt: "Cues modificados" },
  dropped: { en: "Empty cues removed", zh: "移除的空字幕", ja: "削除された空キュー", es: "Cues vacíos eliminados", pt: "Cues vazios removidos" },
  warnings: { en: "Parsing notes", zh: "解析提示", ja: "解析メモ", es: "Notas de análisis", pt: "Notas de análise" },
  empty: { en: "Paste or load a subtitle file to clean it.", zh: "粘贴或载入字幕文件即可开始清理。", ja: "字幕ファイルを貼り付けたり読み込んだりするとクリーニングできます。", es: "Pegue o cargue un archivo de subtítulos para limpiarlo.", pt: "Cole ou carregue um arquivo de legenda para limpá-lo." },
  note: {
    en: "Dialogue dashes (\"- hello\") are kept; only labels followed by a colon are removed. Line wrapping counts letters, not bytes, so CJK wraps correctly.",
    zh: "对话破折号(\"- hello\")会保留;只有带冒号的标签会被去掉。折行按字符计数,中日韩文本也能正确折行。",
    ja: "会話のダッシュ(\"- hello\")は残し、コロン付きのラベルだけを除去します。折り返しは文字数で数えるので CJK も正しく折れます。",
    es: "Los guiones de diálogo (\"- hello\") se conservan; solo se quitan las etiquetas seguidas de dos puntos. El ajuste de línea cuenta caracteres, también para CJK.",
    pt: "Travessões de diálogo (\"- hello\") são mantidos; só rótulos seguidos de dois-pontos são removidos. A quebra conta caracteres, então CJK quebra corretamente.",
  },
};

export function CleanerEngine() {
  const { locale } = useI18n();
  const [input, setInput] = useState("");
  const [stripTags, setStripTags] = useState(true);
  const [speakers, setSpeakers] = useState(false);
  const [sfx, setSfx] = useState(false);
  const [lowercase, setLowercase] = useState(false);
  const [wrapAt, setWrapAt] = useState("42");

  const opts: CleanOptions = useMemo(
    () => ({
      stripTags,
      removeSpeakers: speakers,
      removeSoundEffects: sfx,
      lowercase,
      wrapAt: parseInt(wrapAt, 10) > 0 ? parseInt(wrapAt, 10) : null,
    }),
    [stripTags, speakers, sfx, lowercase, wrapAt],
  );

  const parsed = useMemo(() => (input.trim() ? parseSubtitle(input, detectFormat(input)) : null), [input]);
  const result = useMemo(() => (parsed ? cleanCues(parsed.cues, opts) : null), [parsed, opts]);
  const output = result && result.cues.length ? formatSubtitle(result.cues, detectFormat(input)) : "";

  return (
    <ToolPanel>
      <SubInput label={pick(locale, S.input)} value={input} onChange={setInput} rows={8} aria={pick(locale, S.input)} />

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        <Check label={pick(locale, S.stripTags)} checked={stripTags} onChange={setStripTags} />
        <Check label={pick(locale, S.speakers)} checked={speakers} onChange={setSpeakers} />
        <Check label={pick(locale, S.sfx)} checked={sfx} onChange={setSfx} />
        <Check label={pick(locale, S.lowercase)} checked={lowercase} onChange={setLowercase} />
      </div>
      <div className="mt-4 max-w-xs">
        <Field label={pick(locale, S.wrap)}>
          <input type="number" min={0} max={120} className="field mono" value={wrapAt} onChange={(e) => setWrapAt(e.target.value)} aria-label={pick(locale, S.wrap)} />
        </Field>
      </div>

      {result ? (
        <>
          <div className="mt-5">
            <Stats
              items={[
                { label: pick(locale, S.cues), value: String(result.cues.length) },
                { label: pick(locale, S.changed), value: String(result.changed) },
                { label: pick(locale, S.dropped), value: String(result.dropped) },
              ]}
            />
          </div>
          {result.cues.length ? (
            <>
              <div className="mt-4">
                <textarea className="field mono bg-[var(--color-surface)]" rows={8} readOnly value={output} aria-label="output" />
              </div>
              <OutBar value={output} filename={detectFormat(input) === "vtt" ? "cleaned.vtt" : "cleaned.srt"} />
            </>
          ) : (
            <div className="mt-4"><Note>—</Note></div>
          )}
        </>
      ) : (
        <div className="mt-4"><Note>{pick(locale, S.empty)}</Note></div>
      )}
      <WarnBox title={pick(locale, S.warnings)} items={parsed?.warnings ?? []} />
      <div className="mt-3"><Note>{pick(locale, S.note)}</Note></div>
    </ToolPanel>
  );
}
