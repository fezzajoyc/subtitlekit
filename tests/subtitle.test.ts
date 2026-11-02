import { describe, expect, it } from "vitest";
import {
  analyzeCues,
  cleanCues,
  detectFormat,
  extractRange,
  fixOverlaps,
  formatSrt,
  formatTimestamp,
  formatVtt,
  fpsScale,
  mergeSubtitleTracks,
  parseSrt,
  parseTimestamp,
  parseVtt,
  scaleTimestamps,
  shiftTimestamps,
  stripFormatting,
  wrapCueLines,
  type Cue,
} from "@/tools/_lib/subtitle";

const cue = (start: number, end: number, text: string, settings?: string): Cue =>
  settings ? { start, end, text, settings } : { start, end, text };

const SRT_BASIC = [
  "1",
  "00:00:01,000 --> 00:00:03,000",
  "Hello world",
  "",
  "2",
  "00:00:05,000 --> 00:00:07,500",
  "Second line",
  "",
].join("\n");

const VTT_BASIC = [
  "WEBVTT",
  "",
  "00:00:01.000 --> 00:00:03.000",
  "Hello world",
  "",
  "00:00:05.000 --> 00:00:07.500",
  "Second line",
  "",
].join("\n");

/* ------------------------------------------------------------------ */
/* 时间戳原语                                                            */
/* ------------------------------------------------------------------ */

describe("parseTimestamp", () => {
  it("parses SRT HH:MM:SS,mmm exactly", () => {
    expect(parseTimestamp("00:00:01,000")).toBe(1000);
    expect(parseTimestamp("01:02:03,456")).toBe((1 * 3600 + 2 * 60 + 3) * 1000 + 456);
    expect(parseTimestamp("99:59:59,999")).toBe((99 * 3600 + 59 * 60 + 59) * 1000 + 999);
  });

  it("parses VTT forms: dot milliseconds, optional hours, optional milliseconds", () => {
    expect(parseTimestamp("00:00:01.000")).toBe(1000);
    expect(parseTimestamp("02:03.500")).toBe(123500); // MM:SS.mmm — no hours
    expect(parseTimestamp("00:05")).toBe(5000); // MM:SS — no ms
    expect(parseTimestamp("01:02:03")).toBe(3723000);
  });

  it("right-aligns 1–2 digit milliseconds like real parsers (5 → 500ms, 50 → 500ms)", () => {
    expect(parseTimestamp("00:00:01,5")).toBe(1500);
    expect(parseTimestamp("00:00:01.50")).toBe(1500);
    expect(parseTimestamp("00:00:01,500")).toBe(1500);
  });

  it("returns null for garbage without throwing", () => {
    expect(parseTimestamp("")).toBeNull();
    expect(parseTimestamp("hello")).toBeNull();
    expect(parseTimestamp("1:2")).toBeNull(); // 单段时间戳不接受
    expect(parseTimestamp("00:00:01,0000")).toBeNull(); // 4 位毫秒非法
    expect(parseTimestamp("00:00:60,000")).toBeNull();
    expect(parseTimestamp("aa:bb:cc,ddd")).toBeNull();
  });
});

describe("formatTimestamp", () => {
  it("round-trips with parseTimestamp", () => {
    for (const ms of [0, 1, 999, 1000, 61500, 3723456, 359999999]) {
      expect(parseTimestamp(formatTimestamp(ms, ","))).toBe(ms);
      expect(parseTimestamp(formatTimestamp(ms, "."))).toBe(ms);
    }
  });

  it("chooses the separator per format and clamps negatives at zero", () => {
    expect(formatTimestamp(1000, ",")).toBe("00:00:01,000");
    expect(formatTimestamp(1000, ".")).toBe("00:00:01.000");
    expect(formatTimestamp(-5, ",")).toBe("00:00:00,000");
  });

  it("grows past 99 hours instead of wrapping", () => {
    const out = formatTimestamp(100 * 3600 * 1000, ",");
    expect(out.startsWith("100:")).toBe(true);
    expect(parseTimestamp(out)).toBe(100 * 3600 * 1000);
  });
});

/* ------------------------------------------------------------------ */
/* SRT 解析                                                              */
/* ------------------------------------------------------------------ */

describe("parseSrt", () => {
  it("parses normal numbered cues with multi-line text", () => {
    const { cues, warnings } = parseSrt(SRT_BASIC);
    expect(warnings).toEqual([]);
    expect(cues).toEqual([cue(1000, 3000, "Hello world"), cue(5000, 7500, "Second line")]);
  });

  it("strips a UTF-8 BOM and normalizes CRLF/CR line endings", () => {
    const bomCrlf = "\uFEFF" + SRT_BASIC.replace(/\n/g, "\r\n");
    const { cues, warnings } = parseSrt(bomCrlf);
    expect(warnings).toEqual([]);
    expect(cues.map((c) => c.text)).toEqual(["Hello world", "Second line"]);

    const crOnly = parseSrt(SRT_BASIC.replace(/\n/g, "\r")).cues;
    expect(crOnly.length).toBe(2);
  });

  it("accepts missing sequence numbers and VTT-style dot milliseconds inside SRT", () => {
    const loose = "00:00:01.000 --> 00:00:03.000\nNo index here\n\n00:00:05,000 --> 00:00:06,000\nNext";
    const { cues, warnings } = parseSrt(loose);
    expect(cues).toEqual([cue(1000, 3000, "No index here"), cue(5000, 6000, "Next")]);
    expect(warnings).toEqual([]);
  });

  it("skips blocks with malformed arrows and records a warning instead of throwing", () => {
    const broken = "1\nno arrow here at all\n\n2\n00:00:01,000 --> 00:00:02,000\nFine";
    const { cues, warnings } = parseSrt(broken);
    expect(cues).toEqual([cue(1000, 2000, "Fine")]);
    expect(warnings.join("\n")).toMatch(/no timing line/);
  });

  it("skips blocks with broken timestamps and warns", () => {
    const { cues, warnings } = parseSrt("1\n00:00:01,000 -> 00:00:03,000\nsingle arrow\n\n2\n00:00:05,000 --> 00:00:06,000\nOK");
    expect(cues.map((c) => c.text)).toEqual(["OK"]);
    expect(warnings.join("\n")).toMatch(/malformed timestamp|no timing line/);
  });

  it("warns on stray text before the timing line but keeps the cue", () => {
    const { cues, warnings } = parseSrt("junk line\n00:00:01,000 --> 00:00:02,000\ntext");
    expect(cues).toEqual([cue(1000, 2000, "text")]);
    expect(warnings.join("\n")).toMatch(/unexpected text before timing line/);
  });

  it("keeps reversed timestamps as data (the fixer's job), keeps formatting tags verbatim", () => {
    const { cues } = parseSrt("1\n00:00:05,000 --> 00:00:01,000\n<i>Oops</i>");
    expect(cues[0]).toMatchObject({ start: 5000, end: 1000, text: "<i>Oops</i>" });
  });

  it("handles empty input and pure garbage without throwing", () => {
    expect(parseSrt("")).toEqual({ cues: [], warnings: ["empty input"] });
    expect(parseSrt("   \n  \n").cues).toEqual([]);
    const garbage = parseSrt("completely\nnot\nsubtitles");
    expect(garbage.cues).toEqual([]);
    expect(garbage.warnings.length).toBeGreaterThan(0);
  });

  it("preserves CJK, emoji and blank-ish spacing inside cues", () => {
    const { cues } = parseSrt("1\n00:00:01,000 --> 00:00:02,000\n你好 🎬\n第二行");
    expect(cues[0].text).toBe("你好 🎬\n第二行");
  });
});

/* ------------------------------------------------------------------ */
/* VTT 解析                                                              */
/* ------------------------------------------------------------------ */

describe("parseVtt", () => {
  it("parses header, cues and keeps cue settings", () => {
    const vtt = "WEBVTT\n\n00:00:01.000 --> 00:00:03.000 align:start line:0\nHi there";
    const { cues, warnings } = parseVtt(vtt);
    expect(warnings).toEqual([]);
    expect(cues).toEqual([cue(1000, 3000, "Hi there", "align:start line:0")]);
  });

  it("skips NOTE, STYLE and REGION blocks", () => {
    const vtt = [
      "WEBVTT",
      "",
      "NOTE",
      "This is a multi-line",
      "comment block.",
      "",
      "STYLE",
      "::cue { color: red; }",
      "",
      "REGION",
      "id:fred width:40%",
      "",
      "00:00:01.000 --> 00:00:02.000",
      "Real cue",
      "",
    ].join("\n");
    const { cues, warnings } = parseVtt(vtt);
    expect(warnings).toEqual([]);
    expect(cues).toEqual([cue(1000, 2000, "Real cue")]);
  });

  it("supports cue identifiers on the line before the timing", () => {
    const { cues, warnings } = parseVtt("WEBVTT\n\nintro-cue-1\n00:00:01.000 --> 00:00:02.000\nText");
    expect(warnings).toEqual([]);
    expect(cues[0].text).toBe("Text");
  });

  it("warns when the WEBVTT header is missing but still parses the cues", () => {
    const { cues, warnings } = parseVtt("00:00:01.000 --> 00:00:02.000\nText");
    expect(cues.length).toBe(1);
    expect(warnings.join("\n")).toMatch(/missing WEBVTT header/);
  });

  it("parses VTT timestamps without hours and warns on unparseable blocks", () => {
    const { cues } = parseVtt("WEBVTT\n\n02:03.500 --> 02:05.000\nShort form");
    expect(cues[0]).toMatchObject({ start: 123500, end: 125000 });
    const bad = parseVtt("WEBVTT\n\ngarbage block\nwithout arrows");
    expect(bad.cues).toEqual([]);
    expect(bad.warnings.join("\n")).toMatch(/no timing line/);
  });

  it("handles empty input without throwing", () => {
    const empty = parseVtt("");
    expect(empty.cues).toEqual([]);
    expect(empty.warnings).toContain("empty input");
  });

  it("keeps CJK and emoji text", () => {
    const { cues } = parseVtt("WEBVTT\n\n00:00.000 --> 00:01.000\nこんにちは 🌊\n波の音");
    expect(cues[0].text).toBe("こんにちは 🌊\n波の音");
  });
});

/* ------------------------------------------------------------------ */
/* 格式化与往返                                                            */
/* ------------------------------------------------------------------ */

describe("formatSrt / formatVtt roundtrips", () => {
  it("SRT → parse → format is byte-stable", () => {
    expect(formatSrt(parseSrt(SRT_BASIC).cues)).toBe(SRT_BASIC);
  });

  it("VTT → parse → format is byte-stable, including cue settings", () => {
    const vtt = "WEBVTT\n\n00:00:01.000 --> 00:00:03.000 align:start line:0\nHi\n\n00:00:05.000 --> 00:00:06.000\nYo\n";
    expect(formatVtt(parseVtt(vtt).cues)).toBe(vtt);
  });

  it("full roundtrip SRT → VTT → SRT preserves times, text, tags and settings-free output", () => {
    const srt = [
      "1",
      "00:00:01,000 --> 00:00:03,000",
      "<i>Hello</i> 你好",
      "line two",
      "",
      "2",
      "00:00:05,000 --> 00:00:07,500",
      "Bye 🎬",
      "",
    ].join("\n");
    const asVtt = formatVtt(parseSrt(srt).cues);
    expect(asVtt).toContain("WEBVTT");
    expect(asVtt).toContain("00:00:01.000 --> 00:00:03.000");
    const backToSrt = formatSrt(parseVtt(asVtt).cues);
    expect(backToSrt).toBe(srt);
  });

  it("collapse blank lines inside cue text so blocks never split", () => {
    const out = formatSrt([cue(1000, 2000, "a\n\nb")]);
    expect(out).toBe("1\n00:00:01,000 --> 00:00:02,000\na\nb\n");
  });

  it("formats an empty track as an empty string (headerless, no stray newlines)", () => {
    expect(formatSrt([])).toBe("");
    expect(formatVtt([])).toBe("WEBVTT\n");
  });
});

describe("detectFormat", () => {
  it("sniffs the WEBVTT header, tolerating BOM and leading space", () => {
    expect(detectFormat(VTT_BASIC)).toBe("vtt");
    expect(detectFormat("\uFEFF WEBVTT\n")).toBe("vtt");
    expect(detectFormat(SRT_BASIC)).toBe("srt");
    expect(detectFormat("")).toBe("srt");
  });
});

/* ------------------------------------------------------------------ */
/* 平移与缩放                                                            */
/* ------------------------------------------------------------------ */

describe("shiftTimestamps", () => {
  const cues = [cue(1000, 3000, "a"), cue(5000, 7500, "b")];

  it("shifts positive (later) and negative (earlier) by exact milliseconds", () => {
    expect(shiftTimestamps(cues, 2000).map((c) => [c.start, c.end])).toEqual([[3000, 5000], [7000, 9500]]);
    expect(shiftTimestamps(cues, -1000).map((c) => [c.start, c.end])).toEqual([[0, 2000], [4000, 6500]]);
  });

  it("clamps at the 00:00:00,000 boundary by default", () => {
    const shifted = shiftTimestamps(cues, -5000);
    expect(shifted[0]).toMatchObject({ start: 0, end: 0 });
    expect(shifted[1]).toMatchObject({ start: 0, end: 2500 });
    expect(shifted.every((c) => c.start >= 0 && c.end >= 0)).toBe(true);
  });

  it("can go negative when clamping is disabled", () => {
    const shifted = shiftTimestamps(cues, -5000, { clamp: false });
    expect(shifted[0]).toMatchObject({ start: -4000, end: -2000 });
  });

  it("does not mutate the input array", () => {
    const before = JSON.stringify(cues);
    shiftTimestamps(cues, 123);
    expect(JSON.stringify(cues)).toBe(before);
  });

  it("keeps cue settings and text through the shift", () => {
    const withSettings = [cue(1000, 2000, "x", "align:start")];
    const out = shiftTimestamps(withSettings, 999);
    expect(out[0].settings).toBe("align:start");
    expect(out[0].text).toBe("x");
  });
});

describe("scaleTimestamps", () => {
  it("multiplies and rounds to whole milliseconds", () => {
    const out = scaleTimestamps([cue(1000, 2005, "a"), cue(33, 66, "b")], 1.5);
    expect(out).toEqual([cue(1500, 3008, "a"), cue(50, 99, "b")]);
  });

  it("returns null for zero, negative or non-finite factors (documented)", () => {
    expect(scaleTimestamps([cue(0, 1, "a")], 0)).toBeNull();
    expect(scaleTimestamps([cue(0, 1, "a")], -2)).toBeNull();
    expect(scaleTimestamps([cue(0, 1, "a")], NaN)).toBeNull();
    expect(scaleTimestamps([cue(0, 1, "a")], Infinity)).toBeNull();
  });

  it("handles the 25fps → 23.976fps hand-computed case", () => {
    // 1 分 40 秒 × 25/23.976 = 104270.87…ms → 104271ms
    const out = scaleTimestamps([cue(100000, 110000, "a")], 25 / (24000 / 1001));
    expect(out![0].start).toBe(104271);
  });

  it("maps zero and empty tracks without error", () => {
    expect(scaleTimestamps([], 2)).toEqual([]);
    expect(scaleTimestamps([cue(0, 0, "x")], 0.5)).toEqual([cue(0, 0, "x")]);
  });
});

describe("fpsScale", () => {
  it("uses exact NTSC fractions for 23.976/29.97", () => {
    expect(fpsScale(25, 23.976)).toBeCloseTo(25 / (24000 / 1001), 12);
    expect(fpsScale(23.976, 25)).toBeCloseTo((24000 / 1001) / 25, 12);
    expect(fpsScale(29.97, 25)).toBeCloseTo((30000 / 1001) / 25, 12);
  });

  it("is reciprocal and rejects non-positive fps", () => {
    expect(fpsScale(24, 25)! * fpsScale(25, 24)!).toBeCloseTo(1, 12);
    expect(fpsScale(0, 25)).toBeNull();
    expect(fpsScale(25, -1)).toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/* 合并与抽取                                                            */
/* ------------------------------------------------------------------ */

describe("mergeSubtitleTracks", () => {
  const primary = [cue(1000, 3000, "你好"), cue(5000, 7500, "第二句")];

  it("stacks the secondary line under the primary on time overlap", () => {
    const secondary = [cue(1200, 3100, "Hello"), cue(5100, 7000, "Second")];
    const merged = mergeSubtitleTracks(primary, secondary);
    expect(merged.map((c) => c.text)).toEqual(["你好\nHello", "第二句\nSecond"]);
    expect(merged[0]).toMatchObject({ start: 1000, end: 3000 }); // 主轨时间
    expect(merged).toEqual(merged.slice().sort((a, b) => a.start - b.start)); // 有序
  });

  it("prefers the longest overlap when several secondary cues overlap", () => {
    const secondary = [cue(1100, 1500, "short"), cue(1400, 2900, "long")];
    expect(mergeSubtitleTracks([primary[0]], secondary)[0].text).toBe("你好\nlong");
  });

  it("falls back to nearest start within tolerance when nothing overlaps", () => {
    const secondary = [cue(3400, 3600, "near")]; // 400ms after primary start? — within 500ms of primary END gap
    const merged = mergeSubtitleTracks([cue(1000, 3000, "你")], secondary, { toleranceMs: 500 });
    expect(merged[0].text).toBe("你\nnear");
  });

  it("ignores secondary cues beyond the tolerance and appends them only if keepUnmatched", () => {
    const secondary = [cue(60000, 61000, "far")];
    expect(mergeSubtitleTracks(primary, secondary, { toleranceMs: 500 })[0].text).toBe("你好");
    const kept = mergeSubtitleTracks(primary, secondary, { toleranceMs: 500, keepUnmatched: true });
    expect(kept.map((c) => c.text)).toEqual(["你好", "第二句", "far"]);
    const dropped = mergeSubtitleTracks(primary, secondary, { keepUnmatched: false });
    expect(dropped.map((c) => c.text)).toEqual(["你好", "第二句"]);
  });

  it("matches exact-timing cues and dedupes identical bilingual text", () => {
    const same = [cue(1000, 3000, "你好"), cue(5000, 7500, "第二句")];
    expect(mergeSubtitleTracks(primary, same).map((c) => c.text)).toEqual(["你好", "第二句"]);
  });

  it("uses each secondary cue at most once", () => {
    const secondary = [cue(1000, 3000, "one")];
    const merged = mergeSubtitleTracks([cue(1000, 3000, "a"), cue(5000, 7500, "b")], secondary);
    expect(merged.map((c) => c.text)).toEqual(["a\none", "b"]);
  });

  it("respects blankLines=0 (tight two-liner) and keeps settings from the primary", () => {
    const merged = mergeSubtitleTracks([cue(0, 1000, "上", "align:start")], [cue(0, 1000, "下")], { blankLines: 0 });
    expect(merged[0].text).toBe("上\n下");
    expect(merged[0].settings).toBe("align:start");
  });

  it("handles empty tracks without throwing", () => {
    expect(mergeSubtitleTracks([], [])).toEqual([]);
    expect(mergeSubtitleTracks(primary, [])).toEqual(primary);
    expect(mergeSubtitleTracks([], primary)).toEqual(primary);
  });
});

describe("extractRange", () => {
  const cues = [cue(0, 2000, "a"), cue(2500, 4500, "b"), cue(5000, 7000, "c")];

  it("keeps only cues intersecting the range, sorted", () => {
    expect(extractRange(cues, 2400, 5200, { clamp: false })!.map((c) => c.text)).toEqual(["b", "c"]);
  });

  it("trims cue times to the range boundaries when clamp is on", () => {
    const out = extractRange(cues, 3000, 6000)!;
    expect(out.map((c) => [c.start, c.end])).toEqual([[3000, 4500], [5000, 6000]]);
  });

  it("shifts the result to start at zero when asked", () => {
    const out = extractRange(cues, 2500, 7000, { shift: true })!;
    expect(out.map((c) => c.text)).toEqual(["b", "c"]);
    expect(out[0]).toMatchObject({ start: 0, end: 2000 });
    expect(out[1]).toMatchObject({ start: 2500, end: 4500 });
  });

  it("rejects inverted ranges with null and survives empty selections", () => {
    expect(extractRange(cues, 6000, 1000)).toBeNull();
    expect(extractRange(cues, 999999, 1000000)).toEqual([]);
    expect(extractRange([], 0, 60000)).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */
/* 诊断与修复                                                            */
/* ------------------------------------------------------------------ */

describe("analyzeCues / fixOverlaps", () => {
  it("reports out-of-order, reversed, zero-duration, overlap and short-gap issues", () => {
    const cues = [
      cue(2000, 4000, "B"),
      cue(1000, 500, "A"), // 写反 + 乱序
      cue(3500, 5000, "D"), // 与 B 重叠
      cue(5000, 5000, "C"), // 零时长
    ];
    const issues = analyzeCues(cues);
    const types = issues.map((i) => i.type).sort();
    expect(types).toEqual(["negative-duration", "out-of-order", "overlap", "zero-duration"]);

    const gappy = analyzeCues([cue(0, 1000, "a"), cue(1050, 2000, "b")]);
    expect(gappy.map((i) => i.type)).toEqual(["short-gap"]);
  });

  it("does not flag touching cues (zero gap) or a healthy file", () => {
    expect(analyzeCues([cue(0, 1000, "a"), cue(1000, 2000, "b")])).toEqual([]);
    expect(analyzeCues([cue(0, 1000, "a"), cue(5000, 6000, "b")])).toEqual([]);
    expect(analyzeCues([cue(0, 1000, "a"), cue(1090, 2000, "b")]).map((i) => i.type)).toEqual(["short-gap"]);
    expect(analyzeCues([])).toEqual([]);
  });

  it("reports empty-text cues without dropping them", () => {
    const issues = analyzeCues([cue(0, 1000, "  "), cue(2000, 3000, "ok")]);
    expect(issues.map((i) => i.type)).toEqual(["empty-text"]);
  });

  it("fixes everything at once: reorder, swap reversed, trim overlap, pad zero-duration", () => {
    const broken = [
      cue(2000, 4000, "B"),
      cue(1000, 500, "A"),
      cue(3500, 5000, "D"),
      cue(5000, 5000, "C"),
    ];
    const { cues: fixed, fixes } = fixOverlaps(broken);
    expect(fixed.map((c) => c.text)).toEqual(["A", "B", "D", "C"]);
    expect(fixed.map((c) => [c.start, c.end])).toEqual([[500, 1000], [2000, 3500], [3500, 5000], [5000, 5500]]);
    const types = fixes.map((f) => f.type);
    expect(types).toEqual(expect.arrayContaining(["reorder", "reversed", "overlap", "zero-duration", "renumber"]));
    // 修复后诊断:重叠/写反/零时长/短间隙清零
    const after = analyzeCues(fixed).filter((i) => i.type !== "empty-text");
    expect(after).toEqual([]);
  });

  it("closes short gaps by extending the earlier cue to the next start", () => {
    const { cues: fixed, fixes } = fixOverlaps([cue(0, 1000, "a"), cue(1050, 2000, "b")], { minGapMs: 100 });
    expect(fixed[0]).toMatchObject({ start: 0, end: 1050 });
    expect(fixes.find((f) => f.type === "short-gap")?.count).toBe(1);
    expect(analyzeCues(fixed)).toEqual([]);
  });

  it("leaves healthy files untouched (no fixes beyond renumbering bookkeeping)", () => {
    const healthy = [cue(0, 1000, "a"), cue(5000, 6000, "b")];
    const { cues: fixed, fixes } = fixOverlaps(healthy);
    expect(fixed).toEqual(healthy);
    expect(fixes).toEqual([{ type: "renumber", count: 2 }]);
  });

  it("never produces negative times and caps zero-duration padding at the next start", () => {
    const { cues: fixed } = fixOverlaps([cue(0, 0, "a"), cue(0, 100, "b")]);
    for (const c of fixed) {
      expect(c.start).toBeGreaterThanOrEqual(0);
      expect(c.end).toBeGreaterThanOrEqual(c.start);
    }
  });

  it("does not mutate its input", () => {
    const broken = [cue(2000, 4000, "B"), cue(1000, 500, "A")];
    const snapshot = JSON.stringify(broken);
    fixOverlaps(broken);
    expect(JSON.stringify(broken)).toBe(snapshot);
  });
});

/* ------------------------------------------------------------------ */
/* 文本清理                                                              */
/* ------------------------------------------------------------------ */

describe("stripFormatting / cleanCues", () => {
  it("strips markup tags but keeps the text between them", () => {
    expect(stripFormatting("<i>Hello</i> <b>world</b>", { stripTags: true })).toBe("Hello world");
    expect(stripFormatting('<font color="#ffcc00">.setColor</font>', { stripTags: true })).toBe(".setColor");
    expect(stripFormatting("<i>keep me</i>", {})).toBe("<i>keep me</i>");
  });

  it("removes ALL-CAPS and Title-Case speaker labels, keeps dialogue dashes", () => {
    const opts = { removeSpeakers: true };
    expect(stripFormatting("NARRATOR: once upon a time", opts)).toBe("once upon a time");
    expect(stripFormatting("- MAN (O.S.): get down!", opts)).toBe("get down!");
    expect(stripFormatting("John: hello", opts)).toBe("hello");
    expect(stripFormatting("- hello", opts)).toBe("- hello");
    expect(stripFormatting("I said: no", opts)).toBe("I said: no"); // 不是标签
    expect(stripFormatting("just a sentence", opts)).toBe("just a sentence");
  });

  it("removes [Music], ♪ and parenthetical-only lines, dropping emptied cues via cleanCues", () => {
    const opts = { removeSoundEffects: true };
    expect(stripFormatting("[Music] playing", opts)).toBe("playing");
    expect(stripFormatting("♪♪", opts)).toBe("");
    expect(stripFormatting("(laughs) no way", opts)).toBe("(laughs) no way"); // 行内括号保留
    expect(stripFormatting("(applause)", opts)).toBe("");
    const result = cleanCues([cue(0, 1000, "[Music] ♪"), cue(1000, 2000, "real")], opts);
    expect(result.cues.map((c) => c.text)).toEqual(["real"]);
    expect(result.dropped).toBe(1);
    expect(result.changed).toBe(1); // 只统计被清空丢弃的那条
  });

  it("lowercases everything including CJK-adjacent latin", () => {
    expect(stripFormatting("HELLO World 你好", { lowercase: true })).toBe("hello world 你好");
  });

  it("wraps lines greedily at the width, hard-slicing CJK runs", () => {
    expect(wrapCueLines("hello world again", 11)).toBe("hello world\nagain");
    expect(wrapCueLines("你好世界你好世界你好世界", 6)).toBe("你好世界你好\n世界你好世界");
    expect(wrapCueLines("short", 42)).toBe("short");
    expect(wrapCueLines("already\ntwo lines", 10)).toBe("already\ntwo lines");
  });

  it("wrap counts code points, not UTF-16 units (emoji-safe; minimum width is 5)", () => {
    // 🎬 是双 UTF-16 单元但单码点:按码点计数 → 不被拦腰折断
    expect(wrapCueLines("🎬🎬🎬🎬🎬🎬", 5).split("\n")).toEqual(["🎬🎬🎬🎬🎬", "🎬"]);
    expect(wrapCueLines("🎬🎬🎬🎬🎬", 5)).toBe("🎬🎬🎬🎬🎬");
  });

  it("ignores invalid wrap widths", () => {
    expect(wrapCueLines("a b c", 0)).toBe("a b c");
    expect(wrapCueLines("a b c", -5)).toBe("a b c");
    expect(wrapCueLines("a b c", 4.5)).toBe("a b c");
  });

  it("cleanCues applies the whole batch and counts changes, preserving timing", () => {
    const cues = [
      cue(1000, 2000, "NARRATOR: <b>LISTEN</b>"),
      cue(3000, 4000, "[applause]"),
    ];
    const { cues: cleaned, changed, dropped } = cleanCues(cues, {
      stripTags: true,
      removeSpeakers: true,
      removeSoundEffects: true,
      lowercase: true,
      wrapAt: 42,
    });
    expect(cleaned).toEqual([cue(1000, 2000, "listen")]);
    expect(changed).toBe(2);
    expect(dropped).toBe(1);
  });

  it("passes Unicode extremes: long lines, emoji, 10⁴+ characters do not hang or throw", () => {
    const big = "word ".repeat(4000).trim();
    expect(wrapCueLines(big, 40).split("\n").length).toBeGreaterThan(100);
    expect(stripFormatting(big.repeat(1), { stripTags: true }).length).toBeGreaterThan(0);
    expect(cleanCues([cue(0, 1000, "🎬".repeat(5000))], { wrapAt: 50 }).cues.length).toBe(1);
  });
});
