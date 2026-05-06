import * as path from "path";

/**
 * Bash Sandbox — command validation and safety checks.
 *
 * Ports Claude Code's sandboxing strategy for bash_exec.
 */

export interface SandboxConfig {
  allowedCommands: string[];
  blockedCommands: string[];
  timeoutMs: number;
  maxOutputBytes: number;
  workspaceRoot: string;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  suggestedFix?: string;
}

const DANGEROUS_PATTERNS: Array<{ pattern: RegExp; description: string }> = [
  { pattern: /rm\s+(?:-r[f]?\s+)?[~/]/i, description: "递归删除根目录" },
  { pattern: /:\s*\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}/, description: "Fork bomb" },
  { pattern: />\s*\/dev\/sda/, description: "写入块设备" },
  { pattern: /mkfs\.\w+/, description: "格式化命令" },
  { pattern: /dd\s+if=.*of=\/dev\//, description: "直接磁盘写入" },
  { pattern: />\s*\/etc\//, description: "写入系统配置目录" },
  { pattern: /chmod\s+777/, description: "777 权限修改" },
  { pattern: /chown\s+-R\s+.*\/usr/, description: "递归修改系统目录所有者" },
];

/**
 * Validate a command before execution.
 */
export function validateCommand(
  command: string,
  config: SandboxConfig
): ValidationResult {
  // Check blocked patterns
  for (const blocked of config.blockedCommands) {
    if (command.includes(blocked)) {
      return {
        valid: false,
        reason: `命令包含被阻止的模式: "${blocked}"`,
      };
    }
  }

  // Check dangerous patterns
  for (const danger of DANGEROUS_PATTERNS) {
    if (danger.pattern.test(command)) {
      return {
        valid: false,
        reason: `检测到危险操作: ${danger.description}`,
      };
    }
  }

  // Extract the base command (first word, handling pipes and redirects)
  const baseCmd = extractBaseCommand(command);

  // Check if this is an allowed command
  if (!isAllowedCommand(baseCmd, config.allowedCommands)) {
    return {
      valid: false,
      reason: `命令 "${baseCmd}" 不在允许列表中`,
      suggestedFix: `允许的命令: ${config.allowedCommands.join(", ")}`,
    };
  }

  // Check for path traversal attempts outside workspace
  if (hasPathTraversal(command, config.workspaceRoot)) {
    return {
      valid: false,
      reason: "检测到尝试访问工作区外的路径",
    };
  }

  return { valid: true };
}

/**
 * Extract the base command name from a command string.
 */
function extractBaseCommand(command: string): string {
  // Strip environment variable assignments
  let cmd = command.replace(/^\s*\w+=\S+\s+/, "").trim();

  // Handle built-in chain operators: &&, ||, ;
  // Get the first command before any of these
  // But we need to be careful: we parse the first actual executable name
  cmd = cmd.split(/\s*(?:&&|\|\||;)\s*/)[0].trim();

  // Remove leading path or special chars
  cmd = cmd.replace(/^[./~]+\/?/, "");

  // Split by spaces, take first word
  const parts = cmd.split(/\s+/);
  let baseCmd = parts[0] || "";

  // Strip common prefixes to get the actual command name
  baseCmd = baseCmd.replace(/^(?:sudo|exec|time|nice|nohup|env)\s+/, "");

  return baseCmd.toLowerCase();
}

/**
 * Check if a command is in the allowed list.
 */
function isAllowedCommand(cmd: string, allowedCommands: string[]): boolean {
  return allowedCommands.some((allowed) => {
    // Exact match
    if (allowed === cmd) return true;
    // Path match (e.g., "git" matches "/usr/bin/git")
    if (allowed === path.basename(cmd)) return true;
    return false;
  });
}

/**
 * Check if a command line contains path traversal outside workspace.
 */
function hasPathTraversal(command: string, workspaceRoot: string): boolean {
  // Look for absolute paths that are not under workspaceRoot
  const absPathMatch = command.match(/((?:\/[a-zA-Z0-9._-]+)+)/g);
  if (absPathMatch) {
    for (const p of absPathMatch) {
      if (p === workspaceRoot || p.startsWith(workspaceRoot)) continue;
      // Common safe absolute paths
      if (["/usr/bin", "/usr/local/bin", "/bin", "/dev/null", "/tmp"].some(
        (safe) => p === safe || p.startsWith(safe)
      )) continue;
      // If this looks like a file path (has extension or is deep enough)
      if (p.split("/").length > 2 || /\.[a-zA-Z]{1,6}$/.test(p)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Sanitize output to prevent injection.
 */
export function sanitizeOutput(output: string, maxBytes: number): string {
  return output
    .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "") // Strip ANSI escape codes
    .slice(0, maxBytes)
    .trim();
}

/**
 * Format the command for display/logging (masking secrets).
 */
export function maskSecrets(command: string): string {
  return command
    .replace(/(?:--api-key|--token|API_KEY=)[^\s]+/gi, "$1***")
    .replace(/(?:Authorization|Bearer)\s+[^\s]+/gi, "$1 ***")
    .replace(/(?:sk-|pk-)[a-zA-Z0-9_-]{10,}/g, "***");
}
