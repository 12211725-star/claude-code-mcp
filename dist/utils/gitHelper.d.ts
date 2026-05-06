/**
 * Git Helper — lightweight git utilities for the MCP Server.
 *
 * Provides safe, read-only-by-default git operations.
 * Destructive operations require explicit confirmation.
 */
export interface GitStatus {
    branch: string;
    clean: boolean;
    files: {
        staged: string[];
        modified: string[];
        untracked: string[];
    };
    ahead: number;
    behind: number;
}
export interface GitCommit {
    hash: string;
    message: string;
    author: string;
    date: string;
}
/**
 * Detect if the workspace is a git repository.
 */
export declare function isGitRepo(cwd: string): Promise<boolean>;
/**
 * Get current git status.
 */
export declare function getGitStatus(cwd: string): Promise<GitStatus>;
/**
 * Get recent commit log.
 */
export declare function getRecentCommits(cwd: string, count?: number): Promise<GitCommit[]>;
/**
 * Get the diff of staged changes.
 */
export declare function getStagedDiff(cwd: string): Promise<string>;
/**
 * Get the diff of unstaged changes.
 */
export declare function getUnstagedDiff(cwd: string): Promise<string>;
/**
 * Get the default branch name (main or master).
 */
export declare function getDefaultBranch(cwd: string): Promise<string>;
/**
 * Format git status as a human-readable summary.
 */
export declare function formatGitStatus(status: GitStatus): string;
//# sourceMappingURL=gitHelper.d.ts.map