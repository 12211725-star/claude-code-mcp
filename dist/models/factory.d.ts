import type { ModelAdapter } from "./adapter.js";
export interface ModelConfig {
    provider: "deepseek" | "doubao" | "qwen" | "openai" | "custom";
    name: string;
    apiKey: string;
    baseUrl?: string;
    subAgentModel?: string;
    subAgentProvider?: string;
}
export declare class ModelFactory {
    static create(config: ModelConfig): ModelAdapter;
    /**
     * Create a sub-agent model (can use cheaper models)
     */
    static createSubAgent(mainConfig: ModelConfig): ModelAdapter;
}
//# sourceMappingURL=factory.d.ts.map