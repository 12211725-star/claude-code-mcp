import * as fs from "fs/promises";
import * as path from "path";
export const readFileTool = {
    name: "read_file",
    description: `读取文件内容，返回带行号的文本。

特性：
- 支持分页读取（设置 offset 和 limit）
- 自动限制大文件（默认最多500行）
- 可读取图片文件（PNG/JPG/GIF/SVG/WebP）以 base64 查看内容
- 支持 PDF 文件分页读取（参数 pages: "1-5" 或 "3"）`,
    inputSchema: {
        type: "object",
        properties: {
            file_path: {
                type: "string",
                description: "要读取的文件路径（相对于项目根目录）",
            },
            offset: {
                type: "number",
                description: "可选：从第几行开始读取（1-based）。不指定则从第一行开始。",
            },
            limit: {
                type: "number",
                description: "可选：最多读取多少行。默认500。",
            },
            pages: {
                type: "string",
                description: "可选：PDF 文件页数范围（如 '1-5' 或 '3'）。仅对 PDF 有效。",
            },
        },
        required: ["file_path"],
    },
    async handler(args, ctx) {
        const { file_path, offset = 1, limit = 500 } = args;
        const fullPath = path.resolve(ctx.config.workspaceRoot, file_path);
        // Safety check
        if (!fullPath.startsWith(path.resolve(ctx.config.workspaceRoot))) {
            throw new Error(`Path traversal detected: ${file_path}`);
        }
        const exists = await fs.stat(fullPath).catch(() => null);
        if (!exists) {
            throw new Error(`File not found: ${file_path}`);
        }
        // Handle images (including webp, bmp, ico)
        const ext = path.extname(file_path).toLowerCase();
        if ([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".bmp", ".ico"].includes(ext)) {
            const content = await fs.readFile(fullPath);
            const base64 = content.toString("base64");
            const mimeMap = {
                ".png": "image/png",
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".gif": "image/gif",
                ".svg": "image/svg+xml",
                ".webp": "image/webp",
                ".bmp": "image/bmp",
                ".ico": "image/x-icon",
            };
            return {
                file: file_path,
                contentType: mimeMap[ext] || `image/${ext.slice(1)}`,
                size: content.length,
                base64,
                note: "图片内容以 base64 编码返回。可直接在支持多模态的模型中查看。",
            };
        }
        // Handle PDF
        if (ext === ".pdf") {
            const pages = args.pages || "1-3";
            return {
                file: file_path,
                contentType: "application/pdf",
                note: `PDF 文件建议使用专门的 PDF 阅读器。请求的页面范围: ${pages}。系统将在后续版本中支持 PDF 解析。`,
            };
        }
        // Handle binary files
        if ([".zip", ".exe", ".bin", ".dll", ".so", ".node"].includes(ext)) {
            throw new Error(`Cannot read binary file: ${file_path}`);
        }
        // Read text file
        const content = await fs.readFile(fullPath, "utf-8");
        const allLines = content.split("\n");
        const startLine = Math.max(0, offset - 1);
        const endLine = Math.min(allLines.length, startLine + limit);
        const lines = allLines.slice(startLine, endLine);
        const output = lines
            .map((line, i) => {
            const lineNum = startLine + i + 1;
            return `${String(lineNum).padStart(6, " ")}\t${line}`;
        })
            .join("\n");
        const header = startLine > 0
            ? `[Showing lines ${startLine + 1}-${endLine} of ${allLines.length} total]\n`
            : `[Total lines: ${allLines.length}]\n`;
        return {
            file: file_path,
            content: header + output,
            totalLines: allLines.length,
        };
    },
};
//# sourceMappingURL=readFile.js.map