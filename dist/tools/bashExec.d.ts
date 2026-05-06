import type { AppContext } from "../types.js";
export declare const bashExecTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            command: {
                type: string;
                description: string;
            };
            description: {
                type: string;
                description: string;
            };
            timeoutMs: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(args: any, ctx: AppContext): Promise<{
        exitCode: number | undefined;
        stdout: string;
        stderr: string;
        success: boolean;
        timedOut?: undefined;
    } | {
        exitCode: number;
        stdout: any;
        stderr: string;
        success: boolean;
        timedOut: boolean;
    }>;
};
//# sourceMappingURL=bashExec.d.ts.map