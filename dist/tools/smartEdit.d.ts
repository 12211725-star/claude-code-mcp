import type { AppContext } from "../types.js";
export declare const smartEditTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            file_path: {
                type: string;
                description: string;
            };
            old_string: {
                type: string;
                description: string;
            };
            new_string: {
                type: string;
                description: string;
            };
            expected_replacements: {
                type: string;
                description: string;
                default: number;
            };
        };
        required: string[];
    };
    handler(args: any, ctx: AppContext): Promise<{
        success: boolean;
        file: any;
        replacements: number;
        diff: string;
    }>;
};
//# sourceMappingURL=smartEdit.d.ts.map