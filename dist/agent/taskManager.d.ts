/**
 * Background Task Manager — spawn, monitor, and await background tasks.
 *
 * Ports Claude Code's background task execution model:
 * - Tasks spawned with run_in_background=true run independently
 * - Main agent continues work without waiting
 * - Completed tasks notify the agent via a results queue
 */
import type { AppContext } from "../types.js";
import { AgentOrchestrator, type ExecutionResult } from "./orchestrator.js";
export interface BackgroundTask {
    /** Unique task ID */
    id: string;
    /** Human-readable description */
    description: string;
    /** Task type */
    type: "agent" | "shell";
    /** When the task was spawned */
    createdAt: Date;
    /** Current status */
    status: "pending" | "running" | "completed" | "failed" | "cancelled";
    /** The orchestrator instance (for agent tasks) */
    orchestrator?: AgentOrchestrator;
    /** Promise for the running task */
    promise?: Promise<ExecutionResult>;
    /** Result (populated after completion) */
    result?: ExecutionResult;
    /** Cancellation token */
    cancelled: boolean;
    /** Whether the task should notify on completion */
    notifyOnCompletion: boolean;
}
interface TaskManagerConfig {
    /** Max concurrent background tasks */
    maxConcurrentTasks: number;
    /** Default timeout for background tasks (ms) */
    defaultTimeoutMs: number;
}
export declare class TaskManager {
    private tasks;
    private config;
    private taskCounter;
    private ctx;
    constructor(ctx: AppContext, config?: Partial<TaskManagerConfig>);
    /**
     * Spawn a background agent task. Returns immediately with a task ID.
     */
    spawnAgent(description: string, prompt: string, options?: {
        notifyOnCompletion?: boolean;
        subagentType?: string;
    }): BackgroundTask;
    /**
     * Get the status of a background task.
     */
    getTask(id: string): BackgroundTask | null;
    /**
     * Get all tasks (optionally filtered by status).
     */
    listTasks(status?: BackgroundTask["status"]): BackgroundTask[];
    /**
     * Wait for a specific task to complete.
     */
    waitForTask(id: string, timeoutMs?: number): Promise<ExecutionResult | null>;
    /**
     * Cancel a running background task.
     */
    cancelTask(id: string): boolean;
    /**
     * Check for completed tasks and return their results.
     * This is called before each agent response to discover finished background work.
     */
    pollCompletedTasks(): BackgroundTask[];
    /**
     * Get summary of all tasks.
     */
    getSummary(): string;
    /**
     * Clean up completed/cancelled tasks older than N minutes.
     */
    cleanup(maxAgeMinutes?: number): number;
    private enforceLimit;
}
export {};
//# sourceMappingURL=taskManager.d.ts.map