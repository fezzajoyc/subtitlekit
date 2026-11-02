import { describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "@/mcp/server";

async function connect() {
  const server = createServer();
  const client = new Client({ name: "test", version: "0.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

/**
 * 与 tests/subtitle.test.ts 同一套手算基准:
 * 1.000→3.000 与 5.000→7.500 两条 cue;平移 +2000ms、-5000ms(截断)、缩放 ×2;
 * 重叠/写反/零时长/乱序的修复全部手推。
 */
const SRT_A = [
  "1",
  "00:00:01,000 --> 00:00:03,000",
  "Hello world",
  "",
  "2",
  "00:00:05,000 --> 00:00:07,500",
  "Second <i>line</i>",
  "",
].join("\n");

const VTT_A = [
  "WEBVTT",
  "",
  "00:00:01.000 --> 00:00:03.000",
  "Hello world",
  "",
  "00:00:05.000 --> 00:00:07.500",
  "Second <i>line</i>",
  "",
].join("\n");

type CallResult = { content: { text: string }[]; isError?: boolean };
const call = async (client: Client, name: string, args: Record<string, unknown>): Promise<CallResult> =>
  (await client.callTool({ name, arguments: args })) as CallResult;

describe("subtitlekit MCP server", () => {
  it("exposes exactly the five SubtitleKit tools", async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    expect(tools.length).toBe(5);
    expect(new Set(tools.map((t) => t.name))).toEqual(
      new Set(["srt_vtt_convert", "subtitle_shift", "subtitle_merge", "subtitle_fix", "subtitle_clean"]),
    );
    // 每个工具都有 schema 与说明,AI 客户端靠它们路由
    for (const tool of tools) {
      expect(tool.description?.length ?? 0).toBeGreaterThan(20);
      expect(tool.inputSchema).toBeTruthy();
    }
    await client.close();
  });

  it("converts SRT to WebVTT (dot milliseconds, header, no numbers) keeping tags", async () => {
    const client = await connect();
    const r = await call(client, "srt_vtt_convert", { content: SRT_A, to: "vtt" });
    expect(r.isError).toBeUndefined();
    expect(r.content[0].text).toBe(VTT_A);
    await client.close();
  });

  it("converts WebVTT back to SRT — roundtrip is byte-identical to the original SRT", async () => {
    const client = await connect();
    const r = await call(client, "srt_vtt_convert", { content: VTT_A, to: "srt" });
    expect(r.isError).toBeUndefined();
    expect(r.content[0].text).toBe(SRT_A);
    const again = await call(client, "srt_vtt_convert", { content: SRT_A, to: "srt" });
    expect(again.content[0].text).toBe(SRT_A); // same-format conversion = normalized identity
    await client.close();
  });

  it("delays every cue by +2000 ms in the same format", async () => {
    const client = await connect();
    const r = await call(client, "subtitle_shift", { content: SRT_A, offset_ms: 2000 });
    expect(r.isError).toBeUndefined();
    expect(r.content[0].text).toBe(
      [
        "1",
        "00:00:03,000 --> 00:00:05,000",
        "Hello world",
        "",
        "2",
        "00:00:07,000 --> 00:00:09,500",
        "Second <i>line</i>",
        "",
      ].join("\n"),
    );
    await client.close();
  });

  it("advances by -5000 ms and clamps the first cue at 00:00:00,000", async () => {
    const client = await connect();
    const r = await call(client, "subtitle_shift", { content: SRT_A, offset_ms: -5000 });
    expect(r.content[0].text).toBe(
      [
        "1",
        "00:00:00,000 --> 00:00:00,000",
        "Hello world",
        "",
        "2",
        "00:00:00,000 --> 00:00:02,500",
        "Second <i>line</i>",
        "",
      ].join("\n"),
    );
    await client.close();
  });

  it("scales all timestamps by a factor (×2) without moving text", async () => {
    const client = await connect();
    const r = await call(client, "subtitle_shift", { content: SRT_A, offset_ms: 0, scale: 2 });
    const scaled = r.content[0].text;
    expect(scaled).toContain("00:00:02,000 --> 00:00:06,000");
    expect(scaled).toContain("00:00:10,000 --> 00:00:15,000");
    expect(scaled).toContain("Second <i>line</i>");
    await client.close();
  });

  it("stacks the secondary track under the primary by time overlap, keeping the primary format", async () => {
    const client = await connect();
    const secondary = [
      "1",
      "00:00:01,200 --> 00:00:03,100",
      "Bonjour",
      "",
      "2",
      "00:00:05,000 --> 00:00:07,000",
      "Salut",
      "",
    ].join("\n");
    const r = await call(client, "subtitle_merge", { primary: SRT_A, secondary });
    expect(r.isError).toBeUndefined();
    expect(r.content[0].text).toBe(
      [
        "1",
        "00:00:01,000 --> 00:00:03,000",
        "Hello world",
        "Bonjour",
        "",
        "2",
        "00:00:05,000 --> 00:00:07,500",
        "Second <i>line</i>",
        "Salut",
        "",
      ].join("\n"),
    );
    await client.close();
  });

  it("drops unmatched secondary cues when keep_unmatched=false, appends them otherwise", async () => {
    const client = await connect();
    const far = ["1", "00:01:00,000 --> 00:01:02,000", "Orphelin", ""].join("\n");
    const kept = await call(client, "subtitle_merge", { primary: SRT_A, secondary: far });
    expect(kept.content[0].text).toContain("00:01:00,000 --> 00:01:02,000");
    const dropped = await call(client, "subtitle_merge", { primary: SRT_A, secondary: far, keep_unmatched: false });
    expect(dropped.content[0].text).not.toContain("Orphelin");
    await client.close();
  });

  it("diagnoses and fixes reversed, zero-duration, overlapping and out-of-order cues", async () => {
    const client = await connect();
    const broken = [
      "1",
      "00:00:02,000 --> 00:00:04,000",
      "B",
      "",
      "2",
      "00:00:01,000 --> 00:00:00,500",
      "A",
      "",
      "3",
      "00:00:03,500 --> 00:00:05,000",
      "D",
      "",
      "4",
      "00:00:05,000 --> 00:00:05,000",
      "C",
      "",
    ].join("\n");
    const r = await call(client, "subtitle_fix", { content: broken });
    expect(r.isError).toBeUndefined();
    const parsed = JSON.parse(r.content[0].text);
    expect(parsed.issues_before).toMatchObject({ out_of_order: 1, negative_duration: 1, zero_duration: 1, overlap: 1 });
    expect(parsed.issues_after).toEqual({});
    const types = parsed.fixes_applied.map((f: any) => f.type);
    expect(types).toEqual(expect.arrayContaining(["reorder", "reversed", "zero-duration", "overlap"]));
    // 修复后:排序、写反交换、重叠截断、零时长补时、序号重建
    expect(parsed.fixed).toBe(
      [
        "1",
        "00:00:00,500 --> 00:00:01,000",
        "A",
        "",
        "2",
        "00:00:02,000 --> 00:00:03,500",
        "B",
        "",
        "3",
        "00:00:03,500 --> 00:00:05,000",
        "D",
        "",
        "4",
        "00:00:05,000 --> 00:00:05,500",
        "C",
        "",
      ].join("\n"),
    );
    await client.close();
  });

  it("closes a 50 ms gap by extending the earlier cue to the next start", async () => {
    const client = await connect();
    const gappy = [
      "1",
      "00:00:01,000 --> 00:00:02,000",
      "A",
      "",
      "2",
      "00:00:02,050 --> 00:00:03,000",
      "B",
      "",
    ].join("\n");
    const r = await call(client, "subtitle_fix", { content: gappy });
    const parsed = JSON.parse(r.content[0].text);
    expect(parsed.issues_before).toMatchObject({ short_gap: 1 });
    expect(parsed.issues_after).toEqual({});
    expect(parsed.fixed).toContain("00:00:01,000 --> 00:00:02,050");
    await client.close();
  });

  it("strips tags, speakers and sound effects, lowercases and wraps — dropping emptied cues", async () => {
    const client = await connect();
    const dirty = [
      "1",
      "00:00:01,000 --> 00:00:02,000",
      "NARRATOR: <i>Hello</i> World",
      "",
      "2",
      "00:00:03,000 --> 00:00:04,000",
      "[Music] ♪",
      "",
      "3",
      "00:00:05,000 --> 00:00:06,000",
      "- MAN: SPEAK NOW",
      "",
    ].join("\n");
    const r = await call(client, "subtitle_clean", {
      content: dirty,
      strip_tags: true,
      remove_speakers: true,
      remove_sound_effects: true,
      lowercase: true,
      wrap_at: 10,
    });
    expect(r.isError).toBeUndefined();
    const parsed = JSON.parse(r.content[0].text);
    expect(parsed.cue_count).toBe(2);
    expect(parsed.cues_modified).toBe(3);
    expect(parsed.empty_cues_removed).toBe(1);
    expect(parsed.cleaned).toBe(
      ["1", "00:00:01,000 --> 00:00:02,000", "hello", "world", "", "2", "00:00:05,000 --> 00:00:06,000", "speak now", ""].join("\n"),
    );
    await client.close();
  });

  it("guards both layers: schema violations and non-subtitle input", async () => {
    const client = await connect();
    // 逻辑层:根本不是字幕 → isError,不静默返回
    const garbage = await call(client, "srt_vtt_convert", { content: "just some prose, no timestamps", to: "vtt" });
    expect(garbage.isError).toBe(true);
    expect(garbage.content[0].text).toContain("no cues found");
    const garbageShift = await call(client, "subtitle_shift", { content: "nope", offset_ms: 1 });
    expect(garbageShift.isError).toBe(true);
    // schema 层:缺参数 / 空串 / 非法枚举 / 非法数值 → zod 拒绝(-32602)
    const missing = await call(client, "srt_vtt_convert", { to: "vtt" });
    expect((missing as any).isError).toBe(true);
    expect(missing.content[0].text).toContain("-32602");
    const empty = await call(client, "subtitle_clean", { content: "" });
    expect((empty as any).isError).toBe(true);
    const badEnum = await call(client, "srt_vtt_convert", { content: SRT_A, to: "ass" });
    expect((badEnum as any).isError).toBe(true);
    const badScale = await call(client, "subtitle_shift", { content: SRT_A, offset_ms: 0, scale: -1 });
    expect((badScale as any).isError).toBe(true);
    const badWrap = await call(client, "subtitle_clean", { content: SRT_A, wrap_at: 3 });
    expect((badWrap as any).isError).toBe(true);
    await client.close();
  });
});
