"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { ToolPanel } from "@/components/ui";
import {
  analyzeCues,
  detectFormat,
  fixOverlaps,
  formatSubtitle,
  parseSubtitle,
  type FixReport,
  type FixType,
  type Issue,
} from "../_lib/subtitle";
import { Field, Note, OutBar, pick, Stats, SubInput, WarnBox } from "./subtitle-ui";

/**
 * 修复引擎:先诊断(乱序/负时长/零时长/重叠/短间隙/空文本),
 * 点应用后执行 fixOverlaps 并给出修复前后对照报告。
 */

const S = {
  input: { en: "Subtitle file (SRT or VTT)", zh: "字幕文件(SRT 或 VTT)", ja: "字幕ファイル(SRT / VTT)", es: "Archivo de subtítulos (SRT o VTT)", pt: "Arquivo de legenda (SRT ou VTT)" },
  report: { en: "Diagnostic report", zh: "诊断报告", ja: "診断レポート", es: "Informe de diagnóstico", pt: "Relatório de diagnóstico" },
  apply: { en: "Apply fixes", zh: "应用修复", ja: "修正を適用", es: "Aplicar correcciones", pt: "Aplicar correções" },
  applied: { en: "Fixes applied", zh: "已应用的修复", ja: "適用された修正", es: "Correcciones aplicadas", pt: "Correções aplicadas" },
  before: { en: "Issues before", zh: "修复前问题", ja: "修正前の問題", es: "Problemas antes", pt: "Problemas antes" },
  after: { en: "Issues after", zh: "修复后问题", ja: "修正後の問題", es: "Problemas después", pt: "Problemas depois" },
  clean: { en: "No fixable timing problems found.", zh: "没有发现可自动修复的时间轴问题。", ja: "自動修正できるタイミングの問題は見つかりませんでした。", es: "No se encontraron problemas de tiempo corregibles.", pt: "Nenhum problema de tempo corrigível encontrado." },
  issues: { en: "issues", zh: "处问题", ja: "件の問題", es: "problemas", pt: "problemas" },
  empty: { en: "Paste or load a subtitle file to run the diagnostic.", zh: "粘贴或载入字幕文件即可开始诊断。", ja: "字幕ファイルを貼り付けたり読み込んだりすると診断を始めます。", es: "Pegue o cargue un archivo de subtítulos para ejecutar el diagnóstico.", pt: "Cole ou carregue um arquivo de legenda para executar o diagnóstico." },
  minGap: { en: "Close gaps shorter than (ms)", zh: "闭合小于此值的间隙(毫秒)", ja: "これより短い隙間を閉じる(ms)", es: "Cerrar huecos menores de (ms)", pt: "Fechar intervalos menores que (ms)" },
  note: {
    en: "Sequence numbers are rebuilt on export; tags like <i> and <font> are never touched.",
    zh: "导出时会重建序号;<i>、<font> 等标签不会被改动。",
    ja: "書き出し時に番号を再構築します。<i> や <font> などのタグは変更しません。",
    es: "La numeración se reconstruye al exportar; las etiquetas <i> y <font> no se tocan.",
    pt: "A numeração é reconstruída ao exportar; tags como <i> e <font> não são alteradas.",
  },
};

const ISSUE_LABEL: Record<IssueType5, Record<string, string>> = {
  "out-of-order": { en: "Out-of-order cues", zh: "乱序字幕", ja: "順序が崩れたキュー", es: "Cues fuera de orden", pt: "Cues fora de ordem" },
  "negative-duration": { en: "Reversed timestamps", zh: "起止写反", ja: "開始・終了が逆", es: "Marcas de tiempo invertidas", pt: "Marcações invertidas" },
  "zero-duration": { en: "Zero-duration cues", zh: "零时长字幕", ja: "表示時間ゼロのキュー", es: "Cues de duración cero", pt: "Cues de duração zero" },
  overlap: { en: "Overlapping cues", zh: "时间重叠", ja: "重なるキュー", es: "Cues superpuestos", pt: "Cues sobrepostos" },
  "short-gap": { en: "Gaps under threshold", zh: "间隙过短", ja: "隙間が短すぎる", es: "Huecos demasiado cortos", pt: "Intervalos curtos demais" },
  "empty-text": { en: "Cues with no text", zh: "空文本字幕", ja: "テキストなしのキュー", es: "Cues sin texto", pt: "Cues sem texto" },
};
type IssueType5 = Issue["type"];

const FIX_LABEL: Record<FixType, Record<string, string>> = {
  reorder: { en: "Reordered cues", zh: "重新排序", ja: "キューを並べ直し", es: "Cues reordenados", pt: "Cues reordenados" },
  reversed: { en: "Swapped reversed timestamps", zh: "交换写反的起止", ja: "逆になった開始・終了を入れ替え", es: "Marcas invertidas intercambiadas", pt: "Marcações invertidas trocadas" },
  "zero-duration": { en: "Gave zero-duration cues a display time", zh: "为零时长字幕补显示时间", ja: "表示時間ゼロのキューに時間を設定", es: "Duración asignada a cues de duración cero", pt: "Duração atribuída a cues de duração zero" },
  overlap: { en: "Trimmed overlaps", zh: "修剪重叠", ja: "重なりをトリム", es: "Superposiciones recortadas", pt: "Sobreposições aparadas" },
  "short-gap": { en: "Closed short gaps", zh: "闭合短间隙", ja: "短い隙間を閉じた", es: "Huecos cortos cerrados", pt: "Intervalos curtos fechados" },
  renumber: { en: "Sequence numbers rebuilt", zh: "重建序号", ja: "番号を再構築", es: "Numeración reconstruida", pt: "Numeração reconstruída" },
};

export function FixerEngine() {
  const { locale } = useI18n();
  const [input, setInput] = useState("");
  const [minGap, setMinGap] = useState("100");
  const [applied, setApplied] = useState<FixReport[] | null>(null);

  const parsed = useMemo(() => (input.trim() ? parseSubtitle(input, detectFormat(input)) : null), [input]);
  const gap = Math.max(0, parseInt(minGap || "100", 10) || 0);
  const before = useMemo(() => (parsed ? analyzeCues(parsed.cues, { minGapMs: gap }) : []), [parsed, gap]);

  const fixed = useMemo(() => {
    if (applied === null || !parsed) return null;
    return fixOverlaps(parsed.cues, { minGapMs: gap });
  }, [applied, parsed, gap]);

  const after = useMemo(() => (fixed ? analyzeCues(fixed.cues, { minGapMs: gap }) : []), [fixed, gap]);
  const output = fixed ? formatSubtitle(fixed.cues, detectFormat(input)) : "";

  const countBy = (issues: Issue[]) => {
    const m = new Map<IssueType5, number>();
    for (const i of issues) m.set(i.type, (m.get(i.type) ?? 0) + 1);
    return m;
  };
  const beforeCounts = countBy(before);
  const afterCounts = countBy(after);
  const types: IssueType5[] = ["out-of-order", "negative-duration", "zero-duration", "overlap", "short-gap", "empty-text"];

  return (
    <ToolPanel>
      <SubInput label={pick(locale, S.input)} value={input} onChange={setInput} rows={8} aria={pick(locale, S.input)} />

      {parsed ? (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label={pick(locale, S.minGap)}>
              <input type="number" min={0} step={10} className="field mono" value={minGap} onChange={(e) => setMinGap(e.target.value)} aria-label={pick(locale, S.minGap)} />
            </Field>
          </div>

          <div className="mt-5 rounded-xl border hairline px-4 py-3.5">
            <p className="text-[13px] font-semibold">{pick(locale, S.report)}</p>
            <table className="mt-2 w-full text-[13.5px]">
              <thead>
                <tr className="text-left text-[12px] text-[var(--color-sub)]">
                  <th className="py-1 font-medium"> </th>
                  <th className="py-1 text-right font-medium">{pick(locale, S.before)}</th>
                  <th className="py-1 text-right font-medium">{pick(locale, S.after)}</th>
                </tr>
              </thead>
              <tbody>
                {types.map((ty) => (
                  <tr key={ty} className="border-t hairline">
                    <td className="py-1.5">{pick(locale, ISSUE_LABEL[ty])}</td>
                    <td className="mono py-1.5 text-right">{beforeCounts.get(ty) ?? 0}</td>
                    <td className="mono py-1.5 text-right">{fixed ? (afterCounts.get(ty) ?? 0) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {before.length > 0 ? (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setApplied([])}
                className="rounded-full bg-[var(--color-ink)] px-4 py-2 text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                {pick(locale, S.apply)}
              </button>
            </div>
          ) : (
            <div className="mt-4"><Note>{pick(locale, S.clean)}</Note></div>
          )}

          {fixed ? (
            <>
              <div className="mt-5">
                <Stats
                  items={[
                    { label: pick(locale, S.before), value: `${before.length} ${pick(locale, S.issues)}`, tone: before.length ? "bad" : "good" },
                    { label: pick(locale, S.after), value: `${after.length} ${pick(locale, S.issues)}`, tone: after.length ? "bad" : "good" },
                  ]}
                />
              </div>
              <div className="mt-4">
                <textarea className="field mono bg-[var(--color-surface)]" rows={8} readOnly value={output} aria-label="output" />
              </div>
              <OutBar value={output} filename={detectFormat(input) === "vtt" ? "fixed.vtt" : "fixed.srt"} />
              <WarnBox
                title={pick(locale, S.applied)}
                items={(fixed.fixes ?? []).filter((f) => f.type !== "renumber" || f.count > 0).map((f) => `${pick(locale, FIX_LABEL[f.type])}: ${f.count}`)}
              />
            </>
          ) : null}
          <div className="mt-4"><Note>{pick(locale, S.note)}</Note></div>
        </>
      ) : (
        <div className="mt-4"><Note>{pick(locale, S.empty)}</Note></div>
      )}
    </ToolPanel>
  );
}
