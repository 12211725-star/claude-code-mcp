/**
 * Tool Router — maps user intent to appropriate tool selection.
 *
 * Ports Claude Code's internal tool dispatch logic.
 * Provides intelligent tool suggestions based on natural language task descriptions.
 */
export interface ToolSuggestion {
    tool: string;
    confidence: number;
    reason: string;
    parameters?: Record<string, string>;
}
/**
 * Tool Router: determines which tool(s) to use for a given user request.
 */
export declare class ToolRouter {
    /**
     * Get ranked tool suggestions for a task description.
     */
    static route(description: string): ToolSuggestion[];
    /**
     * Get the best single tool for a task.
     */
    static bestTool(description: string): ToolSuggestion;
    /**
     * Get all available tool names with descriptions.
     */
    static availableTools(): Array<{
        name: string;
        description: string;
    }>;
    /**
     * Check if a tool is appropriate for the given file type.
     */
    static isToolForFileType(tool: string, filePath: string): boolean;
}
//# sourceMappingURL=toolRouter.d.ts.map