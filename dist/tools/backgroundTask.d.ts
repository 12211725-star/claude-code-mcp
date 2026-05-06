/**
 * backgroundTask Tool — spawn, monitor, and await background tasks.
 * Ports Claude Code's background task execution model.
 */
import type { AppContext } from "../types.js";
export declare const backgroundTaskTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            action: {
                type: string;
                enum: string[];
                description: string;
            };
            description: {
                type: string;
                description: string;
            };
            prompt: {
                type: string;
                description: string;
            };
            task_id: {
                type: string;
                description: string;
            };
            timeout_ms: {
                type: string;
                description: string;
            };
            subagent_type: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: string[];
    };
    handler(args: unknown, ctx: AppContext): Promise<{
        task_id: string;
        description: string;
        status: "pending" | "running" | "completed" | "failed" | "cancelled";
        created_at: string;
        hint: string;
        summary?: undefined;
        tasks?: undefined;
        success?: undefined;
        output?: undefined;
        error?: undefined;
        tool_call_count?: undefined;
        tokens_used?: undefined;
        iterations?: undefined;
        cancelled?: undefined;
        count?: undefined;
    } | {
        summary: string;
        tasks: {
            id: string;
            description: string;
            type: "shell" | "agent";
            status: "pending" | "running" | "completed" | "failed" | "cancelled";
            created_at: string;
        }[];
        task_id?: undefined;
        description?: undefined;
        status?: undefined;
        created_at?: undefined;
        hint?: undefined;
        success?: undefined;
        output?: undefined;
        error?: undefined;
        tool_call_count?: undefined;
        tokens_used?: undefined;
        iterations?: undefined;
        cancelled?: undefined;
        count?: undefined;
    } | {
        status: string;
        task_id: string;
        hint: string;
        description?: undefined;
        created_at?: undefined;
        summary?: undefined;
        tasks?: undefined;
        success?: undefined;
        output?: undefined;
        error?: undefined;
        tool_call_count?: undefined;
        tokens_used?: undefined;
        iterations?: undefined;
        cancelled?: undefined;
        count?: undefined;
    } | {
        task_id: string;
        success: boolean;
        output: unknown;
        error: string | undefined;
        tool_call_count: number;
        tokens_used: number;
        iterations: number;
        description?: undefined;
        status?: undefined;
        created_at?: undefined;
        hint?: undefined;
        summary?: undefined;
        tasks?: undefined;
        cancelled?: undefined;
        count?: undefined;
    } | {
        task_id: string;
        cancelled: boolean;
        description?: undefined;
        status?: undefined;
        created_at?: undefined;
        hint?: undefined;
        summary?: undefined;
        tasks?: undefined;
        success?: undefined;
        output?: undefined;
        error?: undefined;
        tool_call_count?: undefined;
        tokens_used?: undefined;
        iterations?: undefined;
        count?: undefined;
    } | {
        count: number;
        tasks: {
            id: string;
            description: string;
            status: "pending" | "running" | "completed" | "failed" | "cancelled";
            success: boolean | undefined;
            output: unknown;
        }[];
        task_id?: undefined;
        description?: undefined;
        status?: undefined;
        created_at?: undefined;
        hint?: undefined;
        summary?: undefined;
        success?: undefined;
        output?: undefined;
        error?: undefined;
        tool_call_count?: undefined;
        tokens_used?: undefined;
        iterations?: undefined;
        cancelled?: undefined;
    }>;
};
//# sourceMappingURL=backgroundTask.d.ts.map