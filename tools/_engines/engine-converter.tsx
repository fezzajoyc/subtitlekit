"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { ToolPanel } from "@/components/ui";
import { detectFormat, formatSubtitle, parseSubtitle, type SubFormat } from "../_lib/subtitle";
import { Field, Note, OutBar, pick, Stats, SubInput, Tabs, WarnBox } from "./subtitle-ui";

/**
 * SRT ↔ WebVTT 双向转换引擎:格式自动嗅探,输出统一重建
 * (BOM/CRLF 清理、时间戳规范化、SRT 序号重建、VTT cue settings 保留)。
 */

const S = {
  input: { en: "Subtitle file (paste or load)", zh: "字幕文件(粘贴或载入)", ja: "字幕ファイル(貼り付け or 読み込み)", es: "Archivo de subtítulos (pegar o cargar)", pt: "Arquivo de legenda (cole ou carregue)" },
  target: { en: "Convert to", zh: "转换为", ja: "変換先", es: "Convertir a", pt: "Converter para" },
  detected: { en: "Detected input", zh: "检测到输入格式", ja: "検出された入力", es: "Formato detectado", pt: "Formato detectado" },
  normalized: {
    en: "Input is already {f} — output is the normalized version (clean line endings, rebuilt numbering).",
    zh: "输入已是 {f} 格式——输出为其规范化版本(清理换行、重建序号)。",
    ja: "入力は既に {f} 形式です——出力は整形済みバージョン(改行の整理・番号の再構築)。",
    es: "La entrada ya es {f} — la salida es la versión normalizada (saltos de línea limpios, numeración reconstruida).",
    pt: "A entrada já é {f} — a saída é a versão normalizada (quebras limpas, numeração reconstruída).",
  },
  cues: { en: "Cues", zh: "字幕条数", ja: "キュー数", es: "Cues", pt: "Cues" },
  warnings: { en: "Parsing notes", zh: "解析提示", ja: "解析メモ", es: "Notas de análisis", pt: "Notas de análise" },
  pasteHint: {
    en: "Paste SRT or WebVTT content above — the format is detected automatically.",
    zh: "在上方粘贴 SRT 或 WebVTT 内容——格式会自动识别。",
    ja: "上に SRT または WebVTT の内容を貼り付けると、形式を自動判定します。",
    es: "Pegue arriba el contenido SRT o WebVTT — el formato se detecta automáticamente.",
    pt: "Cole acima o conteúdo SRT ou WebVTT — o formato é detectado automaticamente.",
  },
};

export function ConverterEngine() {
  const { t, locale } = useI18n();
  const [input, setInput] = useState("");
  const [target, setTarget] = useState<SubFormat>("vtt");

  const parsed = useMemo(() => (input.trim() ? parseSubtitle(input, detectFormat(input)) : null), [input]);
  const detected = input.trim() ? detectFormat(input) : null;
  const output = useMemo(() => (parsed && parsed.cues.length ? formatSubtitle(parsed.cues, target) : ""), [parsed, target]);
  const sameFormat = detected !== null && detected === target;

  return (
    <ToolPanel>
      <SubInput label={pick(locale, S.input)} value={input} onChange={setInput} rows={9} aria={pick(locale, S.input)} />

      <div className="mt-4">
        <Field label={pick(locale, S.target)}>
          <Tabs
            options={[
              { id: "vtt", label: "WebVTT (.vtt)" },
              { id: "srt", label: "SubRip (.srt)" },
            ]}
            value={target}
            onChange={(id) => setTarget(id as SubFormat)}
          />
        </Field>
      </div>

      {parsed && detected ? (
        <>
          <div className="mt-5">
            <Stats
              items={[
                { label: pick(locale, S.detected), value: detected === "vtt" ? "WebVTT" : "SubRip (SRT)" },
                { label: pick(locale, S.cues), value: String(parsed.cues.length) },
              ]}
            />
          </div>
          {parsed.cues.length ? (
            <>
              <div className="mt-4">
                <Field label={t.common.output}>
                  <textarea
                    className="field mono bg-[var(--color-surface)]"
                    rows={9}
                    readOnly
                    value={output}
                    aria-label={t.common.output}
                  />
                </Field>
              </div>
              <OutBar value={output} filename={target === "vtt" ? "subtitles.vtt" : "subtitles.srt"} />
              {sameFormat ? <div className="mt-3"><Note>{pick(locale, S.normalized).replace("{f}", detected === "vtt" ? "WebVTT" : "SRT")}</Note></div> : null}
            </>
          ) : (
            <div className="mt-4"><Note>{t.common.error}</Note></div>
          )}
          <WarnBox title={pick(locale, S.warnings)} items={parsed.warnings} />
        </>
      ) : (
        <div className="mt-4"><Note>{pick(locale, S.pasteHint)}</Note></div>
      )}
    </ToolPanel>
  );
}
