import { execa } from "execa";
import * as path from "path";
import type { AppContext } from "../types.js";

export const bashExecTool = {
  name: "bash_exec",
  description: `在沙盒环境中执行 Shell 命令——对标 Claude Code 的 Bash 工具。

安全限制：
- 拦截黑名单命令（rm -rf, sudo, chmod 777 等）
- 30秒超时限制
- 输出大小限制 100KB
- 工作目录锁定在项目根目录

用于：运行测试、安装依赖、构建项目、git 操作等。`,

  inputSchema: {
    type: "object" as const,
    properties: {
      command: {
        type: "string",
        description: "要执行的完整命令",
      },
      description: {
        type: "string",
        description: "命令用途的简短描述（5-10个词）",
      },
      timeoutMs: {
        type: "number",
        description: "可选：超时毫秒数。默认 30000。",
      },
    },
    required: ["command", "description"],
  },

  async handler(args: any, ctx: AppContext) {
    const { command, timeoutMs = ctx.config.sandbox.timeoutMs } = args;

    // Security: check against blocked commands
    for (const blocked of ctx.config.sandbox.blockedCommands) {
      if (command.includes(blocked)) {
        throw new Error(
          `命令包含被阻止的模式: "${blocked}"\n` +
            `此命令不允许执行。如需执行，请联系管理员。`
        );
      }
    }

    try {
      const result = await execa(command, {
        cwd: ctx.config.workspaceRoot,
        shell: true,
        timeout: timeoutMs,
        reject: false,
        maxBuffer: ctx.config.sandbox.maxOutputBytes,
        env: {
          ...process.env,
          CI: "true",
          FORCE_COLOR: "0",
        },
      });

      const output = (result.stdout + "\n" + result.stderr)
        .trim()
        .slice(0, ctx.config.sandbox.maxOutputBytes);

      return {
        exitCode: result.exitCode,
        stdout: result.stdout.slice(0, ctx.config.sandbox.maxOutputBytes),
        stderr: result.stderr.slice(0, ctx.config.sandbox.maxOutputBytes),
        success: result.exitCode === 0,
      };
    } catch (error: any) {
      if (error.name === "ExecaError" && error.timedOut) {
        return {
          exitCode: -1,
          stdout: error.stdout?.slice(0, ctx.config.sandbox.maxOutputBytes) || "",
          stderr: `Command timed out after ${timeoutMs}ms`,
          success: false,
          timedOut: true,
        };
      }
      throw error;
    }
  },
};
