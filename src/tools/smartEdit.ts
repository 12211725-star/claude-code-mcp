import * as fs from "fs/promises";
import * as path from "path";
import { createTwoFilesPatch } from "diff";
import type { AppContext } from "../types.js";

export const smartEditTool = {
  name: "smart_edit",
  description: `精确编辑文件——对标 Claude Code 的 Edit 工具。

工作原理：
1. 你提供要编辑的文件路径
2. 你提供「要搜索的原文片段」(old_string)
3. 你提供「替换后的内容」(new_string)
4. 工具在文件中精确查找 old_string，替换为 new_string

规则：
- old_string 必须在文件中恰好出现一次（否则报错，需要你提供更多上下文）
- 只替换第一次匹配（如果多处匹配会提示）
- 保持原有缩进，不要改变缩进风格`,

  inputSchema: {
    type: "object" as const,
    properties: {
      file_path: {
        type: "string",
        description: "要编辑的文件路径（相对于项目根目录）",
      },
      old_string: {
        type: "string",
        description: "要在文件中搜索并替换的原文本片段。必须与文件中的内容精确匹配（包括空格和缩进）。",
      },
      new_string: {
        type: "string",
        description: "替换后的新文本。如果为空字符串则表示删除该片段。",
      },
      expected_replacements: {
        type: "number",
        description: "可选：预期的替换次数。默认1。用于确认替换范围。",
        default: 1,
      },
    },
    required: ["file_path", "old_string", "new_string"],
  },

  async handler(args: any, ctx: AppContext) {
    const { file_path, old_string, new_string, expected_replacements = 1 } = args;

    const fullPath = path.resolve(ctx.config.workspaceRoot, file_path);

    // Safety check: prevent path traversal
    if (!fullPath.startsWith(path.resolve(ctx.config.workspaceRoot))) {
      throw new Error(`Path traversal detected: ${file_path}`);
    }

    // Read file
    const content = await fs.readFile(fullPath, "utf-8");

    // Exact match (Claude Code core logic)
    const occurrences = countOccurrences(content, old_string);

    if (occurrences === 0) {
      const suggestions = findSimilarStrings(content, old_string);
      throw new Error(
        `old_string 在文件中未找到。\n` +
          `你是否想找以下内容？\n` +
          suggestions
            .slice(0, 3)
            .map((s) => `  "${s.substring(0, 100)}..."`)
            .join("\n")
      );
    }

    if (occurrences > expected_replacements) {
      throw new Error(
        `old_string 在文件中出现了 ${occurrences} 次，预期 ${expected_replacements} 次。\n` +
          `请提供更多上下文使匹配唯一。`
      );
    }

    // Execute replacement (replace first occurrence)
    const newContent = content.replace(old_string, new_string);

    // Generate diff
    const diff = createTwoFilesPatch(
      file_path,
      file_path,
      content,
      newContent,
      "原始文件",
      "编辑后"
    );

    // Write file
    await fs.writeFile(fullPath, newContent, "utf-8");

    // Record in context manager
    ctx.contextManager.recordEdit({
      file: file_path,
      diff,
      timestamp: Date.now(),
    });

    return {
      success: true,
      file: file_path,
      replacements: 1,
      diff,
    };
  },
};

function countOccurrences(str: string, search: string): number {
  let count = 0;
  let pos = 0;
  while ((pos = str.indexOf(search, pos)) !== -1) {
    count++;
    pos += search.length;
  }
  return count;
}

function findSimilarStrings(content: string, search: string): string[] {
  const lines = content.split("\n");
  const searchClean = search.replace(/\s+/g, " ").trim();
  const matches: { line: string; score: number }[] = [];

  for (const line of lines) {
    const lineClean = line.replace(/\s+/g, " ").trim();
    if (lineClean.includes(searchClean.substring(0, 20))) {
      matches.push({ line, score: 1 });
    } else if (searchClean.includes(lineClean.substring(0, 20))) {
      matches.push({ line, score: 0.5 });
    }
  }

  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((m) => m.line.trim());
}
