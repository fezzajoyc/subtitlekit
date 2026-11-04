"use client";

import { useRef, useState, type ReactNode } from "react";
import { useI18n } from "@/components/i18n-provider";
import { CopyButton, downloadBlob } from "@/components/client-ui";
import type { Locale } from "@/lib/site";

/** SubtitleKit 引擎共用的轻量 UI 原语与取词助手(全部客户端组件)。 */

/** 引擎内的每语言短文案:按 locale 取,缺省回退英文。 */
export function pick(locale: Locale, rec: Record<string, string>): string {
  return rec[locale] ?? rec.en;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="block text-[13px] font-medium text-[var(--color-sub)]">{label}</span>
      {children}
    </div>
  );
}

/** 分段胶囊切换(srt/vtt、模式切换)。 */
export function Tabs({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={value === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
            value === o.id
              ? "border-transparent bg-[var(--color-ink)] text-white dark:bg-white dark:text-[#1d1d1f]"
              : "hairline hover:bg-[var(--color-surface)]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="text-[13px] leading-5 text-[var(--color-sub)]">{children}</p>;
}

/** 复选框行。 */
export function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[13.5px] leading-5">
      <input
        type="checkbox"
        className="h-4 w-4 accent-[var(--color-ink)]"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

/**
 * 字幕输入框:textarea + 本地文件载入按钮(.srt/.vtt/.txt)。
 * 文件用 File.text() 读入,仍是纯客户端,零上传。
 */
export function SubInput({
  label,
  value,
  onChange,
  rows = 8,
  aria,
  onLoad,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  aria: string;
  onLoad?: (name: string) => void;
}) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  const readFile = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    setFileName(file.name);
    onChange(text);
    onLoad?.(file.name);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-[var(--color-sub)]">{label}</span>
        <span className="flex items-center gap-2">
          {fileName ? <span className="mono max-w-[180px] truncate text-[11.5px] text-[var(--color-sub)]">{fileName}</span> : null}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-full border hairline px-2.5 py-1 text-[12px] font-medium transition-colors hover:bg-[var(--color-surface)]"
          >
            {t.common.dropFile}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".srt,.vtt,.txt,text/plain"
            className="hidden"
            onChange={(e) => {
              void readFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </span>
      </div>
      <textarea
        className="field mono bg-[var(--color-surface)]"
        rows={rows}
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={aria}
        placeholder={"1\n00:00:01,000 --> 00:00:04,000\nHello world"}
      />
    </div>
  );
}

/** 输出工具条:复制 + 下载。 */
export function OutBar({ value, filename }: { value: string; filename: string }) {
  const { t } = useI18n();
  if (!value) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <CopyButton value={value} />
      <button
        type="button"
        onClick={() => downloadBlob(new Blob([value], { type: "text/plain;charset=utf-8" }), filename)}
        className="inline-flex items-center gap-1.5 rounded-full border hairline px-3.5 py-1.5 text-[13px] font-medium transition-colors hover:bg-[var(--color-surface)]"
      >
        {t.common.download} {filename}
      </button>
    </div>
  );
}

/** 解析警告/诊断列表(黄色系提示框)。 */
export function WarnBox({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-4 rounded-xl border hairline bg-[var(--color-surface)] px-4 py-3">
      <p className="text-[12.5px] font-semibold text-[var(--color-ink)]">{title}</p>
      <ul className="mt-1.5 space-y-1">
        {items.map((w, i) => (
          <li key={i} className="mono text-[12px] leading-5 text-[var(--color-sub)]">
            {w}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 小统计格。 */
export function Stats({ items }: { items: { label: string; value: string; tone?: "good" | "bad" }[] }) {
  const tone = (t?: string) =>
    t === "good" ? "text-[var(--color-good)]" : t === "bad" ? "text-[var(--color-bad)]" : "text-[var(--color-ink)]";
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl border hairline px-3.5 py-3">
          <div className="text-[12.5px] font-medium text-[var(--color-sub)]">{it.label}</div>
          <div className={`mono mt-1 text-[17px] font-semibold leading-6 ${tone(it.tone)}`} aria-live="polite">
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}
