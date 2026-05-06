/**
 * workspaceMemory Tool — read/write/search persistent workspace memory.
 * Ports Claude Code's FACT.md + JOURNAL.jsonl memory system.
 */
import { WorkspaceMemory } from "../memory/workspaceMemory.js";
export const workspaceMemoryTool = {
    name: "workspace_memory",
    description: `管理工作区持久记忆 — 对标 Claude Code 的 memory 系统。

操作:
- update_facts: 覆写 FACT.md（仅用于 6个月后仍有价值的知识）
- read_facts: 读取当前 FACT.md 内容
- append_journal: 追加时间戳事件到 JOURNAL.jsonl
- search_journal: 搜索日志（支持全文 + 标签过滤）
- get_tags: 获取所有日志标签
- recent: 获取最近日志条目

FACT.md vs JOURNAL.jsonl:
- FACT.md: 持久知识（项目约定、技术决策、API URL 等）
- JOURNAL.jsonl: 一次性事件（任务完成、会话记录、临时发现等）`,
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: "string",
                enum: ["update_facts", "read_facts", "append_journal", "search_journal", "get_tags", "recent"],
                description: "操作类型",
            },
            content: {
                type: "string",
                description: "(update_facts) 完整的 FACT.md 内容",
            },
            text: {
                type: "string",
                description: "(append_journal) 日志条目文本",
            },
            tags: {
                type: "array",
                items: { type: "string" },
                description: "(append_journal) 标签列表",
            },
            query: {
                type: "string",
                description: "(search_journal) 搜索查询（大小写不敏感）",
            },
            tag: {
                type: "string",
                description: "(search_journal) 按标签过滤",
            },
            limit: {
                type: "number",
                description: "(search_journal/recent) 最大返回数，默认 20",
            },
        },
        required: ["action"],
    },
    async handler(args, ctx) {
        const a = args;
        const memory = new WorkspaceMemory(ctx.config.workspaceRoot);
        await memory.initialize();
        switch (a.action) {
            case "update_facts": {
                if (!a.content) {
                    throw new Error("update_facts 操作需要 content 参数");
                }
                await memory.updateFacts(a.content);
                return {
                    action: "update_facts",
                    status: "ok",
                    message: "FACT.md 已更新",
                };
            }
            case "read_facts": {
                const content = await memory.readFacts();
                return {
                    action: "read_facts",
                    content,
                };
            }
            case "append_journal": {
                if (!a.text) {
                    throw new Error("append_journal 操作需要 text 参数");
                }
                const entry = await memory.appendJournal(a.text, a.tags);
                return {
                    action: "append_journal",
                    entry,
                };
            }
            case "search_journal": {
                const results = await memory.searchJournal(a.query || "", {
                    tag: a.tag,
                    limit: a.limit || 20,
                });
                return {
                    action: "search_journal",
                    query: a.query,
                    tag: a.tag,
                    resultCount: results.length,
                    results: results.map((r) => ({
                        line: r.lineNumber,
                        timestamp: r.entry.timestamp,
                        text: r.entry.text.substring(0, 300),
                        tags: r.entry.tags,
                        score: Math.round(r.score * 100) / 100,
                    })),
                };
            }
            case "get_tags": {
                const tags = await memory.getAllTags();
                return {
                    action: "get_tags",
                    tags,
                    count: tags.length,
                };
            }
            case "recent": {
                const entries = await memory.getRecentEntries(a.limit || 10);
                return {
                    action: "recent",
                    count: entries.length,
                    entries,
                };
            }
            default:
                throw new Error(`Unknown action: ${a.action}`);
        }
    },
};
//# sourceMappingURL=workspaceMemory.js.map