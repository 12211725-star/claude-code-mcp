/**
 * Workspace Memory — persistent knowledge across sessions.
 *
 * Ports Claude Code's memory system:
 * - FACT.md: durable knowledge (survives across sessions, 6+ months)
 * - JOURNAL.jsonl: timestamped one-off events (append-only log)
 * - Search: query journal entries by text or tag
 */
export interface MemoryConfig {
    /** Root directory where memory files are stored */
    memoryDir: string;
    /** Whether to auto-create the memory directory */
    autoCreate: boolean;
}
export interface JournalEntry {
    timestamp: string;
    text: string;
    tags?: string[];
}
export interface SearchResult {
    entry: JournalEntry;
    lineNumber: number;
    score: number;
}
export declare class WorkspaceMemory {
    private config;
    private workspaceRoot;
    constructor(workspaceRoot: string, config?: Partial<MemoryConfig>);
    private get memoryPath();
    private get factPath();
    private get journalPath();
    /**
     * Ensure memory directory and files exist.
     */
    initialize(): Promise<void>;
    /**
     * Update FACT.md — overwrites with new knowledge.
     * Only use for information that will still matter in 6+ months.
     */
    updateFacts(content: string): Promise<void>;
    /**
     * Read current FACT.md content.
     */
    readFacts(): Promise<string>;
    /**
     * Append an entry to JOURNAL.jsonl.
     */
    appendJournal(text: string, tags?: string[]): Promise<JournalEntry>;
    /**
     * Search journal entries by query text and/or tag.
     */
    searchJournal(query: string, options?: {
        tag?: string;
        limit?: number;
        caseSensitive?: boolean;
    }): Promise<SearchResult[]>;
    /**
     * Get the most recent journal entries.
     */
    getRecentEntries(limit?: number): Promise<JournalEntry[]>;
    /**
     * Get all unique tags used in journal entries.
     */
    getAllTags(): Promise<string[]>;
}
//# sourceMappingURL=workspaceMemory.d.ts.map