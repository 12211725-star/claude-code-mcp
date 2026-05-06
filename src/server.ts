import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ContextManager } from "./context/manager.js";
import { ModelFactory } from "./models/factory.js";
import { registerAllTools } from "./tools/index.js";
import { registerAllPrompts } from "./prompts/index.js";
import { loadConfig } from "./utils/config.js";
import { logger, configureLogger } from "./utils/logger.js";
import type { AppContext } from "./types.js";

export interface ServerOptions {
  /** Override workspace root. Defaults to process.cwd(). */
  workspaceRoot?: string;
  /** Log level. Defaults to "info". */
  logLevel?: "debug" | "info" | "warn" | "error";
}

/**
 * Create and configure the Claude Code Agent MCP Server.
 */
export async function createServer(options: ServerOptions = {}): Promise<{
  server: Server;
  ctx: AppContext;
}> {
  // Load configuration
  const config = loadConfig();

  if (options.workspaceRoot) {
    config.workspaceRoot = options.workspaceRoot;
  }

  // Configure logger
  const logLevelMap = { debug: 0, info: 1, warn: 2, error: 3 } as const;
  configureLogger({
    level: logLevelMap[options.logLevel || "info"],
    source: "claude-code-agent",
  });

  logger.info(`Initializing Claude Code Agent MCP Server`);
  logger.info(`Workspace: ${config.workspaceRoot}`);
  logger.info(`Model: ${config.model.provider}/${config.model.name}`);

  // Initialize model
  const model = ModelFactory.create(config.model);
  logger.info("Model adapter initialized");

  // Initialize context manager
  const contextManager = new ContextManager(config.context);
  logger.info("Context manager initialized");

  // Create MCP Server
  const server = new Server(
    {
      name: "claude-code-agent",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
        prompts: {},
      },
    }
  );

  // Build app context
  const ctx: AppContext = {
    config,
    model,
    modelFactory: ModelFactory,
    contextManager,
  };

  // Register tools and prompts
  registerAllTools(server, ctx);
  registerAllPrompts(server);

  // Server lifecycle logging
  server.onerror = (error) => {
    logger.error("MCP Server error", error);
  };

  return { server, ctx };
}
