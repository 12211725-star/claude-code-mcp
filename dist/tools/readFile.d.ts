import type { AppContext } from "../types.js";
export declare const readFileTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            file_path: {
                type: string;
                description: string;
            };
            offset: {
                type: string;
                description: string;
            };
            limit: {
                type: string;
                description: string;
            };
            pages: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(args: any, ctx: AppContext): Promise<{
        file: any;
        contentType: string;
        size: number;
        base64: string;
        note: string;
        content?: undefined;
        totalLines?: undefined;
    } | {
        file: any;
        contentType: string;
        note: string;
        size?: undefined;
        base64?: undefined;
        content?: undefined;
        totalLines?: undefined;
    } | {
        file: any;
        content: string;
        totalLines: number;
        contentType?: undefined;
        size?: undefined;
        base64?: undefined;
        note?: undefined;
    }>;
};
//# sourceMappingURL=readFile.d.ts.map