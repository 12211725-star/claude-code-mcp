/**
 * Token counter compatible with multiple models (DeepSeek, Qwen, Doubao, OpenAI).
 * Uses heuristic estimation since domestic LLMs don't always expose tokenizers.
 */
export class TokenCounter {
  /**
   * Estimate token count for a text string.
   *
   * Heuristic based on empirical testing:
   * - Chinese: ~1.5 characters/token
   * - English: ~4 characters/token
   * - Code: ~3 characters/token
   */
  static estimate(text: string): number {
    if (!text) return 0;

    const chineseChars = (text.match(/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/g) || []).length;
    const codeChars = (text.match(/[{}[\]();=<>+\-*/%&|^!~.,:;#'"`\\/]/g) || []).length;
    const otherChars = text.length - chineseChars - codeChars;

    // Chinese chars: ~1.5 per token
    // Code punctuation: ~1 per token
    // English/other: ~4 per token
    const estimated = Math.ceil(
      chineseChars / 1.5 + codeChars / 1.0 + otherChars / 4
    );

    return Math.max(1, estimated);
  }

  /**
   * Estimate token count for a list of messages.
   */
  static estimateMessages(messages: Array<{ role: string; content: string }>): number {
    return messages.reduce((sum, m) => sum + TokenCounter.estimate(m.role + m.content), 0);
  }
}
