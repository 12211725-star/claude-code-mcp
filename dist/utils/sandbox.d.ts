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
/**
 * Validate a command before execution.
 */
export declare function validateCommand(command: string, config: SandboxConfig): ValidationResult;
/**
 * Sanitize output to prevent injection.
 */
export declare function sanitizeOutput(output: string, maxBytes: number): string;
/**
 * Format the command for display/logging (masking secrets).
 */
export declare function maskSecrets(command: string): string;
//# sourceMappingURL=sandbox.d.ts.map