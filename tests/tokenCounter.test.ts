import { describe, it, expect } from "vitest";
import { TokenCounter } from "../src/context/tokenCounter.js";

describe("TokenCounter", () => {
  describe("estimate()", () => {
    it("returns 0 for empty string", () => {
      expect(TokenCounter.estimate("")).toBe(0);
    });

    it("estimates Chinese text reasonably", () => {
      const tokens = TokenCounter.estimate("你好世界这是一个测试句子");
      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThan(30);
    });

    it("estimates English text reasonably", () => {
      const tokens = TokenCounter.estimate("Hello world this is a test");
      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThan(20);
    });

    it("handles mixed Chinese + English", () => {
      const tokens = TokenCounter.estimate("Hello 你好 World 世界");
      expect(tokens).toBeGreaterThan(0);
    });

    it("handles code-like text", () => {
      const tokens = TokenCounter.estimate("const x = { foo: 'bar' };");
      expect(tokens).toBeGreaterThan(0);
    });

    it("gives higher count for longer text", () => {
      const short = TokenCounter.estimate("hi");
      const long = TokenCounter.estimate("this is a much longer piece of text with many words");
      expect(long).toBeGreaterThan(short);
    });
  });

  describe("estimateMessages()", () => {
    it("sums tokens across messages", () => {
      const messages = [
        { role: "system", content: "You are helpful." },
        { role: "user", content: "你好" },
      ];
      const total = TokenCounter.estimateMessages(messages);
      const individual = messages.reduce(
        (sum, m) => sum + TokenCounter.estimate(m.role + m.content),
        0
      );
      expect(total).toBe(individual);
    });

    it("returns 0 for empty messages", () => {
      expect(TokenCounter.estimateMessages([])).toBe(0);
    });
  });
});
