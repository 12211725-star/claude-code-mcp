import type { ContextManager } from "./context/manager.js";
import type { ModelAdapter } from "./models/adapter.js";
import type { ModelConfig } from "./models/factory.js";
export interface AppConfig {
    workspaceRoot: string;
    model: ModelConfig;
    context: {
        maxTokens: number;
        reservedTokensForResponse: number;
        summarizationThreshold: number;
        enableSummarization: boolean;
        keepLastNMessages: number;
        subAgentMaxTokens: number;
    };
    sandbox: {
        allowedCommands: string[];
        blockedCommands: string[];
        timeoutMs: number;
        maxOutputBytes: number;
    };
    tools: {
        smartEdit: {
            enabled: boolean;
            maxFileSize: number;
        };
        globSearch: {
            enabled: boolean;
            maxResults: number;
        };
        grepSearch: {
            enabled: boolean;
            maxResults: number;
        };
        bashExec: {
            enabled: boolean;
        };
        taskAgent: {
            enabled: boolean;
            maxConcurrent: number;
        };
    };
}
export interface AppContext {
    config: AppConfig;
    model: ModelAdapter;
    modelFactory: typeof import("./models/factory.js").ModelFactory;
    contextManager: ContextManager;
}
//# sourceMappingURL=types.d.ts.map