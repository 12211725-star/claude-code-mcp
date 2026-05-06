import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { MAIN_SYSTEM_PROMPT } from "./system.js";
import { SUB_AGENT_SYSTEM_PROMPT } from "./subAgent.js";
import { PROMPT_TEMPLATES, TOOL_USAGE_INSTRUCTIONS } from "./templates.js";
import { logger } from "../utils/logger.js";

interface PromptDefinition {
  name: string;
  description: string;
  arguments?: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
}

const PROMPTS: PromptDefinition[] = [
  {
    name: "system",
    description: "Claude Code Agent 主系统提示词",
    arguments: [],
  },
  {
    name: "sub_agent",
    description: "子Agent提示词。参数 type: search | explore | plan | generate",
    arguments: [
      {
        name: "type",
        description: "子Agent类型: search, explore, plan, generate, default",
        required: false,
      },
    ],
  },
  {
    name: "code_review",
    description: "代码审查提示词模板",
    arguments: [
      { name: "language", description: "编程语言", required: true },
      { name: "code", description: "要审查的代码", required: true },
    ],
  },
  {
    name: "bug_fix",
    description: "Bug修复提示词模板",
    arguments: [
      { name: "description", description: "Bug描述", required: true },
      { name: "code", description: "相关代码", required: true },
    ],
  },
  {
    name: "refactor",
    description: "代码重构提示词模板",
    arguments: [
      { name: "description", description: "重构需求", required: true },
      { name: "code", description: "原始代码", required: true },
    ],
  },
  {
    name: "generate_tests",
    description: "测试生成提示词模板",
    arguments: [
      { name: "code", description: "待测试的代码", required: true },
      { name: "framework", description: "测试框架 (默认 vitest)", required: false },
    ],
  },
  {
    name: "tool_usage",
    description: "工具使用优先级指南",
    arguments: [],
  },
];

/**
 * Register all prompts with the MCP Server.
 */
export function registerAllPrompts(server: Server): void {
  // Handler: list all available prompts
  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: PROMPTS.map((p) => ({
      name: p.name,
      description: p.description,
      arguments: p.arguments,
    })),
  }));

  // Handler: get a specific prompt
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "system": {
        return {
          messages: [
            { role: "user", content: { type: "text", text: MAIN_SYSTEM_PROMPT } },
          ],
        };
      }

      case "sub_agent": {
        const type = (args?.type as string) || "default";
        const content = SUB_AGENT_SYSTEM_PROMPT[type] || SUB_AGENT_SYSTEM_PROMPT.default;
        return {
          messages: [
            { role: "user", content: { type: "text", text: content } },
          ],
        };
      }

      case "code_review": {
        if (!args?.language || !args?.code) {
          throw new Error("Missing required arguments: language, code");
        }
        const content = PROMPT_TEMPLATES.codeReview(
          args.language as string,
          args.code as string
        );
        return {
          messages: [
            { role: "user", content: { type: "text", text: content } },
          ],
        };
      }

      case "bug_fix": {
        if (!args?.description || !args?.code) {
          throw new Error("Missing required arguments: description, code");
        }
        const content = PROMPT_TEMPLATES.bugFix(
          args.description as string,
          args.code as string
        );
        return {
          messages: [
            { role: "user", content: { type: "text", text: content } },
          ],
        };
      }

      case "refactor": {
        if (!args?.description || !args?.code) {
          throw new Error("Missing required arguments: description, code");
        }
        const content = PROMPT_TEMPLATES.refactor(
          args.description as string,
          args.code as string
        );
        return {
          messages: [
            { role: "user", content: { type: "text", text: content } },
          ],
        };
      }

      case "generate_tests": {
        if (!args?.code) {
          throw new Error("Missing required argument: code");
        }
        const content = PROMPT_TEMPLATES.generateTests(
          args.code as string,
          (args?.framework as string) || "vitest"
        );
        return {
          messages: [
            { role: "user", content: { type: "text", text: content } },
          ],
        };
      }

      case "tool_usage": {
        return {
          messages: [
            { role: "user", content: { type: "text", text: TOOL_USAGE_INSTRUCTIONS } },
          ],
        };
      }

      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  });

  logger.info(`Registered ${PROMPTS.length} prompts: ${PROMPTS.map((p) => p.name).join(", ")}`);
}
