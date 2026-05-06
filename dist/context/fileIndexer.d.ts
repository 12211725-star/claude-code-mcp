export interface FileExcerpt {
    path: string;
    content: string;
    lineStart: number;
    lineEnd: number;
    tokens: number;
}
/**
 * File indexer for extracting relevant fragments.
 * Helps keep context small by only loading what's needed.
 */
export declare class FileIndexer {
    private workspaceRoot;
    constructor(workspaceRoot: string);
    /**
     * Load a file and return an excerpt with line numbers.
     */
    loadWithLines(filePath: string, offset?: number, limit?: number): Promise<{
        content: string;
        lineCount: number;
    }>;
    /**
     * Get a snippet from a file (by matching a pattern).
     */
    getSnippet(filePath: string, pattern: string, contextLines?: number): Promise<string[]>;
    /**
     * Extract imports and exports from a TypeScript file.
     */
    getImports(filePath: string): Promise<string[]>;
}
//# sourceMappingURL=fileIndexer.d.ts.map