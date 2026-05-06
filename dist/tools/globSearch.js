import { glob } from "glob";
import * as path from "path";
export const globSearchTool = {
    name: "glob_search",
    description: `按文件名模式搜索文件——对标 Claude Code 的 Glob 工具。

支持标准的 glob 模式：
- "**/*.ts" — 所有 TypeScript 文件
- "src/**/*.test.ts" — src 下的测试文件
- "*.json" — 根目录的 JSON 文件
- "src/components/**/*.tsx" — components 下的所有 TSX`,
    inputSchema: {
        type: "object",
        properties: {
            pattern: {
                type: "string",
                description: "glob 搜索模式",
            },
            path: {
                type: "string",
                description: "可选：在哪个子目录搜索。不指定则搜索整个项目。",
            },
        },
        required: ["pattern"],
    },
    async handler(args, ctx) {
        const { pattern: gpattern, path: searchPath } = args;
        const searchDir = searchPath
            ? path.resolve(ctx.config.workspaceRoot, searchPath)
            : ctx.config.workspaceRoot;
        // Safety check
        if (!searchDir.startsWith(path.resolve(ctx.config.workspaceRoot))) {
            throw new Error(`Path traversal detected: ${searchPath}`);
        }
        const matches = await glob(gpattern, {
            cwd: searchDir,
            nodir: true,
            ignore: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/.next/**"],
            absolute: true,
        });
        const maxResults = ctx.config.tools.globSearch.maxResults;
        const results = matches.slice(0, maxResults).map((m) => path.relative(ctx.config.workspaceRoot, m));
        return {
            pattern: gpattern,
            matchCount: matches.length,
            shownCount: results.length,
            files: results,
        };
    },
};
//# sourceMappingURL=globSearch.js.map