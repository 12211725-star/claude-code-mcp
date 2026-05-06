/**
 * Diff Engine — generates precise diffs for smart_edit operations.
 *
 * Ports Claude Code's diff display style.
 */
export interface DiffResult {
    fileName: string;
    patch: string;
    additions: number;
    deletions: number;
    hunks: number;
}
/**
 * Generate a unified diff between old and new content.
 */
export declare function generateDiff(fileName: string, oldContent: string, newContent: string): DiffResult;
/**
 * Find the exact position of a string within file content.
 * Returns { line, column } for each occurrence.
 */
export declare function findStringPositions(content: string, search: string): Array<{
    line: number;
    column: number;
    offset: number;
}>;
/**
 * Suggest similar strings within content (fuzzy matching for smart_edit).
 */
export declare function findSimilarText(content: string, search: string, maxResults?: number): Array<{
    text: string;
    line: number;
    score: number;
}>;
//# sourceMappingURL=diffEngine.d.ts.map