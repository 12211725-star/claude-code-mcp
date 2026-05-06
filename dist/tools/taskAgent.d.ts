import type { AppContext } from "../types.js";
export declare const taskAgentTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            description: {
                type: string;
                description: string;
            };
            prompt: {
                type: string;
                description: string;
            };
            subagent_type: {
                type: string;
                enum: string[];
                description: string;
            };
            context_files: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
        };
        required: string[];
    };
    handler(args: any, ctx: AppContext): Promise<{
        subagent: any;
        type: any;
        result: string;
        usage: {
            promptTokens: number;
            completionTokens: number;
            totalTokens: number;
        } | undefined;
    }>;
};
//# sourceMappingURL=taskAgent.d.ts.map