import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { smartEditTool } from "./smartEdit.js";
import { globSearchTool } from "./globSearch.js";
import { grepSearchTool } from "./grepSearch.js";
import { bashExecTool } from "./bashExec.js";
import { readFileTool } from "./readFile.js";
import { writeFileTool } from "./writeFile.js";
import { taskAgentTool } from "./taskAgent.js";
import type { AppContext } from "../types.js";
import { logger } from "../utils/logger.js";

const ALL_TOOLS = [
  smartEditTool,
  globSearchTool,
  grepSearchTool,
  bashExecTool,
  readFileTool,
  writeFileTool,
  taskAgentTool,
];

/**
 * Register all tools with the MCP Server.
 * Sets up ListTools and CallTool handlers.
 */
export function registerAllTools(server: Server, ctx: AppContext): void {
  // Handler: list all available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: ALL_TOOLS.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  }));

  // Handler: call a specific tool
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tool = ALL_TOOLS.find((t) => t.name === name);

    if (!tool) {
      const errMsg = `Unknown tool: ${name}. Available: ${ALL_TOOLS.map((t) => t.name).join(", ")}`;
      logger.warn(errMsg);
      throw new Error(errMsg);
    }

    const startTime = Date.now();

    try {
      const result = await tool.handler(args || {}, ctx);
      const duration = Date.now() - startTime;
      logger.tool(name, duration, true);

      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.tool(name, duration, false);

      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${error.message || String(error)}`,
          },
        ],
        isError: true,
      };
    }
  });

  logger.info(`Registered ${ALL_TOOLS.length} tools: ${ALL_TOOLS.map((t) => t.name).join(", ")}`);
}
