import type { AppContext } from "../types.js";
export interface ExecutionResult {
    success: boolean;
    output: unknown;
    error?: string;
    toolCallCount: number;
    tokensUsed: number;
    iterations: number;
}
export interface OrchestratorConfig {
    maxRetries: number;
    maxToolCalls: number;
    maxIterations: number;
    planBeforeExecute: boolean;
}
/**
 * Agent Orchestrator — multi-turn agent loop porting Claude Code's architecture.
 *
 * Lifecycle:
 * 1. Plan     — decompose the task into steps
 * 2. Execute  — model → parse tool calls → run tools → feed results → repeat
 * 3. Observe  — collect results
 * 4. Finalize — return final output or error
 */
export declare class AgentOrchestrator {
    private config;
    constructor(config?: Partial<OrchestratorConfig>);
    /**
     * Run a complete task cycle with multi-turn tool loop.
     */
    execute(taskDescription: string, ctx: AppContext): Promise<ExecutionResult>;
    /**
     * Parse tool calls from model output using multiple patterns.
     * Supports: 1) <tool_call>JSON, 2) ```json code blocks, 3) inline JSON
     */
    private parseToolCalls;
    /**
     * Try to parse a single tool call JSON string.
     */
    private tryParseToolCall;
    /**
     * Execute a single tool call against the tool registry.
     */
    private executeToolCall;
    /**
     * Run a sub-agent task with its own isolated multi-turn context.
     */
    executeSubAgent(subAgentType: string, description: string, prompt: string, ctx: AppContext): Promise<ExecutionResult>;
    getConfig(): OrchestratorConfig;
}
//# sourceMappingURL=orchestrator.d.ts.map