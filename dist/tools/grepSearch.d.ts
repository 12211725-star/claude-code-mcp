import type { AppContext } from "../types.js";
export declare const grepSearchTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            pattern: {
                type: string;
                description: string;
            };
            path: {
                type: string;
                description: string;
            };
            glob: {
                type: string;
                description: string;
            };
            include: {
                type: string;
                description: string;
            };
            contextBefore: {
                type: string;
                description: string;
            };
            contextAfter: {
                type: string;
                description: string;
            };
            contextAround: {
                type: string;
                description: string;
            };
            ignoreCase: {
                type: string;
                description: string;
            };
            maxResults: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(args: any, ctx: AppContext): Promise<{
        pattern: any;
        fileCount: number;
        results: {
            file: string;
            matchCount: number;
            matches: {
                line: number;
                content: string;
            }[];
        }[];
    }>;
};
//# sourceMappingURL=grepSearch.d.ts.map