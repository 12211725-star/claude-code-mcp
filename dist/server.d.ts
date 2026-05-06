import { Server } from "@modelcontextprotocol/sdk/server/index.js";
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
export declare function createServer(options?: ServerOptions): Promise<{
    server: Server;
    ctx: AppContext;
}>;
//# sourceMappingURL=server.d.ts.map