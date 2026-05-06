/**
 * Tool Executor — dispatches tool calls from the orchestrator.
 * Central registry that maps tool names to handlers.
 */

import { smartEditTool } from "./smartEdit.js";
import { globSearchTool } from "./globSearch.js";
import { grepSearchTool } from "./grepSearch.js";
import { bashExecTool } from "./bashExec.js";
import { readFileTool } from "./readFile.js";
import { writeFileTool } from "./writeFile.js";
import { taskAgentTool } from "./taskAgent.js";
import type { AppContext } from "../types.js";

// Map tool name → handler
const TOOL_REGISTRY: Record<
  string,
  (args: Record<string, unknown>, ctx: AppContext) => Promise<unknown>
> = {
  smart_edit: smartEditTool.handler,
  glob_search: globSearchTool.handler,
  grep_search: grepSearchTool.handler,
  bash_exec: bashExecTool.handler,
  read_file: readFileTool.handler,
  write_file: writeFileTool.handler,
  task_agent: taskAgentTool.handler,
};

/**
 * Execute a tool by name with given arguments.
 * This is the centralized dispatch used by the agent orchestrator.
 */
export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  ctx: AppContext
): Promise<unknown> {
  const handler = TOOL_REGISTRY[toolName];
  if (!handler) {
    throw new Error(
      `Unknown tool: "${toolName}". Available: ${Object.keys(TOOL_REGISTRY).join(", ")}`
    );
  }
  return handler(args, ctx);
}

/**
 * Get all registered tool names.
 */
export function getToolNames(): string[] {
  return Object.keys(TOOL_REGISTRY);
}
