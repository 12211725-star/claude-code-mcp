/**
 * workspaceMemory Tool — read/write/search persistent workspace memory.
 * Ports Claude Code's FACT.md + JOURNAL.jsonl memory system.
 */
import type { AppContext } from "../types.js";
export declare const workspaceMemoryTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            action: {
                type: string;
                enum: string[];
                description: string;
            };
            content: {
                type: string;
                description: string;
            };
            text: {
                type: string;
                description: string;
            };
            tags: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            query: {
                type: string;
                description: string;
            };
            tag: {
                type: string;
                description: string;
            };
            limit: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(args: unknown, ctx: AppContext): Promise<{
        action: string;
        status: string;
        message: string;
        content?: undefined;
        entry?: undefined;
        query?: undefined;
        tag?: undefined;
        resultCount?: undefined;
        results?: undefined;
        tags?: undefined;
        count?: undefined;
        entries?: undefined;
    } | {
        action: string;
        content: string;
        status?: undefined;
        message?: undefined;
        entry?: undefined;
        query?: undefined;
        tag?: undefined;
        resultCount?: undefined;
        results?: undefined;
        tags?: undefined;
        count?: undefined;
        entries?: undefined;
    } | {
        action: string;
        entry: import("../memory/workspaceMemory.js").JournalEntry;
        status?: undefined;
        message?: undefined;
        content?: undefined;
        query?: undefined;
        tag?: undefined;
        resultCount?: undefined;
        results?: undefined;
        tags?: undefined;
        count?: undefined;
        entries?: undefined;
    } | {
        action: string;
        query: string | undefined;
        tag: string | undefined;
        resultCount: number;
        results: {
            line: number;
            timestamp: string;
            text: string;
            tags: string[] | undefined;
            score: number;
        }[];
        status?: undefined;
        message?: undefined;
        content?: undefined;
        entry?: undefined;
        tags?: undefined;
        count?: undefined;
        entries?: undefined;
    } | {
        action: string;
        tags: string[];
        count: number;
        status?: undefined;
        message?: undefined;
        content?: undefined;
        entry?: undefined;
        query?: undefined;
        tag?: undefined;
        resultCount?: undefined;
        results?: undefined;
        entries?: undefined;
    } | {
        action: string;
        count: number;
        entries: import("../memory/workspaceMemory.js").JournalEntry[];
        status?: undefined;
        message?: undefined;
        content?: undefined;
        entry?: undefined;
        query?: undefined;
        tag?: undefined;
        resultCount?: undefined;
        results?: undefined;
        tags?: undefined;
    }>;
};
//# sourceMappingURL=workspaceMemory.d.ts.map