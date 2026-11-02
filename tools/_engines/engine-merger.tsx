"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { ToolPanel } from "@/components/ui";
import {
  detectFormat,
  extractRange,
  formatSubtitle,
  mergeSubtitleTracks,
  parseSubtitle,
  parseTimestamp,
  formatTimestamp,
} from "../_lib/subtitle";
import { Check, Field, Note, OutBar, pick, Stats, SubInput, Tabs, WarnBox } from "./subtitle-ui";

/**
 * 合并/拆分引擎:
 * - merge:两条字幕轨按时间对齐后上下堆叠(双语字幕);
 * - extract:抽取一段时间的 cue(可选裁边、可选把抽出段归零到 00:00)。
 */

const S = {
  inputA: { en: "Primary track (top line)", zh: "主轨(上面一行)", ja: "主トラック(上の行)", es: "Pista principal (línea superior)", pt: "Trilha principal (linha de cima)" },
  inputB: { en: "Secondary track (bottom line)", zh: "副轨(下面一行)", ja: "副トラック(下の行)", es: "Pista secundaria (línea inferior)", pt: "Trilha secundária (linha de baixo)" },
  inputOne: { en: "Subtitle file", zh: "字幕文件", ja: "字幕ファイル", es: "Archivo de subtítulos", pt: "Arquivo de legenda" },
  merge: { en: "Merge two tracks", zh: "合并两条轨", ja: "2 つのトラックを統合", es: "Fusionar dos pistas", pt: "Mesclar duas trilhas" },
  extract: { en: "Extract a time range", zh: "抽取时间段", ja: "時間範囲を抽出", es: "Extraer un rango de tiempo", pt: "Extrair uma faixa de tempo" },
  tolerance: { en: "Align tolerance (ms)", zh: "对齐容差(毫秒)", ja: "整列許容差(ms)", es: "Tolerancia de alineación (ms)", pt: "Tolerância de alinhamento (ms)" },
  keepUnmatched: {
    en: "Keep secondary cues with no primary match",
    zh: "保留没有匹配到主轨的副轨字幕",
    ja: "主トラックに対応のない副トラックのキューを残す",
    es: "Conservar cues secundarios sin correspondencia",
    pt: "Manter cues secundários sem correspondência",
  },
  from: { en: "From (HH:MM:SS.mmm)", zh: "开始(HH:MM:SS.mmm)", ja: "開始(HH:MM:SS.mmm)", es: "Desde (HH:MM:SS.mmm)", pt: "De (HH:MM:SS.mmm)" },
  to: { en: "To (HH:MM:SS.mmm)", zh: "结束(HH:MM:SS.mmm)", ja: "終了(HH:MM:SS.mmm)", es: "Hasta (HH:MM:SS.mmm)", pt: "Até (HH:MM:SS.mmm)" },
  clamp: { en: "Trim cues to the range", zh: "把字幕裁剪到区间内", ja: "キューを範囲に切り詰める", es: "Recortar cues al rango", pt: "Aparar cues à faixa" },
  shift: { en: "Start extracted file at 00:00", zh: "抽出结果从 00:00 重新开始", ja: "抽出結果を 00:00 から始める", es: "Empezar el archivo extraído en 00:00", pt: "Começar o arquivo extraído em 00:00" },
  cues: { en: "Cues out", zh: "输出条数", ja: "出力キュー数", es: "Cues out", pt: "Cues out" },
  range: { en: "Range", zh: "区间", ja: "範囲", es: "Rango", pt: "Faixa" },
  warnings: { en: "Parsing notes", zh: "解析提示", ja: "解析メモ", es: "Notas de análisis", pt: "Notas de análise" },
  mergeHint: {
    en: "Both tracks may be SRT or VTT — the result uses the primary track's format.",
    zh: "两条轨可以分别是 SRT 或 VTT——结果采用主轨的格式。",
    ja: "両トラックは SRT / VTT のどちらでも構いません——結果は主トラックの形式になります。",
    es: "Ambas pistas pueden ser SRT o VTT — el resultado usa el formato de la pista principal.",
    pt: "As duas trilhas podem ser SRT ou VTT — o resultado usa o formato da trilha principal.",
  },
  emptyMerge: { en: "Load both tracks to merge them.", zh: "载入两条轨即可合并。", ja: "両トラックを読み込むと統合できます。", es: "Cargue ambas pistas para fusionarlas.", pt: "Carregue as duas trilhas para mesclá-las." },
  emptyExtract: { en: "Load a subtitle file and set the range.", zh: "载入字幕文件并设置时间段。", ja: "字幕ファイルを読み込み、範囲を設定してください。", es: "Cargue un archivo de subtítulos y fije el rango.", pt: "Carregue um arquivo de legenda e defina a faixa." },
  badRange: { en: "The end time must be after the start time.", zh: "结束时间必须晚于开始时间。", ja: "終了時間は開始時間より後にしてください。", es: "El tiempo final debe ser posterior al inicial.", pt: "O tempo final deve ser posterior ao inicial." },
};

export function MergerEngine() {
  const { locale } = useI18n();
  const [mode, setMode] = useState<"merge" | "extract">("merge");

  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [tolerance, setTolerance] = useState("500");
  const [keepUnmatched, setKeepUnmatched] = useState(true);

  const [one, setOne] = useState("");
  const [from, setFrom] = useState("00:00:00.000");
  const [to, setTo] = useState("00:01:00.000");
  const [clamp, setClamp] = useState(true);
  const [shift, setShift] = useState(true);

  const fromMs = parseTimestamp(from);
  const toMs = parseTimestamp(to);

  const parsedA = useMemo(() => (a.trim() ? parseSubtitle(a, detectFormat(a)) : null), [a]);
  const parsedB = useMemo(() => (b.trim() ? parseSubtitle(b, detectFormat(b)) : null), [b]);
  const parsedOne = useMemo(() => (one.trim() ? parseSubtitle(one, detectFormat(one)) : null), [one]);

  let outCues: ReturnType<typeof mergeSubtitleTracks> = [];
  let error = "";
  let outFormat: "srt" | "vtt" = "srt";
  if (mode === "merge") {
    if (parsedA?.cues.length && parsedB?.cues.length) {
      const tol = Math.max(0, parseInt(tolerance || "500", 10) || 0);
      outCues = mergeSubtitleTracks(parsedA.cues, parsedB.cues, { toleranceMs: tol, keepUnmatched });
      outFormat = detectFormat(a);
    }
  } else {
    if (parsedOne?.cues.length && fromMs !== null && toMs !== null) {
      if (toMs < fromMs) {
        error = pick(locale, S.badRange);
      } else {
        const r = extractRange(parsedOne.cues, fromMs, toMs, { clamp, shift });
        if (r) outCues = r;
        outFormat = detectFormat(one);
      }
    }
  }
  const output = outCues.length && !error ? formatSubtitle(outCues, outFormat) : "";
  const rangeLabel =
    fromMs !== null && toMs !== null && toMs >= fromMs ? `${formatTimestamp(fromMs, ",")} – ${formatTimestamp(toMs, ",")}` : "—";

  return (
    <ToolPanel>
      <Tabs
        options={[
          { id: "merge", label: pick(locale, S.merge) },
          { id: "extract", label: pick(locale, S.extract) },
        ]}
        value={mode}
        onChange={(id) => setMode(id as "merge" | "extract")}
      />

      {mode === "merge" ? (
        <>
          <div className="mt-4 grid gap-4">
            <SubInput label={pick(locale, S.inputA)} value={a} onChange={setA} rows={6} aria={pick(locale, S.inputA)} />
            <SubInput label={pick(locale, S.inputB)} value={b} onChange={setB} rows={6} aria={pick(locale, S.inputB)} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label={pick(locale, S.tolerance)}>
              <input type="number" min={0} step={50} className="field mono" value={tolerance} onChange={(e) => setTolerance(e.target.value)} aria-label={pick(locale, S.tolerance)} />
            </Field>
            <div className="self-end pb-1">
              <Check label={pick(locale, S.keepUnmatched)} checked={keepUnmatched} onChange={setKeepUnmatched} />
            </div>
          </div>
          {outCues.length ? (
            <>
              <div className="mt-5"><Stats items={[{ label: pick(locale, S.cues), value: String(outCues.length) }]} /></div>
              <div className="mt-4">
                <textarea className="field mono bg-[var(--color-surface)]" rows={8} readOnly value={output} aria-label="output" />
              </div>
              <OutBar value={output} filename={outFormat === "vtt" ? "merged.vtt" : "merged.srt"} />
            </>
          ) : (
            <div className="mt-4"><Note>{pick(locale, S.emptyMerge)}</Note></div>
          )}
          <div className="mt-3"><Note>{pick(locale, S.mergeHint)}</Note></div>
          <WarnBox title={pick(locale, S.warnings)} items={[...(parsedA?.warnings ?? []), ...(parsedB?.warnings ?? [])]} />
        </>
      ) : (
        <>
          <div className="mt-4">
            <SubInput label={pick(locale, S.inputOne)} value={one} onChange={setOne} rows={7} aria={pick(locale, S.inputOne)} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label={pick(locale, S.from)}>
              <input type="text" className="field mono" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="00:00:30.000" aria-label={pick(locale, S.from)} />
            </Field>
            <Field label={pick(locale, S.to)}>
              <input type="text" className="field mono" value={to} onChange={(e) => setTo(e.target.value)} placeholder="00:05:00.000" aria-label={pick(locale, S.to)} />
            </Field>
          </div>
          <div className="mt-3 space-y-2">
            <Check label={pick(locale, S.clamp)} checked={clamp} onChange={setClamp} />
            <Check label={pick(locale, S.shift)} checked={shift} onChange={setShift} />
          </div>
          {error ? (
            <div className="mt-4"><Note>{error}</Note></div>
          ) : outCues.length ? (
            <>
              <div className="mt-5">
                <Stats
                  items={[
                    { label: pick(locale, S.cues), value: String(outCues.length) },
                    { label: pick(locale, S.range), value: rangeLabel },
                  ]}
                />
              </div>
              <div className="mt-4">
                <textarea className="field mono bg-[var(--color-surface)]" rows={8} readOnly value={output} aria-label="output" />
              </div>
              <OutBar value={output} filename={outFormat === "vtt" ? "extracted.vtt" : "extracted.srt"} />
            </>
          ) : (
            <div className="mt-4"><Note>{pick(locale, S.emptyExtract)}</Note></div>
          )}
          <WarnBox title={pick(locale, S.warnings)} items={parsedOne?.warnings ?? []} />
        </>
      )}
    </ToolPanel>
  );
}
