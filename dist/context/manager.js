import { TokenCounter } from "./tokenCounter.js";
export class ContextManager {
    messages = [];
    summaries = [];
    editHistory = [];
    tokenCount = 0;
    config;
    constructor(config = {}) {
        this.config = {
            maxTokens: config.maxTokens || 120000,
            reservedTokensForResponse: config.reservedTokensForResponse || 4000,
            summarizationThreshold: config.summarizationThreshold || 0.7,
            enableSummarization: config.enableSummarization ?? true,
            keepLastNMessages: config.keepLastNMessages || 6,
        };
    }
    /**
     * Add a message and auto-manage the context window.
     * Ports Claude Code's context compression strategy.
     */
    addMessage(role, content) {
        const estimatedTokens = TokenCounter.estimate(content);
        this.messages.push({ role, content });
        this.tokenCount += estimatedTokens;
        if (this.shouldSummarize()) {
            this.compress();
        }
    }
    /**
     * Check if compression is needed.
     */
    shouldSummarize() {
        const availableForMessages = this.config.maxTokens - this.config.reservedTokensForResponse;
        return (this.tokenCount > availableForMessages * this.config.summarizationThreshold);
    }
    /**
     * Context compression — Claude Code's core strategy.
     *
     * Strategy:
     * 1. Keep system prompt (always at top — handled externally)
     * 2. Keep last N messages intact
     * 3. Middle messages → extract key decisions and code changes summary
     * 4. Merge into compressed summary section
     */
    compress() {
        const keepCount = this.config.keepLastNMessages;
        const toCompress = this.messages.slice(0, -keepCount);
        const toKeep = this.messages.slice(-keepCount);
        if (toCompress.length === 0)
            return;
        // Extract key information
        const compressionSummary = this.extractKeyDecisions(toCompress);
        this.summaries.push(compressionSummary);
        // Rebuild message list
        const compressedMessages = [];
        // Compressed history as system note
        compressedMessages.push({
            role: "system",
            content: `[COMPRESSED HISTORY - ${this.summaries.length} segments]\n\n${this.summaries.join("\n\n---\n\n")}`,
        });
        // Keep recent messages
        compressedMessages.push(...toKeep);
        this.messages = compressedMessages;
        this.tokenCount = TokenCounter.estimateMessages(this.messages);
    }
    /**
     * Extract key decisions from compressed messages.
     */
    extractKeyDecisions(messages) {
        const decisions = [];
        const fileChanges = new Set();
        for (const msg of messages) {
            // Extract key user intents
            if (msg.role === "user") {
                const trimmed = msg.content.substring(0, 300);
                decisions.push(`User requested: "${trimmed}..."`);
            }
            // Extract file changes
            const editPattern = /(?:edit|modify|change|update|create|delete)\s+(?:file\s+)?[`"']?([a-zA-Z0-9_/.-]+)[`"']?/gi;
            let match;
            while ((match = editPattern.exec(msg.content)) !== null) {
                fileChanges.add(match[1]);
            }
        }
        let summary = "## Session Summary\n\n";
        summary += `Key decisions made: ${decisions.length}\n`;
        summary += decisions
            .slice(-10)
            .map((d, i) => `${i + 1}. ${d}`)
            .join("\n");
        if (fileChanges.size > 0) {
            summary += `\n\nFiles modified: ${[...fileChanges].join(", ")}`;
        }
        return summary;
    }
    /**
     * Record an edit for history tracking.
     */
    recordEdit(edit) {
        this.editHistory.push(edit);
        if (this.editHistory.length > 100) {
            this.editHistory = this.editHistory.slice(-50);
        }
    }
    /**
     * Get full context for the model.
     */
    getContext() {
        return this.messages;
    }
    /**
     * Get recent edit history.
     */
    getRecentEdits(limit = 10) {
        return this.editHistory.slice(-limit);
    }
    /**
     * Get context statistics.
     */
    getStats() {
        return {
            messageCount: this.messages.length,
            summaryCount: this.summaries.length,
            totalEdits: this.editHistory.length,
            estimatedTokens: this.tokenCount,
            usagePercent: Math.round((this.tokenCount / this.config.maxTokens) * 100),
        };
    }
}
//# sourceMappingURL=manager.js.map