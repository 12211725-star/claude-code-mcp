/**
 * Tool Executor — dispatches tool calls from the orchestrator.
 * Central registry that maps tool names to handlers.
 */
import type { AppContext } from "../types.js";
/**
 * Execute a tool by name with given arguments.
 * This is the centralized dispatch used by the agent orchestrator.
 */
export declare function executeTool(toolName: string, args: Record<string, unknown>, ctx: AppContext): Promise<unknown>;
/**
 * Get all registered tool names.
 */
export declare function getToolNames(): string[];
//# sourceMappingURL=executor.d.ts.map