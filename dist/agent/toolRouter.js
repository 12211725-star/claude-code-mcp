/**
 * Tool Router — maps user intent to appropriate tool selection.
 *
 * Ports Claude Code's internal tool dispatch logic.
 * Provides intelligent tool suggestions based on natural language task descriptions.
 */
const ROUTE_RULES = [
    {
        tool: "glob_search",
        patterns: [
            /(?:找|搜索|定位|查找|在哪|有哪些).*(?:文件|模块|组件|目录)/,
            /(?:find|search|locate|list).*(?:file|module|component|directory)/i,
            /\*\*?\/?\*\.\w+/,
            /glob/i,
        ],
        priority: 100,
    },
    {
        tool: "grep_search",
        patterns: [
            /(?:搜索|查找|找|搜).*(?:代码|函数|类|方法|变量|字符串|引用|定义|import)/,
            /(?:search|find|grep|look\s*up).*(?:code|function|class|method|variable|string|usage)/i,
            /正则/,
            /regex/i,
        ],
        priority: 100,
    },
    {
        tool: "read_file",
        patterns: [
            /(?:读取|查看|显示|打开|read|view|show|cat|open).*(?:文件|file)/,
            /(?:看看|看一下|读一下).*(?:文件|代码)/,
            /^\s*(?:read|cat)\s+/i,
        ],
        priority: 90,
    },
    {
        tool: "smart_edit",
        patterns: [
            /(?:修改|更改|替换|编辑|修正|修复).*(?:代码|文件|函数|方法)/,
            /(?:modify|change|edit|fix|update|replace|refactor).*(?:code|file|function|method)/i,
            /(?:改|修|替换)/,
            /smart.?edit/i,
        ],
        priority: 80,
    },
    {
        tool: "write_file",
        patterns: [
            /(?:创建|新建|生成|写入|create|new|generate|write|scaffold).*(?:文件|file)/,
            /(?:写|生成).*(?:整个|完整|新)/,
        ],
        priority: 80,
    },
    {
        tool: "bash_exec",
        patterns: [
            /(?:运行|执行|安装|构建|测试|编译|run|exec|install|build|test|compile)/,
            /(?:npm|pnpm|yarn|node|python|go|cargo|git)\s/,
            /(?:启动|重启|停止).*(?:服务|server|docker)/,
        ],
        priority: 70,
    },
    {
        tool: "task_agent",
        patterns: [
            /(?:复杂|multiple|complex|parallel|同时|多个|整个项目|全面分析)/,
            /(?:子.?agent|sub.?agent|task.?agent)/i,
            /(?:拆分|分拆|并行处理)/,
        ],
        priority: 60,
    },
];
/**
 * Tool Router: determines which tool(s) to use for a given user request.
 */
export class ToolRouter {
    /**
     * Get ranked tool suggestions for a task description.
     */
    static route(description) {
        const suggestions = [];
        for (const rule of ROUTE_RULES) {
            for (const pattern of rule.patterns) {
                if (pattern.test(description)) {
                    suggestions.push({
                        tool: rule.tool,
                        confidence: rule.priority / 100,
                        reason: `匹配模式: ${pattern.source}`,
                    });
                    break; // One match per rule
                }
            }
        }
        // Sort by confidence descending
        suggestions.sort((a, b) => b.confidence - a.confidence);
        // If no suggestions, default to read_file (safest first step)
        if (suggestions.length === 0) {
            suggestions.push({
                tool: "read_file",
                confidence: 0.3,
                reason: "无明确匹配，默认先读取文件确认状态",
            });
        }
        return suggestions;
    }
    /**
     * Get the best single tool for a task.
     */
    static bestTool(description) {
        const suggestions = ToolRouter.route(description);
        return suggestions[0];
    }
    /**
     * Get all available tool names with descriptions.
     */
    static availableTools() {
        return [
            { name: "glob_search", description: "按文件名模式搜索文件" },
            { name: "grep_search", description: "正则搜索文件内容" },
            { name: "read_file", description: "读取文件内容（带行号）" },
            { name: "smart_edit", description: "精确替换文件内容" },
            { name: "write_file", description: "整文件写入/创建" },
            { name: "bash_exec", description: "执行 Shell 命令（沙盒）" },
            { name: "task_agent", description: "启动子 Agent 处理独立任务" },
        ];
    }
    /**
     * Check if a tool is appropriate for the given file type.
     */
    static isToolForFileType(tool, filePath) {
        const ext = filePath.split(".").pop()?.toLowerCase();
        // bash_exec doesn't need file type checking
        if (tool === "bash_exec")
            return true;
        // All text-based tools work on most file types
        const binaryExts = ["png", "jpg", "jpeg", "gif", "pdf", "zip", "tar", "gz"];
        if (binaryExts.includes(ext || "")) {
            return tool === "read_file";
        }
        return true;
    }
}
//# sourceMappingURL=toolRouter.js.map