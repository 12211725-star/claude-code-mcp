export interface ContextConfig {
    maxTokens: number;
    reservedTokensForResponse: number;
    summarizationThreshold: number;
    enableSummarization: boolean;
    keepLastNMessages: number;
}
export interface EditRecord {
    file: string;
    diff: string;
    timestamp: number;
}
export declare class ContextManager {
    private messages;
    private summaries;
    private editHistory;
    private tokenCount;
    private config;
    constructor(config?: Partial<ContextConfig>);
    /**
     * Add a message and auto-manage the context window.
     * Ports Claude Code's context compression strategy.
     */
    addMessage(role: string, content: string): void;
    /**
     * Check if compression is needed.
     */
    private shouldSummarize;
    /**
     * Context compression — Claude Code's core strategy.
     *
     * Strategy:
     * 1. Keep system prompt (always at top — handled externally)
     * 2. Keep last N messages intact
     * 3. Middle messages → extract key decisions and code changes summary
     * 4. Merge into compressed summary section
     */
    private compress;
    /**
     * Extract key decisions from compressed messages.
     */
    private extractKeyDecisions;
    /**
     * Record an edit for history tracking.
     */
    recordEdit(edit: {
        file: string;
        diff: string;
        timestamp: number;
    }): void;
    /**
     * Get full context for the model.
     */
    getContext(): Array<{
        role: string;
        content: string;
    }>;
    /**
     * Get recent edit history.
     */
    getRecentEdits(limit?: number): EditRecord[];
    /**
     * Get context statistics.
     */
    getStats(): {
        messageCount: number;
        summaryCount: number;
        totalEdits: number;
        estimatedTokens: number;
        usagePercent: number;
    };
}
//# sourceMappingURL=manager.d.ts.map