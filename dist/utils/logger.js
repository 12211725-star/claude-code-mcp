/**
 * Structured logger — minimal dependency logger for MCP Server.
 *
 * Outputs to stderr (stdout is reserved for MCP JSON-RPC transport).
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["FATAL"] = 4] = "FATAL";
})(LogLevel || (LogLevel = {}));
const LOG_LABELS = {
    [LogLevel.DEBUG]: "DEBUG",
    [LogLevel.INFO]: "INFO ",
    [LogLevel.WARN]: "WARN ",
    [LogLevel.ERROR]: "ERROR",
    [LogLevel.FATAL]: "FATAL",
};
let globalConfig = {
    level: LogLevel.INFO,
    timestamp: true,
    source: "claude-code-agent",
};
export function configureLogger(config) {
    globalConfig = { ...globalConfig, ...config };
}
function formatMessage(level, message, data) {
    const parts = [];
    if (globalConfig.timestamp) {
        parts.push(new Date().toISOString());
    }
    parts.push(`[${globalConfig.source}]`);
    parts.push(`[${LOG_LABELS[level]}]`);
    parts.push(message);
    if (data !== undefined) {
        if (data instanceof Error) {
            parts.push(`\n  ${data.stack || data.message}`);
        }
        else if (typeof data === "object") {
            try {
                parts.push(JSON.stringify(data, null, 2));
            }
            catch {
                parts.push(String(data));
            }
        }
        else {
            parts.push(String(data));
        }
    }
    return parts.join(" ");
}
export const logger = {
    debug(message, data) {
        if (globalConfig.level <= LogLevel.DEBUG) {
            console.error(formatMessage(LogLevel.DEBUG, message, data));
        }
    },
    info(message, data) {
        if (globalConfig.level <= LogLevel.INFO) {
            console.error(formatMessage(LogLevel.INFO, message, data));
        }
    },
    warn(message, data) {
        if (globalConfig.level <= LogLevel.WARN) {
            console.error(formatMessage(LogLevel.WARN, message, data));
        }
    },
    error(message, data) {
        if (globalConfig.level <= LogLevel.ERROR) {
            console.error(formatMessage(LogLevel.ERROR, message, data));
        }
    },
    fatal(message, data) {
        console.error(formatMessage(LogLevel.FATAL, message, data));
    },
    /** Log tool execution. */
    tool(toolName, duration, success) {
        const status = success ? "OK" : "FAIL";
        logger.info(`tool:${toolName} ${status} (${duration}ms)`);
    },
    /** Log model call metrics. */
    model(modelName, tokens, duration) {
        logger.info(`model:${modelName} prompt=${tokens.prompt} completion=${tokens.completion} total=${tokens.prompt + tokens.completion} (${duration}ms)`);
    },
};
//# sourceMappingURL=logger.js.map