import type { AppContext } from "../types.js";
export declare const writeFileTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            file_path: {
                type: string;
                description: string;
            };
            content: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(args: any, ctx: AppContext): Promise<{
        success: boolean;
        file: any;
        action: string;
    }>;
};
//# sourceMappingURL=writeFile.d.ts.map