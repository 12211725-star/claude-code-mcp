import type { AppContext } from "../types.js";
import { TaskPlanner, type TaskPlan } from "./planner.js";
import { ToolRouter } from "./toolRouter.js";
import { MAIN_SYSTEM_PROMPT } from "../prompts/system.js";
import { logger } from "../utils/logger.js";
import { TOOL_DEFINITIONS_FOR_MODEL } from "../prompts/templates.js";

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

const DEFAULT_ORCHESTRATOR_CONFIG: OrchestratorConfig = {
  maxRetries: 2,
  maxToolCalls: 20,
  maxIterations: 10,
  planBeforeExecute: true,
};

// Multiple patterns to parse tool calls from model output
// Supports: 1) <tool_call>JSON, 2) ```json code blocks, 3) inline JSON
const TOOL_CALL_PATTERNS = [
  /<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g, // Standard format
  /```json\s*([\s\S]*?)\s*```/g, // Markdown code block
  /\{[\s\S]*?"tool"[\s\S]*?"args"[\s\S]*?\}/g, // Inline JSON
];

// Known tool names for validation
const KNOWN_TOOLS = [
  "glob_search",
  "grep_search", 
  "read_file",
  "write_file",
  "smart_edit",
  "bash_exec",
  "task_agent",
];

interface ParsedToolCall {
  tool: string;
  args: Record<string, unknown>;
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
export class AgentOrchestrator {
  private config: OrchestratorConfig;

  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.config = { ...DEFAULT_ORCHESTRATOR_CONFIG, ...config };
  }

  /**
   * Run a complete task cycle with multi-turn tool loop.
   */
  async execute(
    taskDescription: string,
    ctx: AppContext
  ): Promise<ExecutionResult> {
    let toolCallCount = 0;
    let totalTokens = 0;
    let iterations = 0;

    // Step 1: Plan the task
    let plan: TaskPlan | null = null;
    if (this.config.planBeforeExecute) {
      plan = TaskPlanner.plan(taskDescription, ctx);
    }

    // Step 2: Determine tool suggestions
    const suggestions = ToolRouter.route(taskDescription);

    // Step 3: Build initial system context
    ctx.contextManager.addMessage("system", MAIN_SYSTEM_PROMPT);

    if (plan) {
      ctx.contextManager.addMessage(
        "system",
        `## 任务规划\n\n${TaskPlanner.formatPlan(plan)}\n\n按步骤使用工具执行。完成后输出总结，不要在有结果后继续调用工具。`
      );
    }

    const toolHints = suggestions
      .slice(0, 3)
      .map((s) => `- ${s.tool} (置信度: ${(s.confidence * 100).toFixed(0)}%): ${s.reason}`)
      .join("\n");

    ctx.contextManager.addMessage(
      "system",
      `## 可用工具\n\n${TOOL_DEFINITIONS_FOR_MODEL}\n\n## 建议工具\n\n${toolHints}\n\n格式要求：如需调用工具，请严格使用 <tool_call>JSON</tool_call> 格式，每次可包含多个工具调用。完成后请直接给出文本总结。`
    );

    ctx.contextManager.addMessage("user", taskDescription);

    // Step 4: Multi-turn agent loop
    try {
      while (iterations < this.config.maxIterations && toolCallCount < this.config.maxToolCalls) {
        iterations++;

        logger.info(`Agent iteration ${iterations}/${this.config.maxIterations}`);

        const response = await ctx.model.chat(ctx.contextManager.getContext(), {
          temperature: 0.3,
        });
        totalTokens += response.usage?.totalTokens || 0;

        const assistantMessage = response.content || "";
        ctx.contextManager.addMessage("assistant", assistantMessage);

        // Parse tool calls from the response
        const toolCalls = this.parseToolCalls(assistantMessage);

        if (toolCalls.length === 0) {
          // No tool calls — this is the final answer
          logger.info(`Agent finished after ${iterations} iterations, ${toolCallCount} tool calls`);
          return {
            success: true,
            output: assistantMessage,
            toolCallCount,
            tokensUsed: totalTokens,
            iterations,
          };
        }

        // Execute all parsed tool calls and collect results
        const toolResults: string[] = [];
        for (const tc of toolCalls) {
          if (toolCallCount >= this.config.maxToolCalls) break;

          const result = await this.executeToolCall(tc, ctx);
          toolCallCount++;

          const resultText = result.success
            ? `[tool:${tc.tool}] 成功:\n${JSON.stringify(result.output, null, 2)}`
            : `[tool:${tc.tool}] 失败: ${result.error}`;

          toolResults.push(resultText);
        }

        // Feed tool results back to model
        if (toolResults.length > 0) {
          ctx.contextManager.addMessage(
            "user",
            `## 工具执行结果\n\n${toolResults.join("\n\n---\n\n")}\n\n请继续。如果已完成任务，直接输出总结。`
          );
        }
      }

      // Hit limit — return whatever we have
      const hitLimit = toolCallCount >= this.config.maxToolCalls ? "maxToolCalls" : "maxIterations";
      return {
        success: true,
        output: ctx.contextManager.getContext().slice(-1)[0]?.content || "",
        toolCallCount,
        tokensUsed: totalTokens,
        iterations,
        error: `达到限制(${hitLimit})，返回当前结果`,
      };
    } catch (error: any) {
      return {
        success: false,
        output: null,
        error: error.message || String(error),
        toolCallCount,
        tokensUsed: totalTokens,
        iterations,
      };
    }
  }

  /**
   * Parse tool calls from model output using multiple patterns.
   * Supports: 1) <tool_call>JSON, 2) ```json code blocks, 3) inline JSON
   */
  private parseToolCalls(text: string): ParsedToolCall[] {
    const calls: ParsedToolCall[] = [];
    
    // Pattern 1: Standard <tool_call> JSON format
    const pattern1 = /<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g;
    let match: RegExpExecArray | null;
    while ((match = pattern1.exec(text)) !== null) {
      const parsed = this.tryParseToolCall(match[1].trim());
      if (parsed) calls.push(...parsed);
    }
    
    // Pattern 2: Markdown code blocks with json
    const pattern2 = /```json\s*([\s\S]*?)\s*```/g;
    while ((match = pattern2.exec(text)) !== null) {
      const parsed = this.tryParseToolCall(match[1].trim());
      if (parsed) calls.push(...parsed);
    }
    
    // Pattern 3: Inline JSON with tool/args keys (only if no matches yet)
    if (calls.length === 0) {
      const pattern3 = /\{[^{}]*"tool"[^{}]*"args"[^{}]*\}/g;
      while ((match = pattern3.exec(text)) !== null) {
        const parsed = this.tryParseToolCall(match[0]);
        if (parsed) calls.push(...parsed);
      }
    }
    
    // Deduplicate by tool+args
    const seen = new Set<string>();
    return calls.filter(c => {
      const key = `${c.tool}:${JSON.stringify(c.args)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  
  /**
   * Try to parse a single tool call JSON string.
   */
  private tryParseToolCall(jsonStr: string): ParsedToolCall[] | null {
    try {
      const parsed = JSON.parse(jsonStr);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      const valid: ParsedToolCall[] = [];
      
      for (const item of items) {
        // Validate tool name
        if (item.tool && KNOWN_TOOLS.includes(item.tool) && item.args) {
          valid.push({ tool: item.tool, args: item.args });
        }
        // Also support 'name' field for tool
        else if (item.name && KNOWN_TOOLS.includes(item.name) && item.arguments) {
          valid.push({ tool: item.name, args: item.arguments });
        }
      }
      
      return valid.length > 0 ? valid : null;
    } catch (e) {
      logger.warn(`Failed to parse tool_call JSON: ${jsonStr.substring(0, 100)}`);
      return null;
    }
  }

  /**
   * Execute a single tool call against the tool registry.
   */
  private async executeToolCall(
    call: ParsedToolCall,
    ctx: AppContext
  ): Promise<{ success: boolean; output?: unknown; error?: string }> {
    const startTime = Date.now();

    // Import tools at runtime to avoid circular dependencies
    const { executeTool } = await import("../tools/executor.js");

    try {
      const output = await executeTool(call.tool, call.args, ctx);
      const duration = Date.now() - startTime;
      logger.tool(call.tool, duration, true);

      return { success: true, output };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.tool(call.tool, duration, false);

      return { success: false, error: error.message || String(error) };
    }
  }

  /**
   * Run a sub-agent task with its own isolated multi-turn context.
   */
  async executeSubAgent(
    subAgentType: string,
    description: string,
    prompt: string,
    ctx: AppContext
  ): Promise<ExecutionResult> {
    const subModel = ctx.config.model.subAgentModel
      ? ctx.modelFactory.createSubAgent(ctx.config.model)
      : ctx.model;

    let toolCallCount = 0;
    let totalTokens = 0;
    let iterations = 0;

    const messages: Array<{ role: string; content: string }> = [
      {
        role: "system",
        content: `[Sub-Agent Type: ${subAgentType}]\n\n你是子Agent，专注于完成分配的独立任务。\n
可使用的工具: glob_search, grep_search, read_file\n
使用 <tool_call>JSON</tool_call> 格式调用工具。完成后直接输出文本结果。`,
      },
      {
        role: "user",
        content: `Task: ${description}\n\n${prompt}`,
      },
    ];

    try {
      while (iterations < 5 && toolCallCount < 8) {
        iterations++;

        const response = await subModel.chat(messages, { temperature: 0.2 });
        totalTokens += response.usage?.totalTokens || 0;

        const text = response.content || "";
        messages.push({ role: "assistant", content: text });

        const toolCalls = this.parseToolCalls(text);
        if (toolCalls.length === 0) {
          return {
            success: true,
            output: text,
            toolCallCount,
            tokensUsed: totalTokens,
            iterations,
          };
        }

        for (const tc of toolCalls.slice(0, 3)) {
          const result = await this.executeToolCall(tc, ctx);
          toolCallCount++;
          const resultText = result.success
            ? `[tool:${tc.tool}] ${JSON.stringify(result.output).substring(0, 1000)}`
            : `[tool:${tc.tool}] 失败: ${result.error}`;
          messages.push({ role: "user", content: resultText });
        }
      }

      return {
        success: true,
        output: messages[messages.length - 1]?.content || "",
        toolCallCount,
        tokensUsed: totalTokens,
        iterations,
      };
    } catch (error: any) {
      return {
        success: false,
        output: null,
        error: error.message,
        toolCallCount,
        tokensUsed: totalTokens,
        iterations,
      };
    }
  }

  getConfig(): OrchestratorConfig {
    return { ...this.config };
  }
}
