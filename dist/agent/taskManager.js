/**
 * Background Task Manager — spawn, monitor, and await background tasks.
 *
 * Ports Claude Code's background task execution model:
 * - Tasks spawned with run_in_background=true run independently
 * - Main agent continues work without waiting
 * - Completed tasks notify the agent via a results queue
 */
import { AgentOrchestrator } from "./orchestrator.js";
import { logger } from "../utils/logger.js";
const DEFAULT_CONFIG = {
    maxConcurrentTasks: 5,
    defaultTimeoutMs: 300000, // 5 minutes
};
export class TaskManager {
    tasks = new Map();
    config;
    taskCounter = 0;
    ctx;
    constructor(ctx, config = {}) {
        this.ctx = ctx;
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    /**
     * Spawn a background agent task. Returns immediately with a task ID.
     */
    spawnAgent(description, prompt, options = {}) {
        this.enforceLimit();
        const id = `bg-agent-${++this.taskCounter}-${Date.now()}`;
        const task = {
            id,
            description,
            type: "agent",
            createdAt: new Date(),
            status: "pending",
            cancelled: false,
            notifyOnCompletion: options.notifyOnCompletion ?? true,
        };
        // Create isolated orchestrator
        const orchestrator = new AgentOrchestrator({
            maxIterations: 8,
            maxToolCalls: 15,
            planBeforeExecute: true,
        });
        task.orchestrator = orchestrator;
        task.status = "running";
        // Run in background
        task.promise = orchestrator
            .executeSubAgent(options.subagentType || "general", description, prompt, this.ctx)
            .then((result) => {
            task.status = result.success ? "completed" : "failed";
            task.result = result;
            logger.info(`Background task completed: ${id} (${result.success ? "OK" : "FAIL"})`);
            return result;
        })
            .catch((err) => {
            task.status = "failed";
            task.result = {
                success: false,
                output: null,
                error: err.message,
                toolCallCount: 0,
                tokensUsed: 0,
                iterations: 0,
            };
            logger.error(`Background task failed: ${id}`, err);
            return task.result;
        });
        this.tasks.set(id, task);
        logger.info(`Spawned background task: ${id} — "${description}"`);
        return task;
    }
    /**
     * Get the status of a background task.
     */
    getTask(id) {
        return this.tasks.get(id) || null;
    }
    /**
     * Get all tasks (optionally filtered by status).
     */
    listTasks(status) {
        const all = [...this.tasks.values()];
        if (status) {
            return all.filter((t) => t.status === status);
        }
        return all;
    }
    /**
     * Wait for a specific task to complete.
     */
    async waitForTask(id, timeoutMs) {
        const task = this.tasks.get(id);
        if (!task)
            return null;
        if (task.status === "completed" || task.status === "failed") {
            return task.result || null;
        }
        if (!task.promise)
            return null;
        const timeout = timeoutMs || this.config.defaultTimeoutMs;
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), timeout));
        const result = await Promise.race([task.promise, timeoutPromise]);
        return result;
    }
    /**
     * Cancel a running background task.
     */
    cancelTask(id) {
        const task = this.tasks.get(id);
        if (!task || task.status === "completed" || task.status === "failed") {
            return false;
        }
        task.cancelled = true;
        task.status = "cancelled";
        logger.info(`Cancelled background task: ${id}`);
        return true;
    }
    /**
     * Check for completed tasks and return their results.
     * This is called before each agent response to discover finished background work.
     */
    pollCompletedTasks() {
        return [...this.tasks.values()].filter((t) => t.status === "completed" || t.status === "failed");
    }
    /**
     * Get summary of all tasks.
     */
    getSummary() {
        const all = this.listTasks();
        if (all.length === 0)
            return "无后台任务";
        const byStatus = {};
        for (const t of all) {
            byStatus[t.status] = (byStatus[t.status] || 0) + 1;
        }
        const lines = [`后台任务总数: ${all.length}`];
        for (const [status, count] of Object.entries(byStatus)) {
            const label = {
                pending: "等待中",
                running: "运行中",
                completed: "已完成",
                failed: "失败",
                cancelled: "已取消",
            };
            lines.push(`  ${label[status] || status}: ${count}`);
        }
        return lines.join("\n");
    }
    /**
     * Clean up completed/cancelled tasks older than N minutes.
     */
    cleanup(maxAgeMinutes = 30) {
        const cutoff = Date.now() - maxAgeMinutes * 60 * 1000;
        let removed = 0;
        for (const [id, task] of this.tasks) {
            if ((task.status === "completed" || task.status === "failed" || task.status === "cancelled") &&
                task.createdAt.getTime() < cutoff) {
                this.tasks.delete(id);
                removed++;
            }
        }
        if (removed > 0) {
            logger.info(`Cleaned up ${removed} old background tasks`);
        }
        return removed;
    }
    enforceLimit() {
        const running = this.listTasks("running").length;
        if (running >= this.config.maxConcurrentTasks) {
            throw new Error(`已达到最大并发任务数 (${this.config.maxConcurrentTasks})。请等待已有任务完成。`);
        }
    }
}
//# sourceMappingURL=taskManager.js.map