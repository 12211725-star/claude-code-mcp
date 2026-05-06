import type { AppContext } from "../types.js";
export declare const globSearchTool: {
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
        };
        required: string[];
    };
    handler(args: any, ctx: AppContext): Promise<{
        pattern: any;
        matchCount: number;
        shownCount: number;
        files: string[];
    }>;
};
//# sourceMappingURL=globSearch.d.ts.map