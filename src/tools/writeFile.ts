import * as fs from "fs/promises";
import * as path from "path";
import type { AppContext } from "../types.js";

export const writeFileTool = {
  name: "write_file",
  description: `将内容写入文件——创建新文件或完全覆写已有文件。

注意：
- 这会覆写整个文件，不是追加
- 如果只想修改部分内容，请使用 smart_edit
- 会自动创建不存在的父目录`,

  inputSchema: {
    type: "object" as const,
    properties: {
      file_path: {
        type: "string",
        description: "要写入的文件路径（相对于项目根目录）",
      },
      content: {
        type: "string",
        description: "要写入的完整内容",
      },
    },
    required: ["file_path", "content"],
  },

  async handler(args: any, ctx: AppContext) {
    const { file_path, content } = args;

    const fullPath = path.resolve(ctx.config.workspaceRoot, file_path);

    // Safety check
    if (!fullPath.startsWith(path.resolve(ctx.config.workspaceRoot))) {
      throw new Error(`Path traversal detected: ${file_path}`);
    }

    // Ensure parent directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    const existed = await fs.stat(fullPath).then(() => true).catch(() => false);

    await fs.writeFile(fullPath, content, "utf-8");

    return {
      success: true,
      file: file_path,
      action: existed ? "overwritten" : "created",
    };
  },
};
