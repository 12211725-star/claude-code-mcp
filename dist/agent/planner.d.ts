import type { AppContext } from "../types.js";
export interface TaskStep {
    id: number;
    description: string;
    tool: string;
    file?: string;
    dependencies: number[];
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
export declare class TaskPlanner {
    /**
     * Generate a structured plan from a task description.
     * Uses rule-based heuristics to categorize and sequence operations.
     */
    static plan(description: string, ctx: AppContext): TaskPlan;
    /**
     * Check if the plan has unresolved dependencies.
     */
    static validateSteps(steps: TaskStep[]): {
        valid: boolean;
        issues: string[];
    };
    /**
     * Format a plan as human-readable markdown.
     */
    static formatPlan(plan: TaskPlan): string;
}
//# sourceMappingURL=planner.d.ts.map