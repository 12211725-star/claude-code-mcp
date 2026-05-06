import type { ModelAdapter, ChatOptions, ChatResponse } from "./adapter.js";
export declare class DeepSeekAdapter implements ModelAdapter {
    private client;
    private modelName;
    constructor(config: {
        apiKey: string;
        baseUrl?: string;
        model?: string;
    });
    chat(messages: Array<{
        role: string;
        content: string;
    }>, options?: ChatOptions): Promise<ChatResponse>;
    streamChat(messages: Array<{
        role: string;
        content: string;
    }>, options?: ChatOptions): AsyncIterable<string>;
}
//# sourceMappingURL=deepseek.d.ts.map