import { readFile } from "fs/promises";
import { resolve } from "path";
/**
 * File indexer for extracting relevant fragments.
 * Helps keep context small by only loading what's needed.
 */
export class FileIndexer {
    workspaceRoot;
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
    }
    /**
     * Load a file and return an excerpt with line numbers.
     */
    async loadWithLines(filePath, offset, limit) {
        const fullPath = resolve(this.workspaceRoot, filePath);
        const raw = await readFile(fullPath, "utf-8");
        const lines = raw.split("\n");
        const targetLines = limit
            ? lines.slice(offset || 0, (offset || 0) + limit)
            : lines;
        const result = targetLines
            .map((line, i) => {
            const lineNum = (offset || 0) + i + 1;
            return `${String(lineNum).padStart(6, " ")}  ${line}`;
        })
            .join("\n");
        return { content: result, lineCount: lines.length };
    }
    /**
     * Get a snippet from a file (by matching a pattern).
     */
    async getSnippet(filePath, pattern, contextLines = 3) {
        const fullPath = resolve(this.workspaceRoot, filePath);
        const raw = await readFile(fullPath, "utf-8");
        const lines = raw.split("\n");
        const snippets = [];
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(pattern)) {
                const start = Math.max(0, i - contextLines);
                const end = Math.min(lines.length, i + contextLines + 1);
                const snippet = lines
                    .slice(start, end)
                    .map((l, j) => `${String(start + j + 1).padStart(6)}  ${l}`)
                    .join("\n");
                snippets.push(snippet);
                if (snippets.length >= 5)
                    break;
            }
        }
        return snippets;
    }
    /**
     * Extract imports and exports from a TypeScript file.
     */
    async getImports(filePath) {
        const fullPath = resolve(this.workspaceRoot, filePath);
        const raw = await readFile(fullPath, "utf-8");
        const lines = raw.split("\n");
        return lines.filter((l) => /^\s*import\s/.test(l) || /^\s*export\s/.test(l));
    }
}
//# sourceMappingURL=fileIndexer.js.map