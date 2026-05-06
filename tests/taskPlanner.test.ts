import { describe, it, expect } from "vitest";
import { TaskPlanner } from "../src/agent/planner.js";
import type { AppContext } from "../src/types.js";

// Minimal mock context for testing
const mockCtx: AppContext = {
  config: {
    workspaceRoot: "/test",
    model: { provider: "deepseek", name: "test-model", apiKey: "sk-test" },
    context: {
      maxTokens: 120000,
      reservedTokensForResponse: 4000,
      summarizationThreshold: 0.7,
      enableSummarization: true,
      keepLastNMessages: 6,
      subAgentMaxTokens: 8000,
    },
    sandbox: {
      allowedCommands: [],
      blockedCommands: [],
      timeoutMs: 30000,
      maxOutputBytes: 102400,
    },
    tools: {
      smartEdit: { enabled: true, maxFileSize: 1048576 },
      globSearch: { enabled: true, maxResults: 50 },
      grepSearch: { enabled: true, maxResults: 30 },
      bashExec: { enabled: true },
      taskAgent: { enabled: true, maxConcurrent: 3 },
    },
  },
  model: {} as any,
  modelFactory: {} as any,
  contextManager: {} as any,
};

describe("TaskPlanner", () => {
  describe("plan()", () => {
    it("creates a plan with search steps for file search tasks", () => {
      const plan = TaskPlanner.plan("搜索所有 TypeScript 文件", mockCtx);
      expect(plan.steps.length).toBeGreaterThan(0);
      expect(plan.steps.some((s) => s.tool === "glob_search")).toBe(true);
    });

    it("creates a plan with search + read for modification tasks", () => {
      const plan = TaskPlanner.plan("修改 index.ts 中的代码", mockCtx);
      expect(plan.steps.some((s) => s.tool === "read_file")).toBe(true);
      expect(plan.steps.some((s) => s.tool === "smart_edit")).toBe(true);
    });

    it("creates write_file step for creation tasks", () => {
      const plan = TaskPlanner.plan("创建一个新的 utils 文件", mockCtx);
      expect(plan.steps.some((s) => s.tool === "write_file")).toBe(true);
    });

    it("includes verify step for tasks needing verification", () => {
      const plan = TaskPlanner.plan("修改代码后运行测试验证", mockCtx);
      expect(plan.steps.some((s) => s.tool === "bash_exec")).toBe(true);
    });

    it("uses task_agent for complex tasks", () => {
      const plan = TaskPlanner.plan(
        "全面分析整个项目结构，包括多个模块的并行处理",
        mockCtx
      );
      expect(plan.steps.some((s) => s.tool === "task_agent")).toBe(true);
    });

    it("classifies complexity correctly", () => {
      const simplePlan = TaskPlanner.plan("找一个文件", mockCtx);
      expect(simplePlan.estimatedComplexity).toBe("simple");

      const complexPlan = TaskPlanner.plan(
        "在整个项目中搜索所有函数定义、修改它们的类型签名、并行运行测试验证",
        mockCtx
      );
      // At least moderate
      expect(["moderate", "complex"]).toContain(complexPlan.estimatedComplexity);
    });

    it("assigns step dependencies correctly", () => {
      const plan = TaskPlanner.plan("修改文件中的代码", mockCtx);
      const editStep = plan.steps.find((s) => s.tool === "smart_edit");
      if (editStep && editStep.dependencies.length > 0) {
        for (const depId of editStep.dependencies) {
          expect(plan.steps.some((s) => s.id === depId)).toBe(true);
        }
      }
    });
  });

  describe("validateSteps()", () => {
    it("validates a correct step list", () => {
      const steps = [
        { id: 1, description: "Step 1", tool: "read_file", dependencies: [], risk: "low" as const, expectedOutcome: "OK" },
        { id: 2, description: "Step 2", tool: "smart_edit", dependencies: [1], risk: "low" as const, expectedOutcome: "OK" },
      ];
      const result = TaskPlanner.validateSteps(steps);
      expect(result.valid).toBe(true);
    });

    it("detects missing dependencies", () => {
      const steps = [
        { id: 1, description: "Step", tool: "smart_edit", dependencies: [99], risk: "low" as const, expectedOutcome: "OK" },
      ];
      const result = TaskPlanner.validateSteps(steps);
      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it("detects circular dependencies", () => {
      const steps = [
        { id: 1, description: "Step 1", tool: "read_file", dependencies: [2], risk: "low" as const, expectedOutcome: "OK" },
        { id: 2, description: "Step 2", tool: "smart_edit", dependencies: [1], risk: "low" as const, expectedOutcome: "OK" },
      ];
      const result = TaskPlanner.validateSteps(steps);
      expect(result.valid).toBe(false);
    });
  });

  describe("formatPlan()", () => {
    it("produces valid markdown", () => {
      const plan = TaskPlanner.plan("测试任务", mockCtx);
      const md = TaskPlanner.formatPlan(plan);
      expect(md).toContain("# Task Plan");
      expect(md).toContain("|");
      expect(md).toContain("Step");
    });
  });
});
