import type { AppContext } from "../types.js";

export interface TaskStep {
  id: number;
  description: string;
  tool: string;
  file?: string;
  dependencies: number[]; // IDs of steps that must complete first
  risk: "low" | "medium" | "high";
  expectedOutcome: string;
}

export interface TaskPlan {
  title: string;
  steps: TaskStep[];
  estimatedComplexity: "simple" | "moderate" | "complex";
}

/**
 * Task Planner — decomposes complex tasks into ordered, executable steps.
 * Ports Claude Code's internal planning logic.
 */
export class TaskPlanner {
  /**
   * Generate a structured plan from a task description.
   * Uses rule-based heuristics to categorize and sequence operations.
   */
  static plan(description: string, ctx: AppContext): TaskPlan {
    const steps: TaskStep[] = [];
    let stepId = 0;

    const desc = description.toLowerCase();

    // Phase 1: Exploration — always search before editing
    if (hasFileSearch(desc)) {
      steps.push({
        id: ++stepId,
        description: "搜索相关文件",
        tool: "glob_search",
        dependencies: [],
        risk: "low",
        expectedOutcome: "定位目标文件路径",
      });
    }

    if (hasContentSearch(desc)) {
      steps.push({
        id: ++stepId,
        description: "搜索相关代码内容",
        tool: "grep_search",
        dependencies: [],
        risk: "low",
        expectedOutcome: "定位目标代码片段",
      });
    }

    // Phase 2: Read — confirm current state
    if (hasModification(desc)) {
      steps.push({
        id: ++stepId,
        description: "读取目标文件当前内容",
        tool: "read_file",
        dependencies: stepId > 0 ? [stepId] : [],
        risk: "low",
        expectedOutcome: "确认文件当前状态",
      });
    }

    // Phase 3: Edit — make changes
    if (hasCreate(desc)) {
      steps.push({
        id: ++stepId,
        description: "创建新文件",
        tool: "write_file",
        dependencies: steps.length > 0 ? [steps.length] : [],
        risk: "medium",
        expectedOutcome: "新文件创建成功",
      });
    } else if (hasModification(desc)) {
      steps.push({
        id: ++stepId,
        description: "执行精确代码修改",
        tool: "smart_edit",
        dependencies: steps.length > 0 ? [steps.length] : [],
        risk: "medium",
        expectedOutcome: "代码修改成功并生成 diff",
      });
    }

    // Phase 4: Verify
    if (hasVerification(desc)) {
      steps.push({
        id: ++stepId,
        description: "运行测试或构建验证",
        tool: "bash_exec",
        dependencies: steps.length > 0 ? [steps.length] : [],
        risk: "medium",
        expectedOutcome: "验证通过，无错误",
      });
    }

    // Phase 5: Sub-tasks for complex work
    if (isComplex(desc)) {
      steps.push({
        id: ++stepId,
        description: "启动子 Agent 处理独立子任务",
        tool: "task_agent",
        dependencies: [],
        risk: "low",
        expectedOutcome: "子任务并行执行完成",
      });
    }

    return {
      title: description,
      steps,
      estimatedComplexity: steps.length <= 3 ? "simple" : steps.length <= 6 ? "moderate" : "complex",
    };
  }

  /**
   * Check if the plan has unresolved dependencies.
   */
  static validateSteps(steps: TaskStep[]): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    const ids = new Set(steps.map((s) => s.id));

    for (const step of steps) {
      for (const dep of step.dependencies) {
        if (!ids.has(dep)) {
          issues.push(`Step ${step.id} depends on non-existent step ${dep}`);
        }
        if (dep >= step.id) {
          issues.push(`Step ${step.id} depends on later step ${dep} (circular)`);
        }
      }
    }

    return { valid: issues.length === 0, issues };
  }

  /**
   * Format a plan as human-readable markdown.
   */
  static formatPlan(plan: TaskPlan): string {
    const lines: string[] = [
      `# Task Plan: ${plan.title}`,
      `Complexity: **${plan.estimatedComplexity}**`,
      "",
      "| Step | Tool | File | Dependencies | Risk | Expected Outcome |",
      "|------|------|------|-------------|------|-----------------|",
    ];

    for (const step of plan.steps) {
      lines.push(
        `| ${step.id} | ${step.tool} | ${step.file || "-"} | ${step.dependencies.join(", ") || "none"} | ${step.risk} | ${step.expectedOutcome} |`
      );
    }

    return lines.join("\n");
  }
}

// --- Heuristic helpers ---

function hasFileSearch(desc: string): boolean {
  return /(?:找|搜索|定位|查找|在哪).*(?:文件|模块|组件|目录)/.test(desc) ||
    /(?:find|search|locate).*(?:file|module|component)/i.test(desc);
}

function hasContentSearch(desc: string): boolean {
  return /(?:搜索|查找|找).*(?:代码|函数|类|方法|变量|引用|调用)/.test(desc) ||
    /(?:search|find|grep).*(?:code|function|class|method|ref)/i.test(desc);
}

function hasModification(desc: string): boolean {
  return /(?:修改|更改|替换|更新|重构|修复|fix|添加|删除|实现)/.test(desc) ||
    /(?:modify|change|update|refactor|fix|add|remove|implement|edit)/i.test(desc);
}

function hasCreate(desc: string): boolean {
  return /(?:创建|新建|生成|create|new|generate|scaffold)/.test(desc);
}

function hasVerification(desc: string): boolean {
  return /(?:测试|验证|构建|运行|test|verify|build|run)/.test(desc);
}

function isComplex(desc: string): boolean {
  return /(?:多个|并行|同时|复杂|large|complex|parallel|multiple|整个|全部|系统)/.test(desc) ||
    desc.length > 100;
}
