import { z } from "zod";
import {
  cleanCues,
  detectFormat,
  fixOverlaps,
  formatSubtitle,
  mergeSubtitleTracks,
  parseSubtitle,
  shiftTimestamps,
  scaleTimestamps,
  type CleanOptions,
} from "../tools/_lib/subtitle";

/**
 * SubtitleKit MCP 工具注册表:把 tools/_lib/subtitle.ts 的纯函数暴露为 AI 可执行工具。
 * 字幕是纯文本,入参直接收文件全文(SRT/WebVTT 自动嗅探),出参直接回文件文本——
 * 站上的同名工具在浏览器里跑(交互式),这里跑同一份经过测试的实现。
 */

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] });
const json = (v: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(v, null, 2) }] });
const bad = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const });

export type McpToolDef = {
  name: string;
  title: string;
  description: string;
  schema: Record<string, any>;
  run: (args: any) => { content: { type: "text"; text: string }[]; isError?: boolean };
};

const SRT_VTT = z.enum(["srt", "vtt"]);

export const MCP_TOOLS: McpToolDef[] = [
  {
    name: "srt_vtt_convert",
    title: "Convert SRT ↔ WebVTT",
    description:
      "Convert subtitle file text between SubRip (SRT) and WebVTT (VTT). Pass the whole file as `content`; the source format is auto-detected (WEBVTT header) unless you set `from`. Output is the converted file text, normalized: BOM and CRLF cleaned, timestamps rewritten to the target spec (comma vs dot), SRT cue numbers rebuilt, VTT cue settings kept. Formatting tags like <i> pass through untouched.",
    schema: {
      content: z.string().min(1).describe("full subtitle file text (SRT or WebVTT)"),
      to: SRT_VTT.describe("target format: 'srt' (SubRip) or 'vtt' (WebVTT)"),
      from: SRT_VTT.optional().describe("force the source format instead of auto-detecting from the WEBVTT header"),
    },
    run: (a) => {
      const from: "srt" | "vtt" = a.from ?? detectFormat(a.content);
      const parsed = parseSubtitle(a.content, from);
      if (!parsed.cues.length) {
        return bad(`no cues found — the input does not look like ${from === "vtt" ? "WebVTT" : "SRT"} subtitle text${parsed.warnings.length ? ` (notes: ${parsed.warnings.slice(0, 3).join("; ")})` : ""}`);
      }
      const body = formatSubtitle(parsed.cues, a.to);
      const notes = parsed.warnings.length ? `\n\n[parse notes]\n${parsed.warnings.join("\n")}` : "";
      return text(body + notes);
    },
  },
  {
    name: "subtitle_shift",
    title: "Shift or scale subtitle timestamps",
    description:
      "Shift every timestamp of an SRT/VTT subtitle by a signed offset in milliseconds (positive = later, negative = earlier, clamped at 00:00:00,000 unless clamp=false), and/or multiply all times by a scale factor for frame-rate changes (e.g. factor 1.042709 converts subs timed for a 25 fps PAL print to a 23.976 fps master). Output is the shifted file in the same format as the input.",
    schema: {
      content: z.string().min(1).describe("full subtitle file text (SRT or WebVTT)"),
      offset_ms: z.number().int().default(0).describe("signed offset in milliseconds; positive delays, negative advances"),
      scale: z.number().positive().optional().describe("multiply all timestamps by this factor (e.g. 25/23.976 ≈ 1.042709 for 25fps→23.976fps)"),
      clamp: z.boolean().default(true).describe("clamp shifted times at 00:00:00,000 instead of going negative"),
    },
    run: (a) => {
      const format = detectFormat(a.content);
      const parsed = parseSubtitle(a.content, format);
      if (!parsed.cues.length) {
        return bad("no cues found — the input does not look like SRT or WebVTT subtitle text");
      }
      let cues = shiftTimestamps(parsed.cues, a.offset_ms ?? 0, { clamp: a.clamp ?? true });
      if (a.scale !== undefined) {
        const scaled = scaleTimestamps(cues, a.scale);
        if (!scaled) return bad("scale must be a positive finite number");
        cues = scaled;
      }
      return text(formatSubtitle(cues, format));
    },
  },
  {
    name: "subtitle_merge",
    title: "Merge two subtitle tracks (bilingual stack)",
    description:
      "Merge two subtitle tracks into one bilingual file: for each cue of the primary track the best-matching secondary cue is stacked below its text (primary line on top). Matching prefers the longest time overlap, falling back to the nearest start within `tolerance_ms` (default 500). Each secondary cue is used once; unmatched secondary cues are appended unless keep_unmatched=false. Output follows the primary track's format.",
    schema: {
      primary: z.string().min(1).describe("primary track file text — its line goes on top, its format is kept"),
      secondary: z.string().min(1).describe("secondary track file text — its line is stacked below the primary's"),
      tolerance_ms: z.number().int().nonnegative().default(500).describe("max start-time distance for aligning cues without overlap"),
      keep_unmatched: z.boolean().default(true).describe("append secondary cues that matched no primary cue"),
    },
    run: (a) => {
      const primaryFormat = detectFormat(a.primary);
      const parsedA = parseSubtitle(a.primary, primaryFormat);
      const parsedB = parseSubtitle(a.secondary, detectFormat(a.secondary));
      if (!parsedA.cues.length) return bad("no cues found in the primary track");
      if (!parsedB.cues.length) return bad("no cues found in the secondary track");
      const merged = mergeSubtitleTracks(parsedA.cues, parsedB.cues, {
        toleranceMs: a.tolerance_ms ?? 500,
        keepUnmatched: a.keep_unmatched ?? true,
      });
      return text(formatSubtitle(merged, primaryFormat));
    },
  },
  {
    name: "subtitle_fix",
    title: "Fix subtitle timing problems",
    description:
      "Diagnose and fix common subtitle timing bugs: out-of-order cues, reversed (negative-duration) timestamps, zero-duration cues, overlaps between adjacent cues, gaps shorter than min_gap_ms (default 100), and empty-text cues. Returns a JSON report (issues before/after, fixes applied) plus the fixed file text. Deterministic; formatting tags are never modified and SRT numbers are rebuilt.",
    schema: {
      content: z.string().min(1).describe("full subtitle file text (SRT or WebVTT)"),
      min_gap_ms: z.number().int().nonnegative().default(100).describe("close gaps shorter than this by extending the earlier cue to touch the next"),
      min_duration_ms: z.number().int().positive().default(500).describe("display time given to zero-duration cues"),
    },
    run: (a) => {
      const format = detectFormat(a.content);
      const parsed = parseSubtitle(a.content, format);
      if (!parsed.cues.length) {
        return bad("no cues found — the input does not look like SRT or WebVTT subtitle text");
      }
      const before = analyzeQuick(parsed.cues, a.min_gap_ms ?? 100);
      const fixed = fixOverlaps(parsed.cues, { minGapMs: a.min_gap_ms ?? 100, minDurationMs: a.min_duration_ms ?? 500 });
      const after = analyzeQuick(fixed.cues, a.min_gap_ms ?? 100);
      return json({
        format,
        cue_count: fixed.cues.length,
        issues_before: before,
        issues_after: after,
        fixes_applied: fixed.fixes.filter((f) => f.type !== "renumber" || f.count > 0),
        fixed: formatSubtitle(fixed.cues, format),
      });
    },
  },
  {
    name: "subtitle_clean",
    title: "Batch-clean subtitle text",
    description:
      "Batch text operations on every cue of a subtitle file, for preparing it before styling: strip markup tags (<i>, <b>, <font …>), remove speaker labels (NARRATOR:, John:), remove sound-effect markers ([Music], (applause), ♪), lowercase everything, and re-wrap lines at a fixed character width (counted in characters, so CJK wraps correctly). Returns JSON with the cleaned file text and counters; dialogue dashes and normal speech are untouched.",
    schema: {
      content: z.string().min(1).describe("full subtitle file text (SRT or WebVTT)"),
      strip_tags: z.boolean().default(true).describe("remove <…> markup tags, keeping the text between them"),
      remove_speakers: z.boolean().default(false).describe("remove leading speaker labels like 'NARRATOR:' or '- MAN (O.S.):'"),
      remove_sound_effects: z.boolean().default(false).describe("remove [Music]-style markers, ♪ and parenthetical-only lines"),
      lowercase: z.boolean().default(false).describe("convert all cue text to lowercase"),
      wrap_at: z.number().int().min(5).max(120).optional().describe("re-wrap each cue's lines at this many characters; omit to keep line breaks"),
    },
    run: (a) => {
      const format = detectFormat(a.content);
      const parsed = parseSubtitle(a.content, format);
      if (!parsed.cues.length) {
        return bad("no cues found — the input does not look like SRT or WebVTT subtitle text");
      }
      const opts: CleanOptions = {
        stripTags: a.strip_tags ?? true,
        removeSpeakers: a.remove_speakers ?? false,
        removeSoundEffects: a.remove_sound_effects ?? false,
        lowercase: a.lowercase ?? false,
        wrapAt: a.wrap_at ?? null,
      };
      const result = cleanCues(parsed.cues, opts);
      return json({
        format,
        cue_count: result.cues.length,
        cues_modified: result.changed,
        empty_cues_removed: result.dropped,
        cleaned: formatSubtitle(result.cues, format),
      });
    },
  },
];

/** analyzeCues 的紧凑计数版(MCP 报告用)。 */
function analyzeQuick(cues: { start: number; end: number; text: string }[], minGapMs: number): Record<string, number> {
  const counts: Record<string, number> = {};
  const bump = (k: string) => {
    counts[k] = (counts[k] ?? 0) + 1;
  };
  for (const c of cues) {
    if (c.end < c.start) bump("negative_duration");
    else if (c.end === c.start) bump("zero_duration");
    if (!c.text.trim()) bump("empty_text");
  }
  for (let i = 1; i < cues.length; i++) {
    if (cues[i].start < cues[i - 1].start) bump("out_of_order");
  }
  const sorted = [...cues].sort((x, y) => x.start - y.start || x.end - y.end);
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].start - sorted[i - 1].end;
    if (gap < 0) bump("overlap");
    else if (gap > 0 && gap < minGapMs) bump("short_gap");
  }
  return counts;
}
