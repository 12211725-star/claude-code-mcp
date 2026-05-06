/**
 * Git Helper — lightweight git utilities for the MCP Server.
 *
 * Provides safe, read-only-by-default git operations.
 * Destructive operations require explicit confirmation.
 */
/**
 * Detect if the workspace is a git repository.
 */
export async function isGitRepo(cwd) {
    try {
        const { execa } = await import("execa");
        await execa("git", ["rev-parse", "--git-dir"], { cwd });
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Get current git status.
 */
export async function getGitStatus(cwd) {
    const { execa } = await import("execa");
    const status = {
        branch: "unknown",
        clean: true,
        files: { staged: [], modified: [], untracked: [] },
        ahead: 0,
        behind: 0,
    };
    try {
        // Get current branch
        const branchResult = await execa("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd });
        status.branch = branchResult.stdout.trim();
        // Get status in porcelain format
        const statusResult = await execa("git", ["status", "--porcelain"], { cwd });
        const lines = statusResult.stdout.trim().split("\n").filter(Boolean);
        status.clean = lines.length === 0;
        for (const line of lines) {
            const statusCode = line.substring(0, 2);
            const filePath = line.substring(3).trim();
            if (statusCode.includes("?")) {
                status.files.untracked.push(filePath);
            }
            else if (statusCode[0] !== " ") {
                status.files.staged.push(filePath);
            }
            if (statusCode[1] !== " ") {
                status.files.modified.push(filePath);
            }
        }
        // Check ahead/behind
        try {
            const aheadResult = await execa("git", ["rev-list", "--count", "--left-right", "@{u}..."], { cwd });
            const [ahead, behind] = aheadResult.stdout
                .trim()
                .split("\t")
                .map(Number);
            status.ahead = ahead || 0;
            status.behind = behind || 0;
        }
        catch {
            // No upstream configured — ignore
        }
    }
    catch {
        // Not a git repo or git not available
    }
    return status;
}
/**
 * Get recent commit log.
 */
export async function getRecentCommits(cwd, count = 5) {
    try {
        const { execa } = await import("execa");
        const result = await execa("git", [
            "log",
            `-${count}`,
            "--format=%H||%s||%an||%aI",
        ], { cwd });
        return result.stdout
            .trim()
            .split("\n")
            .filter(Boolean)
            .map((line) => {
            const [hash, message, author, date] = line.split("||");
            return { hash, message, author, date };
        });
    }
    catch {
        return [];
    }
}
/**
 * Get the diff of staged changes.
 */
export async function getStagedDiff(cwd) {
    try {
        const { execa } = await import("execa");
        const result = await execa("git", ["diff", "--cached"], { cwd });
        return result.stdout;
    }
    catch {
        return "";
    }
}
/**
 * Get the diff of unstaged changes.
 */
export async function getUnstagedDiff(cwd) {
    try {
        const { execa } = await import("execa");
        const result = await execa("git", ["diff"], { cwd });
        return result.stdout;
    }
    catch {
        return "";
    }
}
/**
 * Get the default branch name (main or master).
 */
export async function getDefaultBranch(cwd) {
    try {
        const { execa } = await import("execa");
        // Try to get the remote HEAD
        const result = await execa("git", ["symbolic-ref", "refs/remotes/origin/HEAD"], { cwd });
        const ref = result.stdout.trim();
        return ref.replace("refs/remotes/origin/", "");
    }
    catch {
        // Fallback: try main, then master
        try {
            const { execa } = await import("execa");
            await execa("git", ["rev-parse", "--verify", "main"], { cwd });
            return "main";
        }
        catch {
            return "master";
        }
    }
}
/**
 * Format git status as a human-readable summary.
 */
export function formatGitStatus(status) {
    const lines = [
        `Branch: **${status.branch}**`,
        `Clean: ${status.clean ? "yes" : "no"}`,
    ];
    if (status.ahead > 0)
        lines.push(`Ahead: ${status.ahead} commits`);
    if (status.behind > 0)
        lines.push(`Behind: ${status.behind} commits`);
    if (status.files.staged.length > 0) {
        lines.push(`\nStaged (${status.files.staged.length}):`);
        status.files.staged.slice(0, 10).forEach((f) => lines.push(`  + ${f}`));
        if (status.files.staged.length > 10) {
            lines.push(`  ... and ${status.files.staged.length - 10} more`);
        }
    }
    if (status.files.modified.length > 0) {
        lines.push(`\nModified (${status.files.modified.length}):`);
        status.files.modified.slice(0, 10).forEach((f) => lines.push(`  ~ ${f}`));
        if (status.files.modified.length > 10) {
            lines.push(`  ... and ${status.files.modified.length - 10} more`);
        }
    }
    if (status.files.untracked.length > 0) {
        lines.push(`\nUntracked (${status.files.untracked.length}):`);
        status.files.untracked.slice(0, 10).forEach((f) => lines.push(`  ? ${f}`));
        if (status.files.untracked.length > 10) {
            lines.push(`  ... and ${status.files.untracked.length - 10} more`);
        }
    }
    return lines.join("\n");
}
//# sourceMappingURL=gitHelper.js.map