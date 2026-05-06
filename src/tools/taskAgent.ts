import { ContextManager } from "../context/manager.js";
import { SUB_AGENT_SYSTEM_PROMPT } from "../prompts/subAgent.js";
import { readFile } from "fs/promises";
import * as path from "path";
import type { AppContext } from "../types.js";

export const taskAgentTool = {
  name: "task_agent",
  description: `启动子Agent处理独立子任务——对标 Claude Code 的 Task 工具。

何时使用：
- 需要独立搜索和分析的复杂子任务
- 不需要主对话上下文的大段代码生成
- 可以并行执行的多个独立任务

子Agent特点：
- 拥有独立的上下文窗口
- 可以访问文件和搜索工具
- 完成后返回结果给主Agent
- 不会污染主Agent的上下文

子Agent类型：
- search: 搜索和查找
- explore: 代码探索和结构分析
- plan: 任务规划和分解
- generate: 代码生成`,

  inputSchema: {
    type: "object" as const,
    properties: {
      description: {
        type: "string",
        description: "简短描述子任务（3-10个词）",
      },
      prompt: {
        type: "string",
        description: "给子Agent的完整任务描述",
      },
      subagent_type: {
        type: "string",
        enum: ["search", "explore", "plan", "generate"],
        description: "子Agent类型",
      },
      context_files: {
        type: "array",
        items: { type: "string" },
        description: "子Agent需要读取的文件列表",
      },
    },
    required: ["description", "prompt", "subagent_type"],
  },

  async handler(args: any, ctx: AppContext) {
    const { description, prompt, subagent_type, context_files = [] } = args;

    // Create isolated context for sub-agent
    const subContext = new ContextManager({
      maxTokens: ctx.config.context.subAgentMaxTokens,
      enableSummarization: true,
    });

    // Build sub-agent messages
    const messages: Array<{ role: string; content: string }> = [
      {
        role: "system",
        content:
          SUB_AGENT_SYSTEM_PROMPT[subagent_type] ||
          SUB_AGENT_SYSTEM_PROMPT.default,
      },
      {
        role: "user",
        content: `任务: ${description}\n\n${prompt}`,
      },
    ];

    // If files specified, preload content
    if (context_files.length > 0) {
      try {
        const fileContents = await loadFiles(context_files, ctx);
        messages[1].content += "\n\n## 相关文件\n\n" + fileContents;
      } catch {
        // Ignore file loading errors
      }
    }

    // Use sub-agent model (can be cheaper)
    const subModel = ctx.config.model.subAgentModel
      ? ctx.modelFactory.createSubAgent(ctx.config.model)
      : ctx.model;

    const response = await subModel.chat(messages, {
      temperature: 0.2,
      maxTokens: ctx.config.context.subAgentMaxTokens,
    });

    return {
      subagent: description,
      type: subagent_type,
      result: response.content,
      usage: response.usage,
    };
  },
};

async function loadFiles(
  files: string[],
  ctx: AppContext
): Promise<string> {
  const contents: string[] = [];
  for (const file of files.slice(0, 5)) {
    const fullPath = path.resolve(ctx.config.workspaceRoot, file);
    try {
      const content = await readFile(fullPath, "utf-8");
      contents.push(
        `### ${file}\n\`\`\`\n${content.slice(0, 2000)}\n\`\`\``
      );
    } catch {
      contents.push(`### ${file}\n[文件未找到]`);
    }
  }
  return contents.join("\n\n");
}
