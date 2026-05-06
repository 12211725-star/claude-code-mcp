/**
 * Token counter compatible with multiple models (DeepSeek, Qwen, Doubao, OpenAI).
 * Uses heuristic estimation since domestic LLMs don't always expose tokenizers.
 */
export declare class TokenCounter {
    /**
     * Estimate token count for a text string.
     *
     * Heuristic based on empirical testing:
     * - Chinese: ~1.5 characters/token
     * - English: ~4 characters/token
     * - Code: ~3 characters/token
     */
    static estimate(text: string): number;
    /**
     * Estimate token count for a list of messages.
     */
    static estimateMessages(messages: Array<{
        role: string;
        content: string;
    }>): number;
}
//# sourceMappingURL=tokenCounter.d.ts.map