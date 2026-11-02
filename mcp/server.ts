import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MCP_TOOLS } from "./tools";

/**
 * SubtitleKit MCP server(stdio):把站上字幕工具背后的纯函数逻辑
 * 暴露为 AI 可执行工具。人和 AI 用同一份经过测试的实现。
 *
 * 构建后运行:npx subtitlekit-mcp(或 node mcp/dist/server.mjs)
 */

export function createServer() {
  const server = new McpServer(
    { name: "subtitlekit", version: "1.0.0" },
    {
      instructions:
        "SubtitleKit: subtitle file tools. These executable tools run the same tested logic as the website (https://subtitlekit.app). Subtitles are passed as full file text (SRT or WebVTT, auto-detected) and returned as file text — no reimplementation needed. Times are milliseconds; shifting clamps at 00:00:00,000 by default; fixing is deterministic (sort, swap reversed times, trim overlaps at the next cue's start, close gaps under the threshold) and never touches formatting tags.",
    },
  );

  for (const tool of MCP_TOOLS) {
    server.registerTool(tool.name, {
      title: tool.title,
      description: tool.description,
      inputSchema: tool.schema,
    }, async (args) => {
      try {
        return tool.run(args ?? {});
      } catch (e) {
        return {
          content: [{ type: "text" as const, text: `error: ${(e as Error).message}` }],
          isError: true,
        };
      }
    });
  }
  return server;
}

export async function runStdio() {
  const server = createServer();
  await server.connect(new StdioServerTransport());
  // stdio 模式下保持进程存活;stderr 可写日志(stdout 是协议通道)
  console.error(`subtitlekit MCP server: ${MCP_TOOLS.length} tools ready`);
}

if (process.argv[1] && process.argv[1].includes("server")) {
  void runStdio();
}
