/**
 * Structured logger — minimal dependency logger for MCP Server.
 *
 * Outputs to stderr (stdout is reserved for MCP JSON-RPC transport).
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    FATAL = 4
}
export interface LoggerConfig {
    level: LogLevel;
    timestamp: boolean;
    source: string;
}
export declare function configureLogger(config: Partial<LoggerConfig>): void;
export declare const logger: {
    debug(message: string, data?: unknown): void;
    info(message: string, data?: unknown): void;
    warn(message: string, data?: unknown): void;
    error(message: string, data?: unknown): void;
    fatal(message: string, data?: unknown): void;
    /** Log tool execution. */
    tool(toolName: string, duration: number, success: boolean): void;
    /** Log model call metrics. */
    model(modelName: string, tokens: {
        prompt: number;
        completion: number;
    }, duration: number): void;
};
//# sourceMappingURL=logger.d.ts.map