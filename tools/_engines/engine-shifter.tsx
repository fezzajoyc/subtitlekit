"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { ToolPanel } from "@/components/ui";
import {
  detectFormat,
  formatSubtitle,
  fpsScale,
  parseSubtitle,
  scaleTimestamps,
  shiftTimestamps,
  type Cue,
} from "../_lib/subtitle";
import { Check, Field, Note, OutBar, pick, Stats, SubInput, Tabs, WarnBox } from "./subtitle-ui";

/**
 * 时间轴引擎:整体平移(±时/分/秒/毫秒)或按帧率缩放。
 * 输入格式自动嗅探,输出保持同一格式;负时间默认截断到 00:00:00,000。
 */

const S = {
  input: { en: "Subtitle file (SRT or VTT)", zh: "字幕文件(SRT 或 VTT)", ja: "字幕ファイル(SRT / VTT)", es: "Archivo de subtítulos (SRT o VTT)", pt: "Arquivo de legenda (SRT ou VTT)" },
  modeShift: { en: "Shift by offset", zh: "整体平移", ja: "オフセットでズラす", es: "Desplazar por offset", pt: "Deslocar por offset" },
  modeScale: { en: "Scale for fps change", zh: "按帧率缩放", ja: "fps 変更でスケール", es: "Escalar por cambio de fps", pt: "Escalar por mudança de fps" },
  offset: { en: "Offset", zh: "偏移量", ja: "オフセット", es: "Desplazamiento", pt: "Deslocamento" },
  later: { en: "Later", zh: "延后", ja: "遅らせる", es: "Más tarde", pt: "Mais tarde" },
  earlier: { en: "Earlier", zh: "提前", ja: "早める", es: "Más temprano", pt: "Mais cedo" },
  h: { en: "hours", zh: "时", ja: "時間", es: "horas", pt: "horas" },
  m: { en: "min", zh: "分", ja: "分", es: "min", pt: "min" },
  s: { en: "sec", zh: "秒", ja: "秒", es: "seg", pt: "seg" },
  ms: { en: "ms", zh: "毫秒", ja: "ミリ秒", es: "ms", pt: "ms" },
  factor: { en: "Scale factor", zh: "缩放系数", ja: "スケール係数", es: "Factor de escala", pt: "Fator de escala" },
  factorHint: {
    en: "new time = old time × factor. Presets for the common frame-rate conversions:",
    zh: "新时间 = 原时间 × 系数。常用帧率换算预设:",
    ja: "新しい時間 = 元の時間 × 係数。よく使うフレームレート変換:",
    es: "tiempo nuevo = tiempo anterior × factor. Preajustes habituales:",
    pt: "tempo novo = tempo antigo × fator. Predefinições comuns:",
  },
  clamp: {
    en: "Clamp at 00:00:00,000 (times pushed before zero stay at zero)",
    zh: "在 00:00:00,000 处截断(提前到负数的时间停在 0)",
    ja: "00:00:00,000 でクランプ(ゼロより前の時間は 0 に止まる)",
    es: "Recortar en 00:00:00,000 (los tiempos antes de cero se quedan en cero)",
    pt: "Limitar em 00:00:00,000 (tempos antes de zero ficam em zero)",
  },
  cues: { en: "Cues", zh: "字幕条数", ja: "キュー数", es: "Cues", pt: "Cues" },
  firstCue: { en: "First cue starts", zh: "首条开始", ja: "最初のキュー開始", es: "Primer cue", pt: "Primeiro cue" },
  lastCue: { en: "Last cue ends", zh: "末条结束", ja: "最後のキュー終了", es: "Último cue", pt: "Último cue" },
  warnings: { en: "Parsing notes", zh: "解析提示", ja: "解析メモ", es: "Notas de análisis", pt: "Notas de análise" },
  empty: { en: "Paste or load a subtitle file to shift its timeline.", zh: "粘贴或载入字幕文件即可平移时间轴。", ja: "字幕ファイルを貼り付けたり読み込んだりするとタイムラインをずらせます。", es: "Pegue o cargue un archivo de subtítulos para desplazar su línea de tiempo.", pt: "Cole ou carregue um arquivo de legenda para deslocar a linha do tempo." },
  badFactor: { en: "Scale factor must be a positive number, e.g. 1.042709", zh: "缩放系数必须是正数,例如 1.042709", ja: "スケール係数は正の数で指定してください(例 1.042709)", es: "El factor de escala debe ser un número positivo, p. ej. 1.042709", pt: "O fator de escala deve ser um número positivo, ex. 1.042709" },
};

const PRESETS: [number, number][] = [
  [25, 23.976],
  [23.976, 25],
  [24, 25],
  [25, 24],
  [29.97, 25],
  [23.976, 29.97],
];

function presetLabel(from: number, to: number): string {
  const f = (n: number) => (Number.isInteger(n) ? String(n) : String(n));
  return `${f(from)}fps → ${f(to)}fps`;
}

export function ShifterEngine() {
  const { locale } = useI18n();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"shift" | "scale">("shift");
  const [later, setLater] = useState(true);
  const [h, setH] = useState("0");
  const [m, setM] = useState("0");
  const [sec, setSec] = useState("0");
  const [ms, setMs] = useState("500");
  const [factor, setFactor] = useState("1");
  const [clamp, setClamp] = useState(true);

  const offsetMs =
    (later ? 1 : -1) *
    ((Math.abs(parseInt(h || "0", 10) || 0) * 3600 + Math.abs(parseInt(m || "0", 10) || 0) * 60 + Math.abs(parseInt(sec || "0", 10) || 0)) * 1000 +
      Math.abs(parseInt(ms || "0", 10) || 0));

  const parsed = useMemo(() => (input.trim() ? parseSubtitle(input, detectFormat(input)) : null), [input]);
  const factorNum = parseFloat(factor.replace(",", "."));
  const scale = mode === "scale" ? scaleTimestamps(parsed?.cues ?? [], factorNum) : undefined;

  let outCues: Cue[] = [];
  let error = "";
  if (parsed) {
    if (mode === "shift") {
      outCues = shiftTimestamps(parsed.cues, offsetMs, { clamp });
    } else if (scale) {
      outCues = scale;
    } else if (factor.trim() !== "" && !Number.isNaN(factorNum)) {
      error = pick(locale, S.badFactor);
    }
  }
  const output = parsed && outCues.length && !error ? formatSubtitle(outCues, detectFormat(input)) : "";
  const firstStart = outCues.length ? outCues[0].start : 0;
  const lastEnd = outCues.length ? outCues[outCues.length - 1].end : 0;
  const ts = (n: number) => {
    const t = Math.max(0, n);
    const p2 = (x: number) => String(x).padStart(2, "0");
    return `${p2(Math.floor(t / 3600000))}:${p2(Math.floor((t % 3600000) / 60000))}:${p2(Math.floor((t % 60000) / 1000))},${String(t % 1000).padStart(3, "0")}`;
  };

  return (
    <ToolPanel>
      <SubInput label={pick(locale, S.input)} value={input} onChange={setInput} rows={8} aria={pick(locale, S.input)} />

      <div className="mt-4">
        <Tabs
          options={[
            { id: "shift", label: pick(locale, S.modeShift) },
            { id: "scale", label: pick(locale, S.modeScale) },
          ]}
          value={mode}
          onChange={(id) => setMode(id as "shift" | "scale")}
        />
      </div>

      {mode === "shift" ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={pick(locale, S.offset)}>
            <div className="flex flex-wrap items-center gap-2">
              <Tabs
                options={[
                  { id: "later", label: pick(locale, S.later) },
                  { id: "earlier", label: pick(locale, S.earlier) },
                ]}
                value={later ? "later" : "earlier"}
                onChange={(id) => setLater(id === "later")}
              />
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {([
                [h, setH, S.h],
                [m, setM, S.m],
                [sec, setSec, S.s],
                [ms, setMs, S.ms],
              ] as const).map(([v, set, lab], i) => (
                <label key={i} className="flex items-center gap-1.5 rounded-xl border hairline px-2.5 py-2">
                  <input
                    type="number"
                    min={0}
                    className="mono w-full min-w-0 bg-transparent text-[14px] outline-none"
                    value={v}
                    onChange={(e) => set(e.target.value)}
                    aria-label={pick(locale, lab)}
                  />
                  <span className="shrink-0 text-[11.5px] text-[var(--color-sub)]">{pick(locale, lab)}</span>
                </label>
              ))}
            </div>
          </Field>
          <div className="space-y-2 self-end">
            <Check label={pick(locale, S.clamp)} checked={clamp} onChange={setClamp} />
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={pick(locale, S.factor)}>
            <input type="text" className="field mono" value={factor} onChange={(e) => setFactor(e.target.value)} inputMode="decimal" aria-label={pick(locale, S.factor)} />
            <div className="mt-2"><Note>{pick(locale, S.factorHint)}</Note></div>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESETS.map(([from, to]) => (
                <button
                  key={`${from}-${to}`}
                  type="button"
                  onClick={() => setFactor((fpsScale(from, to) ?? 1).toFixed(6))}
                  className="rounded-full border hairline px-3 py-1 text-[12.5px] font-medium transition-colors hover:bg-[var(--color-surface)]"
                >
                  {presetLabel(from, to)}
                </button>
              ))}
            </div>
          </Field>
        </div>
      )}

      {parsed && outCues.length ? (
        <>
          <div className="mt-5">
            <Stats
              items={[
                { label: pick(locale, S.cues), value: String(outCues.length) },
                { label: pick(locale, S.firstCue), value: ts(firstStart) },
                { label: pick(locale, S.lastCue), value: ts(lastEnd) },
              ]}
            />
          </div>
          <div className="mt-4">
            <textarea className="field mono bg-[var(--color-surface)]" rows={8} readOnly value={output} aria-label="output" />
          </div>
          <OutBar value={output} filename={detectFormat(input) === "vtt" ? "shifted.vtt" : "shifted.srt"} />
        </>
      ) : (
        <div className="mt-4"><Note>{error || pick(locale, S.empty)}</Note></div>
      )}
      <WarnBox title={pick(locale, S.warnings)} items={parsed?.warnings ?? []} />
    </ToolPanel>
  );
}
