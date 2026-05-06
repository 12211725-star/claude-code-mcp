/**
 * backgroundTask Tool — spawn, monitor, and await background tasks.
 * Ports Claude Code's background task execution model.
 */
import { TaskManager } from "../agent/taskManager.js";
export const backgroundTaskTool = {
    name: "background_task",
    description: `管理后台任务 — 对标 Claude Code 的 TaskOutput / 后台运行机制。

操作:
- spawn: 启动后台子Agent任务，立即返回任务ID
- list: 列出所有后台任务及状态
- wait: 等待指定任务完成并返回结果
- cancel: 取消运行中的任务
- poll: 获取最近完成的任务结果

用于: 并行处理独立任务、长时间运行的操作、分批执行`,
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: "string",
                enum: ["spawn", "list", "wait", "cancel", "poll"],
                description: "操作类型",
            },
            description: {
                type: "string",
                description: "(spawn) 任务简短描述",
            },
            prompt: {
                type: "string",
                description: "(spawn) 给后台子Agent的完整指令",
            },
            task_id: {
                type: "string",
                description: "(wait/cancel) 任务ID",
            },
            timeout_ms: {
                type: "number",
                description: "(wait) 等待超时毫秒数。默认 300000 (5分钟)",
            },
            subagent_type: {
                type: "string",
                enum: ["search", "explore", "plan", "generate"],
                description: "(spawn) 子Agent类型",
            },
        },
        required: ["action"],
    },
    async handler(args, ctx) {
        const a = args;
        // Lazy-initialize task manager on the app context
        const taskManager = getOrCreateTaskManager(ctx);
        switch (a.action) {
            case "spawn": {
                if (!a.description || !a.prompt) {
                    throw new Error("spawn 操作需要 description 和 prompt 参数");
                }
                const task = taskManager.spawnAgent(a.description, a.prompt, {
                    notifyOnCompletion: true,
                    subagentType: a.subagent_type,
                });
                return {
                    task_id: task.id,
                    description: task.description,
                    status: task.status,
                    created_at: task.createdAt.toISOString(),
                    hint: "使用 background_task action=wait task_id=<id> 等待结果",
                };
            }
            case "list": {
                const tasks = taskManager.listTasks();
                return {
                    summary: taskManager.getSummary(),
                    tasks: tasks.map((t) => ({
                        id: t.id,
                        description: t.description,
                        type: t.type,
                        status: t.status,
                        created_at: t.createdAt.toISOString(),
                    })),
                };
            }
            case "wait": {
                if (!a.task_id) {
                    throw new Error("wait 操作需要 task_id 参数");
                }
                const result = await taskManager.waitForTask(a.task_id, a.timeout_ms);
                if (!result) {
                    return {
                        status: "timeout_or_not_found",
                        task_id: a.task_id,
                        hint: "任务可能尚未完成或不存在。使用 action=list 检查状态。",
                    };
                }
                return {
                    task_id: a.task_id,
                    success: result.success,
                    output: result.output,
                    error: result.error,
                    tool_call_count: result.toolCallCount,
                    tokens_used: result.tokensUsed,
                    iterations: result.iterations,
                };
            }
            case "cancel": {
                if (!a.task_id) {
                    throw new Error("cancel 操作需要 task_id 参数");
                }
                const cancelled = taskManager.cancelTask(a.task_id);
                return {
                    task_id: a.task_id,
                    cancelled,
                };
            }
            case "poll": {
                const completed = taskManager.pollCompletedTasks();
                return {
                    count: completed.length,
                    tasks: completed.map((t) => ({
                        id: t.id,
                        description: t.description,
                        status: t.status,
                        success: t.result?.success,
                        output: t.result?.output,
                    })),
                };
            }
            default:
                throw new Error(`Unknown action: ${a.action}`);
        }
    },
};
/** Singleton task manager stored on the app context. */
function getOrCreateTaskManager(ctx) {
    if (!ctx.__taskManager) {
        ctx.__taskManager = new TaskManager(ctx);
    }
    return ctx.__taskManager;
}
//# sourceMappingURL=backgroundTask.js.map