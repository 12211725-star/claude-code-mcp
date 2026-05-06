import { glob } from "glob";
import { readFile } from "fs/promises";
import * as path from "path";
import type { AppContext } from "../types.js";

export const grepSearchTool = {
  name: "grep_search",
  description: `使用正则表达式搜索文件内容——对标 Claude Code 的 Grep 工具。

特性：
- 支持完整的正则表达式语法（默认大小写敏感）
- 可以指定搜索范围（文件类型、路径前缀）
- 返回匹配的文件路径和内容（含行号和上下文）
- 支持 -A/-B/-C 上下文行数`,

  inputSchema: {
    type: "object" as const,
    properties: {
      pattern: {
        type: "string",
        description: "搜索的正则表达式",
      },
      path: {
        type: "string",
        description: "可选：搜索的范围（目录路径）",
      },
      glob: {
        type: "string",
        description: "可选：glob 模式过滤文件。如 '*.ts' 或 'src/**/*.{js,ts}'",
      },
      include: {
        type: "string",
        description: "可选：匹配的文件类型后缀。如 '.ts,.js'",
      },
      contextBefore: {
        type: "number",
        description: "可选：显示匹配行前面的行数（类似 grep -B）",
      },
      contextAfter: {
        type: "number",
        description: "可选：显示匹配行后面的行数（类似 grep -A）",
      },
      contextAround: {
        type: "number",
        description: "可选：显示匹配行前后的行数（类似 grep -C）",
      },
      ignoreCase: {
        type: "boolean",
        description: "可选：是否忽略大小写。默认 false。",
      },
      maxResults: {
        type: "number",
        description: "可选：最大返回结果数。默认 30。",
      },
    },
    required: ["pattern"],
  },

  async handler(args: any, ctx: AppContext) {
    const {
      pattern,
      path: searchPath,
      glob: globPattern,
      contextBefore = 0,
      contextAfter = 0,
      contextAround = 0,
      ignoreCase = false,
      maxResults = ctx.config.tools.grepSearch.maxResults,
    } = args;

    const searchDir = searchPath
      ? path.resolve(ctx.config.workspaceRoot, searchPath)
      : ctx.config.workspaceRoot;

    if (!searchDir.startsWith(path.resolve(ctx.config.workspaceRoot))) {
      throw new Error(`Path traversal detected: ${searchPath}`);
    }

    // Build glob pattern for files to search
    const filePattern = globPattern || "**/*";
    const allFiles = await glob(filePattern, {
      cwd: searchDir,
      nodir: true,
      ignore: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/.next/**", "**/*.lock", "**/*.min.*"],
      absolute: true,
    });

    // Filter by include type
    let filteredFiles = allFiles;
    if (args.include) {
      const exts = args.include.split(",").map((e: string) => e.trim());
      filteredFiles = allFiles.filter((f) =>
        exts.some((ext: string) => f.endsWith(ext))
      );
    }

    const before = contextAround > 0 ? contextAround : contextBefore;
    const after = contextAround > 0 ? contextAround : contextAfter;

    const regex = new RegExp(pattern, ignoreCase ? "gi" : "g");
    const results: Array<{
      file: string;
      matches: Array<{ line: number; content: string; context: string[] }>;
    }> = [];

    for (const file of filteredFiles) {
      if (results.length >= maxResults) break;

      try {
        const content = await readFile(file, "utf-8");
        const lines = content.split("\n");

        // Reset regex
        const fileRegex = new RegExp(pattern, ignoreCase ? "gi" : "g");

        const fileMatches: typeof results[0]["matches"] = [];
        for (let i = 0; i < lines.length; i++) {
          if (fileMatches.length >= 10) break;

          fileRegex.lastIndex = 0;
          if (fileRegex.test(lines[i])) {
            const ctxStart = Math.max(0, i - before);
            const ctxEnd = Math.min(lines.length, i + after + 1);
            const context = lines.slice(ctxStart, ctxEnd);
            fileMatches.push({
              line: i + 1,
              content: lines[i],
              context,
            });
          }
        }

        if (fileMatches.length > 0) {
          results.push({
            file: path.relative(ctx.config.workspaceRoot, file),
            matches: fileMatches,
          });
        }
      } catch {
        // Skip unreadable files
        continue;
      }
    }

    return {
      pattern,
      fileCount: results.length,
      results: results.slice(0, maxResults).map((r) => ({
        file: r.file,
        matchCount: r.matches.length,
        matches: r.matches.map((m) => ({
          line: m.line,
          content: m.content.trim().substring(0, 200),
        })),
      })),
    };
  },
};
