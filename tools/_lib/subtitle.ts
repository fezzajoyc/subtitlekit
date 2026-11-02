/**
 * SubtitleKit 字幕核心库:纯函数、零依赖、Node 可测。
 * 时间一律用毫秒整数(自字幕 00:00:00 起算),文本保留原始换行。
 *
 * 设计取舍:
 * - 解析"宽容"(BOM/CRLF/缺失序号/点逗号混用都吃),输出"规范"(format* 统一重建)。
 * - 解析器不丢数据也不猜:结构坏块跳过并记入 warnings,由上层(引擎/MCP)呈现。
 * - 修复(排序/重叠/间隙/时长)集中在 fixOverlaps,诊断在 analyzeCues——先报后修。
 */

export type Cue = {
  /** 开始时间,毫秒,≥ 0 */
  start: number;
  /** 结束时间,毫秒(可为 0 或 < start,交给 analyze/fix 报告) */
  end: number;
  /** 字幕文本,内部换行一律 \n;保留 <i> 等标签原样 */
  text: string;
  /** VTT cue settings(如 "align:start line:0"),SRT 无 */
  settings?: string;
};

export type SubFormat = "srt" | "vtt";

export type ParseResult = {
  cues: Cue[];
  /** 结构性警告(坏块跳过、缺 WEBVTT 头等),英文技术文案 */
  warnings: string[];
};

/* ------------------------------------------------------------------ */
/* 时间戳:解析与格式化                                                  */
/* ------------------------------------------------------------------ */

/**
 * 解析单个时间戳。接受:
 *   HH:MM:SS,mmm / HH:MM:SS.mmm(SRT 与宽松 VTT)
 *   MM:SS.mmm / MM:SS,mmm(VTT 允许省略小时)
 *   毫秒可省(→ 0),1–3 位按右对齐解释:"5"→500ms,"50"→500ms,"500"→500ms
 * 分钟/秒必须两位且 ≤ 59;非法输入返回 null,不抛异常。
 */
export function parseTimestamp(raw: string): number | null {
  const m = /^\s*(?:(\d{1,3}):)?(\d{2}):(\d{2})(?:[.,](\d{1,3}))?\s*$/.exec(raw);
  if (!m) return null;
  const min = parseInt(m[2], 10);
  const s = parseInt(m[3], 10);
  if (min > 59 || s > 59) return null;
  const h = m[1] ? parseInt(m[1], 10) : 0;
  const msRaw = m[4] ?? "";
  const ms = msRaw ? parseInt(msRaw, 10) * 10 ** (3 - msRaw.length) : 0;
  return ((h * 60 + min) * 60 + s) * 1000 + ms;
}

/** 毫秒 → "HH:MM:SS,mmm"(sep 用 "," 为 SRT、"。" 不存在——VTT 传 ".")。负数按 0 截断。 */
export function formatTimestamp(ms: number, sep: "," | "." = ","): string {
  const total = Math.max(0, Math.round(ms));
  const h = Math.floor(total / 3600000);
  const m = Math.floor((total % 3600000) / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const milli = total % 1000;
  const two = (n: number) => String(n).padStart(2, "0");
  return `${two(h)}:${two(m)}:${two(s)}${sep}${String(milli).padStart(3, "0")}`;
}

/* ------------------------------------------------------------------ */
/* 解析:SRT / WebVTT                                                   */
/* ------------------------------------------------------------------ */

function normalizeInput(input: string): string {
  // UTF-8 BOM(\uFEFF)剥掉;CRLF/CR 统一为 LF
  return input.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
}

/** 按空行切块(连续 ≥2 个换行视为块边界)。 */
function splitBlocks(lines: string[]): string[][] {
  const blocks: string[][] = [];
  let cur: string[] = [];
  for (const line of lines) {
    if (line.trim() === "") {
      if (cur.length) blocks.push(cur);
      cur = [];
    } else {
      cur.push(line);
    }
  }
  if (cur.length) blocks.push(cur);
  return blocks;
}

/** 解析 "start --> end [settings]" 行;返回 null 表示不是时间轴行。 */
function parseTimingLine(line: string): { start: number; end: number; settings: string } | null {
  const idx = line.indexOf("-->");
  if (idx < 0) return null;
  const left = line.slice(0, idx);
  const right = line.slice(idx + 3);
  const start = parseTimestamp(left);
  // 右侧:结束时间戳 + 可选 cue settings(VTT)
  const rm = /^\s*(\S+(?:[.,]\d{1,3})?)\s*(.*)$/.exec(right);
  const end = rm ? parseTimestamp(rm[1]) : null;
  if (start === null || end === null) return null;
  return { start, end, settings: (rm?.[2] ?? "").trim() };
}

/** SRT:序号行 + "HH:MM:SS,mmm --> HH:MM:SS,mmm" + 文本行。宽容缺失序号、坏块跳过记警告。 */
export function parseSrt(input: string): ParseResult {
  const warnings: string[] = [];
  const blocks = splitBlocks(normalizeInput(input).split("\n"));
  const cues: Cue[] = [];
  let blockNo = 0;
  for (const block of blocks) {
    blockNo++;
    const timingIdx = block.findIndex((l) => l.includes("-->"));
    if (timingIdx < 0) {
      warnings.push(`block ${blockNo}: no timing line, skipped`);
      continue;
    }
    const timing = parseTimingLine(block[timingIdx]);
    if (!timing) {
      warnings.push(`block ${blockNo}: malformed timestamp, skipped`);
      continue;
    }
    // 时间轴行之前:只允许序号行;出现其他文字记警告(常见于错位文件)
    for (const pre of block.slice(0, timingIdx)) {
      if (!/^\s*\d+\s*$/.test(pre)) {
        warnings.push(`block ${blockNo}: unexpected text before timing line, ignored`);
        break;
      }
    }
    const textLines = block.slice(timingIdx + 1);
    cues.push({ start: timing.start, end: timing.end, text: textLines.join("\n").trimEnd() });
  }
  if (cues.length === 0 && warnings.length === 0 && blocks.length === 0) {
    warnings.push("empty input");
  }
  return { cues, warnings };
}

const VTT_SKIP = /^(WEBVTT|NOTE|STYLE|REGION|SOURCE)\b/i;

/**
 * WebVTT:WEBVTT 头 + 可选 identifier 行 + 时间轴(含 cue settings)+ 文本。
 * NOTE/STYLE/REGION 块跳过;头缺失记警告但继续解析(宽容)。
 */
export function parseVtt(input: string): ParseResult {
  const warnings: string[] = [];
  const blocks = splitBlocks(normalizeInput(input).split("\n"));
  const cues: Cue[] = [];
  let headerSeen = false;
  let blockNo = 0;
  for (const block of blocks) {
    blockNo++;
    if (blockNo === 1 && /^WEBVTT\b/i.test(block[0])) {
      headerSeen = true;
      continue;
    }
    if (VTT_SKIP.test(block[0]) && !block.some((l) => l.includes("-->"))) {
      // NOTE(可多行)/STYLE/REGION 整块跳过
      continue;
    }
    const timingIdx = block.findIndex((l) => l.includes("-->"));
    if (timingIdx < 0) {
      warnings.push(`block ${blockNo}: no timing line, skipped`);
      continue;
    }
    const timing = parseTimingLine(block[timingIdx]);
    if (!timing) {
      warnings.push(`block ${blockNo}: malformed timestamp, skipped`);
      continue;
    }
    // 时间轴行之前:VTT 允许至多一行 cue identifier
    if (timingIdx > 1) {
      warnings.push(`block ${blockNo}: extra lines before timing line, ignored`);
    }
    const textLines = block.slice(timingIdx + 1);
    const cue: Cue = { start: timing.start, end: timing.end, text: textLines.join("\n").trimEnd() };
    if (timing.settings) cue.settings = timing.settings;
    cues.push(cue);
  }
  if (!headerSeen && blocks.length > 0) {
    warnings.push("missing WEBVTT header");
  }
  if (cues.length === 0 && blocks.length === 0) {
    warnings.push("empty input");
  }
  return { cues, warnings };
}

/** 内容嗅探:WEBVTT 开头 → vtt,否则按 srt。 */
export function detectFormat(input: string): SubFormat {
  return /^WEBVTT\b/i.test(normalizeInput(input).trimStart()) ? "vtt" : "srt";
}

export function parseSubtitle(input: string, format: SubFormat): ParseResult {
  return format === "vtt" ? parseVtt(input) : parseSrt(input);
}

/* ------------------------------------------------------------------ */
/* 格式化:SRT / WebVTT                                                 */
/* ------------------------------------------------------------------ */

/** cue 文本里的内部空行会切断 SRT/VTT 块,格式化时压成单换行。 */
function safeText(text: string): string {
  return text.replace(/\n{2,}/g, "\n").trim();
}

export function formatSrt(cues: Cue[]): string {
  const parts: string[] = [];
  cues.forEach((cue, i) => {
    const block = [
      String(i + 1),
      `${formatTimestamp(cue.start, ",")} --> ${formatTimestamp(cue.end, ",")}`,
      safeText(cue.text),
    ];
    parts.push(block.join("\n"));
  });
  return parts.length ? parts.join("\n\n") + "\n" : "";
}

export function formatVtt(cues: Cue[]): string {
  const parts: string[] = ["WEBVTT"];
  cues.forEach((cue) => {
    const lines = [`${formatTimestamp(cue.start, ".")} --> ${formatTimestamp(cue.end, ".")}${cue.settings ? ` ${cue.settings.trim()}` : ""}`];
    const text = safeText(cue.text);
    if (text) lines.push(text);
    parts.push(lines.join("\n"));
  });
  return parts.join("\n\n") + "\n";
}

export function formatSubtitle(cues: Cue[], format: SubFormat): string {
  return format === "vtt" ? formatVtt(cues) : formatSrt(cues);
}

/* ------------------------------------------------------------------ */
/* 时间轴变换:平移 / 缩放                                              */
/* ------------------------------------------------------------------ */

/**
 * 全部时间戳平移 offsetMs(正 = 延后,负 = 提前)。
 * clamp(默认 true):结果 < 0 截为 0——字幕时间轴不允许负数。
 */
export function shiftTimestamps(cues: Cue[], offsetMs: number, opts?: { clamp?: boolean }): Cue[] {
  const clamp = opts?.clamp ?? true;
  return cues.map((cue) => {
    const start = cue.start + offsetMs;
    const end = cue.end + offsetMs;
    return {
      ...cue,
      start: clamp ? Math.max(0, start) : start,
      end: clamp ? Math.max(0, end) : end,
    };
  });
}

/**
 * 全部时间戳乘 factor(四舍五入到整毫秒)。
 * 用途:帧率换算(25fps→23.976fps 的片源,时间轴需 ×25/23.976)。
 * factor 非有限或 ≤ 0 返回 null(非法输入不抛异常)。
 */
export function scaleTimestamps(cues: Cue[], factor: number): Cue[] | null {
  if (!Number.isFinite(factor) || factor <= 0) return null;
  return cues.map((cue) => ({
    ...cue,
    start: Math.round(cue.start * factor),
    end: Math.round(cue.end * factor),
  }));
}

/** 规范帧率:23.976/29.97 这类 NTSC 帧率用精确分数,避免累积误差。 */
export function canonicalFps(fps: number): number {
  if (Math.abs(fps - 23.976) < 0.01) return 24000 / 1001;
  if (Math.abs(fps - 29.97) < 0.01) return 30000 / 1001;
  if (Math.abs(fps - 59.94) < 0.01) return 60000 / 1001;
  if (Math.abs(fps - 47.952) < 0.01) return 48000 / 1001;
  return fps;
}

/**
 * 字幕从 fromFps 片源迁移到 toFps 片源的时间缩放系数 = fromFps / toFps。
 * 例:为 25fps(PAL 加速版)做的字幕用到 23.976fps 原速片上,factor = 25 / 23.976 ≈ 1.04271。
 * 任一帧率 ≤ 0 返回 null。
 */
export function fpsScale(fromFps: number, toFps: number): number | null {
  const from = canonicalFps(fromFps);
  const to = canonicalFps(toFps);
  if (!(from > 0) || !(to > 0)) return null;
  return from / to;
}

/* ------------------------------------------------------------------ */
/* 合并(双语上下堆叠)与区间抽取                                        */
/* ------------------------------------------------------------------ */

export type MergeOptions = {
  /** 主轨 cue 与副轨 cue 的最小时间距离(无重叠时按区间距离对齐),默认 500ms */
  toleranceMs?: number;
  /** 副轨中对不上主轨的 cue 是否原样保留,默认 true */
  keepUnmatched?: boolean;
  /** 双语文本之间的额外空行数,默认 0(仅一个换行);1 = 中间隔一个空行 */
  blankLines?: number;
};

function overlapOf(a: Cue, b: Cue): number {
  return Math.min(a.end, b.end) - Math.max(a.start, b.start);
}

/**
 * 合并两条字幕轨为双语:主轨(A,如中文)在上,副轨(B,如英文)在下。
 * 对齐规则:优先取与主轨 cue 时间重叠最长的副轨 cue;无重叠时取区间距离 ≤ tolerance 的最近者。
 * 1:1 贪心分配(已用过的副轨 cue 不复用);文本相同(同语言重复)时只保留一份。
 */
export function mergeSubtitleTracks(primary: Cue[], secondary: Cue[], opts?: MergeOptions): Cue[] {
  const toleranceMs = opts?.toleranceMs ?? 500;
  const keepUnmatched = opts?.keepUnmatched ?? true;
  const blank = Math.max(0, opts?.blankLines ?? 0);
  const gap = blank > 0 ? "\n".repeat(blank + 1) : "\n";
  const used = new Set<number>();
  const out: Cue[] = [];

  for (const a of primary) {
    let bestIdx = -1;
    let bestScore = -Infinity;
    for (let j = 0; j < secondary.length; j++) {
      if (used.has(j)) continue;
      const b = secondary[j];
      const ov = overlapOf(a, b);
      let score: number;
      if (ov > 0) score = 1e12 + ov; // 重叠优先,按重叠时长取最大
      else {
        // 区间距离:副轨在主轨之前 → a.start - b.end;之后 → b.start - a.end
        const dist = b.end < a.start ? a.start - b.end : b.start - a.end;
        if (dist > toleranceMs) continue;
        score = -dist; // 距离越小越优
      }
      if (score > bestScore) {
        bestScore = score;
        bestIdx = j;
      }
    }
    if (bestIdx >= 0) {
      used.add(bestIdx);
      const b = secondary[bestIdx];
      const text = b.text === a.text || b.text === "" ? a.text : a.text + gap + b.text;
      out.push({ ...a, text });
    } else {
      out.push({ ...a });
    }
  }
  if (keepUnmatched) {
    secondary.forEach((b, j) => {
      if (!used.has(j)) out.push({ ...b });
    });
  }
  return out.sort((x, y) => x.start - y.start || x.end - y.end);
}

export type ExtractOptions = {
  /** 抽出区间外的部分截掉(cue 被区间边界裁剪),默认 true */
  clamp?: boolean;
  /** 结果时间轴减去 fromMs(抽出的片段作为独立字幕从 0 开始),默认 false */
  shift?: boolean;
};

/** 抽取 [fromMs, toMs] 区间内(有交集)的 cue,按开始时间排序。非法区间返回 null。 */
export function extractRange(cues: Cue[], fromMs: number, toMs: number, opts?: ExtractOptions): Cue[] | null {
  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs) || toMs < fromMs) return null;
  const clamp = opts?.clamp ?? true;
  const shift = opts?.shift ?? false;
  const picked: Cue[] = [];
  for (const cue of cues) {
    if (cue.end <= fromMs || cue.start >= toMs) continue;
    let start = cue.start;
    let end = cue.end;
    if (clamp) {
      start = Math.max(start, fromMs);
      end = Math.min(end, toMs);
    }
    if (shift) {
      start -= fromMs;
      end -= fromMs;
      if (clamp) {
        start = Math.max(0, start);
        end = Math.max(0, end);
      }
    }
    picked.push({ ...cue, start, end });
  }
  return picked.sort((x, y) => x.start - y.start || x.end - y.end);
}

/* ------------------------------------------------------------------ */
/* 诊断与修复                                                           */
/* ------------------------------------------------------------------ */

export type IssueType =
  | "out-of-order"
  | "negative-duration"
  | "zero-duration"
  | "overlap"
  | "short-gap"
  | "empty-text";

export type Issue = { index: number; type: IssueType; detail: string };

export type AnalyzeOptions = {
  /** cue 间最小间隙,小于该值的空隙会让部分播放器闪烁,默认 100ms */
  minGapMs?: number;
  /** cue 最短显示时长,默认 500ms */
  minDurationMs?: number;
};

const fmt = (ms: number) => formatTimestamp(ms, ",");

/**
 * 诊断报告(先报后修):乱序、负时长、零时长、相邻重叠、间隙 < minGap、空文本。
 * overlap/short-gap 按"按 start 排序后的相邻对"判定;out-of-order 按给定顺序判定。
 */
export function analyzeCues(cues: Cue[], opts?: AnalyzeOptions): Issue[] {
  const minGap = opts?.minGapMs ?? 100;
  const minDuration = opts?.minDurationMs ?? 500;
  const issues: Issue[] = [];

  for (let i = 0; i < cues.length; i++) {
    const c = cues[i];
    if (c.end < c.start) {
      issues.push({ index: i, type: "negative-duration", detail: `${fmt(c.start)} --> ${fmt(c.end)} ends before it starts` });
    } else if (c.end === c.start) {
      issues.push({ index: i, type: "zero-duration", detail: `${fmt(c.start)} has zero duration` });
    }
    if (c.text.trim() === "") {
      issues.push({ index: i, type: "empty-text", detail: `cue ${i + 1} has no text` });
    }
    if (i > 0 && c.start < cues[i - 1].start) {
      issues.push({ index: i, type: "out-of-order", detail: `cue ${i + 1} starts before cue ${i}` });
    }
  }

  const sorted = [...cues].sort((a, b) => a.start - b.start || a.end - b.end);
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    if (cur.start < prev.end) {
      const idx = cues.indexOf(cur);
      issues.push({
        index: idx,
        type: "overlap",
        detail: `cue overlaps previous by ${prev.end - cur.start}ms (from ${fmt(cur.start)})`,
      });
    } else if (cur.start - prev.end > 0 && cur.start - prev.end < minGap) {
      // 间隙为 0(前后紧贴)是合法排布;只有正的短间隙才需要闭合
      const idx = cues.indexOf(cur);
      issues.push({ index: idx, type: "short-gap", detail: `gap of ${cur.start - prev.end}ms before ${fmt(cur.start)}` });
    }
  }
  return issues;
}

export type FixType = "reversed" | "zero-duration" | "overlap" | "short-gap" | "reorder" | "renumber";

export type FixReport = { type: FixType; count: number };

export type FixOptions = {
  /** 闭合小于该值的间隙(前一条延长到下一条开始),默认 100ms */
  minGapMs?: number;
  /** 零时长 cue 的最短显示时长,默认 500ms(会被后续重叠修剪封顶) */
  minDurationMs?: number;
};

/**
 * 修复时间轴(与 analyzeCues 同一套判定):
 * 1. 乱序 → 稳定排序;
 * 2. 负时长(时间戳写反)→ 交换起止;
 * 3. 零时长 → 延长到 minDuration(不超过下一条开始);
 * 4. 相邻重叠 → 前一条 end 截到后一条 start;
 * 5. 间隙 < minGap → 前一条 end 延到后一条 start(闭合间隙)。
 * 序号(SRT)在导出时重建,报告里以 renumber 记账。
 * 返回修复后的 cue 与分类计数;analyzeCues(修复结果) 对 overlap/negative/zero/short-gap 应为空。
 */
export function fixOverlaps(cues: Cue[], opts?: FixOptions): { cues: Cue[]; fixes: FixReport[] } {
  const minGap = opts?.minGapMs ?? 100;
  const minDuration = opts?.minDurationMs ?? 500;
  const fixes: FixReport[] = [];
  const bump = (type: FixType, n = 1) => {
    const f = fixes.find((x) => x.type === type);
    if (f) f.count += n;
    else fixes.push({ type, count: n });
  };

  // 1. 稳定排序(乱序修复)
  const orderIdx = cues.map((_, i) => i);
  const sortedIdx = [...orderIdx].sort((a, b) => cues[a].start - cues[b].start || cues[a].end - cues[b].end);
  let work: Cue[] = sortedIdx.map((i) => ({ ...cues[i] }));
  if (sortedIdx.some((v, i) => v !== orderIdx[i])) bump("reorder");

  for (let i = 0; i < work.length; i++) {
    const c = work[i];
    // 2. 负时长:时间戳写反 → 交换
    if (c.end < c.start) {
      work[i] = { ...c, start: c.end, end: c.start };
      bump("reversed");
    }
  }

  for (let i = 0; i < work.length; i++) {
    const c = work[i];
    // 3. 零时长:延长到 minDuration,封顶下一条的 start
    if (c.end === c.start) {
      const nextStart = i + 1 < work.length ? work[i + 1].start : Infinity;
      work[i] = { ...c, end: Math.min(c.start + minDuration, Math.max(nextStart, c.start)) };
      bump("zero-duration");
    }
  }

  // 4+5. 相邻重叠修剪 + 短间隙闭合(两者都落成 prev.end = next.start)
  for (let i = 1; i < work.length; i++) {
    const prev = work[i - 1];
    const cur = work[i];
    if (cur.start < prev.end) {
      work[i - 1] = { ...prev, end: Math.max(cur.start, prev.start) };
      bump("overlap");
    } else if (cur.start - prev.end > 0 && cur.start - prev.end < minGap) {
      work[i - 1] = { ...prev, end: cur.start };
      bump("short-gap");
    }
  }

  // 最终按 start 稳定排序(前面步骤可能改变次序)
  work = work
    .map((c, i) => ({ c, i }))
    .sort((a, b) => a.c.start - b.c.start || a.c.end - b.c.end || a.i - b.i)
    .map((x) => x.c);

  bump("renumber", work.length);
  return { cues: work, fixes };
}

/* ------------------------------------------------------------------ */
/* 文本清理(subtitle-converter-batch 背后的纯逻辑)                      */
/* ------------------------------------------------------------------ */

export type CleanOptions = {
  /** 去掉 <i> <b> <font ...> 等 HTML/标签 */
  stripTags?: boolean;
  /** 去掉行首说话人标签("NARRATOR:"、"John:") */
  removeSpeakers?: boolean;
  /** 去掉音效/舞台指示:[Music]、(applause)、♪ */
  removeSoundEffects?: boolean;
  /** 全部小写 */
  lowercase?: boolean;
  /** 每条 cue 按宽度重新折行(按码点计),不传或非法不折行 */
  wrapAt?: number | null;
};

const HTML_TAG = /<[^>]+>/g;
const SPEAKER_LABEL =
  /^[-–—]?\s*(?:\[[^\]]*\]\s*)?(?:[A-Z]{2,}[A-Z0-9 .,'’&-]*|[A-Z][a-z]+(?:\s[A-Z][a-z]+)*)(?:\s*\([^)]*\))?:\s*/;
const SQUARE_BRACKETS = /\s*\[[^\]\n]*\]/g;
const MUSIC_NOTES = /[♪♫★☆]/g;

function stripSoundEffectsLine(line: string): string {
  let out = line.replace(SQUARE_BRACKETS, "").replace(MUSIC_NOTES, "");
  // 整行只剩圆括号舞台指示时删除该行
  if (/^\s*\((?:[^)]*)\)\s*$/.test(out)) return "";
  return out.replace(/^[ \t]+|[ \t]+$/g, "");
}

/** 单条 cue 文本清理(不含折行;折行由 cleanCues 统一做)。 */
export function stripFormatting(text: string, opts: CleanOptions): string {
  let lines = text.split("\n");
  if (opts.stripTags) lines = lines.map((l) => l.replace(HTML_TAG, ""));
  if (opts.removeSoundEffects) lines = lines.map(stripSoundEffectsLine).filter((l) => l.trim() !== "");
  if (opts.removeSpeakers) {
    // "NARRATOR:"、"John (O.S.):"、"- MAN:" 前缀剥掉;普通对话行 "- hi" 不动
    lines = lines
      .map((l) => (SPEAKER_LABEL.test(l) ? l.replace(SPEAKER_LABEL, "") : l))
      .filter((l) => l.trim() !== "");
  }
  let out = lines.join("\n").replace(/\n{2,}/g, "\n").replace(/^\n+|\n+$/g, "");
  if (opts.lowercase) out = out.toLowerCase();
  return out;
}

/** 按码点宽度贪心折行;超宽单词(CJK 长串)硬切。 */
export function wrapCueLines(text: string, width: number): string {
  if (!Number.isInteger(width) || width < 5) return text;
  const cpLen = (s: string) => [...s].length;
  const outLines: string[] = [];
  for (const rawLine of text.split("\n")) {
    if (cpLen(rawLine) <= width) {
      outLines.push(rawLine);
      continue;
    }
    let cur = "";
    for (const word of rawLine.split(/ +/)) {
      let w = word;
      while (cpLen(w) > width) {
        if (cur) {
          outLines.push(cur);
          cur = "";
        }
        let piece = "";
        let n = 0;
        let cut = 0;
        for (const ch of w) {
          piece += ch;
          n++;
          cut += ch.length;
          if (n === width) break;
        }
        outLines.push(piece);
        w = w.slice(cut);
      }
      if (w === "") continue;
      if (cur === "") cur = w;
      else if (cpLen(cur) + 1 + cpLen(w) <= width) cur += " " + w;
      else {
        outLines.push(cur);
        cur = w;
      }
    }
    if (cur !== "" || outLines.length === 0) outLines.push(cur);
  }
  return outLines.join("\n");
}

export type CleanResult = { cues: Cue[]; changed: number; dropped: number };

/** 对整条轨应用清理;文本有变的 cue 计入 changed,清空后文本为空的 cue 丢弃并计入 dropped。 */
export function cleanCues(cues: Cue[], opts: CleanOptions): CleanResult {
  const out: Cue[] = [];
  let changed = 0;
  let dropped = 0;
  for (const cue of cues) {
    let text = stripFormatting(cue.text, opts);
    if (opts.wrapAt) text = wrapCueLines(text, opts.wrapAt);
    if (text === cue.text) {
      out.push(cue);
      continue;
    }
    if (text.trim() === "") {
      dropped++;
      changed++;
      continue;
    }
    out.push({ ...cue, text });
    changed++;
  }
  return { cues: out, changed, dropped };
}
