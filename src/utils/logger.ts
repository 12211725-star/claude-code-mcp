/**
 * Structured logger — minimal dependency logger for MCP Server.
 *
 * Outputs to stderr (stdout is reserved for MCP JSON-RPC transport).
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

const LOG_LABELS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "DEBUG",
  [LogLevel.INFO]: "INFO ",
  [LogLevel.WARN]: "WARN ",
  [LogLevel.ERROR]: "ERROR",
  [LogLevel.FATAL]: "FATAL",
};

export interface LoggerConfig {
  level: LogLevel;
  timestamp: boolean;
  source: string;
}

let globalConfig: LoggerConfig = {
  level: LogLevel.INFO,
  timestamp: true,
  source: "claude-code-agent",
};

export function configureLogger(config: Partial<LoggerConfig>): void {
  globalConfig = { ...globalConfig, ...config };
}

function formatMessage(level: LogLevel, message: string, data?: unknown): string {
  const parts: string[] = [];

  if (globalConfig.timestamp) {
    parts.push(new Date().toISOString());
  }

  parts.push(`[${globalConfig.source}]`);
  parts.push(`[${LOG_LABELS[level]}]`);
  parts.push(message);

  if (data !== undefined) {
    if (data instanceof Error) {
      parts.push(`\n  ${data.stack || data.message}`);
    } else if (typeof data === "object") {
      try {
        parts.push(JSON.stringify(data, null, 2));
      } catch {
        parts.push(String(data));
      }
    } else {
      parts.push(String(data));
    }
  }

  return parts.join(" ");
}

export const logger = {
  debug(message: string, data?: unknown): void {
    if (globalConfig.level <= LogLevel.DEBUG) {
      console.error(formatMessage(LogLevel.DEBUG, message, data));
    }
  },

  info(message: string, data?: unknown): void {
    if (globalConfig.level <= LogLevel.INFO) {
      console.error(formatMessage(LogLevel.INFO, message, data));
    }
  },

  warn(message: string, data?: unknown): void {
    if (globalConfig.level <= LogLevel.WARN) {
      console.error(formatMessage(LogLevel.WARN, message, data));
    }
  },

  error(message: string, data?: unknown): void {
    if (globalConfig.level <= LogLevel.ERROR) {
      console.error(formatMessage(LogLevel.ERROR, message, data));
    }
  },

  fatal(message: string, data?: unknown): void {
    console.error(formatMessage(LogLevel.FATAL, message, data));
  },

  /** Log tool execution. */
  tool(toolName: string, duration: number, success: boolean): void {
    const status = success ? "OK" : "FAIL";
    logger.info(`tool:${toolName} ${status} (${duration}ms)`);
  },

  /** Log model call metrics. */
  model(modelName: string, tokens: { prompt: number; completion: number }, duration: number): void {
    logger.info(
      `model:${modelName} prompt=${tokens.prompt} completion=${tokens.completion} total=${tokens.prompt + tokens.completion} (${duration}ms)`
    );
  },
};
