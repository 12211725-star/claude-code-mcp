/**
 * Workspace Memory — persistent knowledge across sessions.
 *
 * Ports Claude Code's memory system:
 * - FACT.md: durable knowledge (survives across sessions, 6+ months)
 * - JOURNAL.jsonl: timestamped one-off events (append-only log)
 * - Search: query journal entries by text or tag
 */
import { readFile, writeFile, mkdir, access } from "fs/promises";
import { resolve } from "path";
import { logger } from "../utils/logger.js";
const DEFAULT_CONFIG = {
    memoryDir: "memory",
    autoCreate: true,
};
export class WorkspaceMemory {
    config;
    workspaceRoot;
    constructor(workspaceRoot, config = {}) {
        this.workspaceRoot = workspaceRoot;
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    get memoryPath() {
        return resolve(this.workspaceRoot, this.config.memoryDir);
    }
    get factPath() {
        return resolve(this.memoryPath, "FACT.md");
    }
    get journalPath() {
        return resolve(this.memoryPath, "JOURNAL.jsonl");
    }
    /**
     * Ensure memory directory and files exist.
     */
    async initialize() {
        if (this.config.autoCreate) {
            await mkdir(this.memoryPath, { recursive: true });
            // Ensure FACT.md exists
            try {
                await access(this.factPath);
            }
            catch {
                await writeFile(this.factPath, "# Facts\n\n> Durable knowledge that should survive across sessions.\n", "utf-8");
            }
            // Ensure JOURNAL.jsonl exists
            try {
                await access(this.journalPath);
            }
            catch {
                await writeFile(this.journalPath, "", "utf-8");
            }
            logger.info(`Workspace memory initialized at ${this.memoryPath}`);
        }
    }
    /**
     * Update FACT.md — overwrites with new knowledge.
     * Only use for information that will still matter in 6+ months.
     */
    async updateFacts(content) {
        const header = "# Facts\n\n> Durable knowledge. Last updated: " +
            new Date().toISOString() + "\n\n";
        await writeFile(this.factPath, header + content, "utf-8");
        logger.info("FACT.md updated");
    }
    /**
     * Read current FACT.md content.
     */
    async readFacts() {
        try {
            const content = await readFile(this.factPath, "utf-8");
            return content;
        }
        catch {
            return "";
        }
    }
    /**
     * Append an entry to JOURNAL.jsonl.
     */
    async appendJournal(text, tags) {
        const entry = {
            timestamp: new Date().toISOString(),
            text,
            tags,
        };
        const line = JSON.stringify(entry) + "\n";
        await writeFile(this.journalPath, line, { flag: "a" });
        logger.info(`Journal entry added${tags ? ` [${tags.join(", ")}]` : ""}`);
        return entry;
    }
    /**
     * Search journal entries by query text and/or tag.
     */
    async searchJournal(query, options) {
        const limit = options?.limit || 20;
        const searchQuery = options?.caseSensitive ? query : query.toLowerCase();
        const filterTag = options?.tag;
        try {
            const content = await readFile(this.journalPath, "utf-8");
            const lines = content.split("\n").filter(Boolean);
            const results = [];
            for (let i = 0; i < lines.length; i++) {
                try {
                    const entry = JSON.parse(lines[i]);
                    // Tag filter
                    if (filterTag && (!entry.tags || !entry.tags.includes(filterTag))) {
                        continue;
                    }
                    // Text search
                    const searchText = options?.caseSensitive
                        ? entry.text
                        : entry.text.toLowerCase();
                    if (!query || searchText.includes(searchQuery)) {
                        // Simple score: how early the match appears
                        const idx = searchText.indexOf(searchQuery);
                        const score = query ? (1 - idx / Math.max(searchText.length, 1)) : 0.5;
                        results.push({
                            entry,
                            lineNumber: i + 1,
                            score: Math.max(0, score),
                        });
                    }
                }
                catch {
                    // Skip malformed JSON lines
                }
            }
            // Sort by score descending, then by timestamp descending
            results.sort((a, b) => {
                if (Math.abs(b.score - a.score) > 0.01)
                    return b.score - a.score;
                return b.entry.timestamp.localeCompare(a.entry.timestamp);
            });
            return results.slice(0, limit);
        }
        catch {
            return [];
        }
    }
    /**
     * Get the most recent journal entries.
     */
    async getRecentEntries(limit = 10) {
        const results = await this.searchJournal("", { limit });
        return results.map((r) => r.entry);
    }
    /**
     * Get all unique tags used in journal entries.
     */
    async getAllTags() {
        try {
            const content = await readFile(this.journalPath, "utf-8");
            const tags = new Set();
            for (const line of content.split("\n").filter(Boolean)) {
                try {
                    const entry = JSON.parse(line);
                    if (entry.tags) {
                        for (const tag of entry.tags)
                            tags.add(tag);
                    }
                }
                catch { /* skip */ }
            }
            return [...tags].sort();
        }
        catch {
            return [];
        }
    }
}
//# sourceMappingURL=workspaceMemory.js.map