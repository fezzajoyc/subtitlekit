# SubtitleKit

字幕文件工具站:为视频创作者处理字幕 **文件**(不做 AI 生成)——格式互转、时间轴平移/缩放、双语合并/拆分、时间轴修复、文本批量清理。全部纯文本处理,零后端,15 种语言。标准见 workspace 的 site-engineering skill。

## 工具(5)

| slug | 功能 |
|---|---|
| `srt-vtt-converter` | SRT ↔ WebVTT 双向转换(BOM/CRLF/序号/标签全保留) |
| `subtitle-shifter` | 时间轴 ±偏移与帧率缩放(25↔23.976 等预设) |
| `subtitle-merger` | 双语轨按时间对齐堆叠;时间段抽取/拆分 |
| `subtitle-fixer` | 诊断并修复乱序/写反/零时长/重叠/短间隙,附前后报告 |
| `subtitle-converter-batch` | 批量文本清理:去标签/去说话人/去音效/小写/折行 |

## 架构

- 纯逻辑全部在 `tools/_lib/subtitle.ts`(毫秒整数时间轴,Cue = { start, end, text, settings? }),Node 可测。
- 引擎在 `tools/_engines/`,"use client",props 可序列化;扩展语言走 `tools/_i18n/` 覆盖层。
- MCP:`mcp/server.ts` 暴露 5 个 AI 可执行工具(`npx subtitlekit-mcp`),`npm run build:mcp` 打包。

## 验证

```bash
npx tsc --noEmit && npm test && npm run build
```

域名拍板后配 `.env.local`,跑 `BASE=<url> npm run audit:seo` 门禁,再按 `docs/launch-runbook.md` 提交。
