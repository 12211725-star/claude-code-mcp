#!/usr/bin/env node
/**
 * Claude Code Agent MCP Server — Entry Point
 *
 * Ports Claude Code's agent architecture as an MCP Server for use with
 * domestic LLMs (DeepSeek, Doubao, Qwen) integrated with Trae IDE.
 *
 * Usage:
 *   node dist/index.js                          # Start with default config
 *   MODEL_PROVIDER=deepseek node dist/index.js # Specify model via env
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";
import { logger } from "./utils/logger.js";
async function main() {
    try {
        const { server } = await createServer({
            workspaceRoot: process.env.WORKSPACE_ROOT,
            logLevel: process.env.LOG_LEVEL || "info",
        });
        // Use stdio transport for MCP protocol
        const transport = new StdioServerTransport();
        await server.connect(transport);
        logger.info("Server started successfully");
        logger.info("Waiting for MCP requests...");
    }
    catch (error) {
        logger.fatal("Failed to start server", error);
        process.exit(1);
    }
}
// Handle unhandled rejections
process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled rejection", reason instanceof Error ? reason : String(reason));
});
process.on("uncaughtException", (error) => {
    logger.fatal("Uncaught exception", error);
    process.exit(1);
});
// Handle graceful shutdown
process.on("SIGTERM", () => {
    logger.info("Received SIGTERM, shutting down...");
    process.exit(0);
});
process.on("SIGINT", () => {
    logger.info("Received SIGINT, shutting down...");
    process.exit(0);
});
main();
//# sourceMappingURL=index.js.map