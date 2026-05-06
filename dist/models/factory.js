import { DeepSeekAdapter } from "./deepseek.js";
import { DoubaoAdapter } from "./doubao.js";
import { QwenAdapter } from "./qwen.js";
export class ModelFactory {
    static create(config) {
        switch (config.provider) {
            case "deepseek":
                return new DeepSeekAdapter({
                    apiKey: config.apiKey,
                    model: config.name,
                    baseUrl: config.baseUrl,
                });
            case "doubao":
                return new DoubaoAdapter({
                    apiKey: config.apiKey,
                    model: config.name,
                });
            case "qwen":
                return new QwenAdapter({
                    apiKey: config.apiKey,
                    model: config.name,
                    baseUrl: config.baseUrl,
                });
            default:
                // Generic OpenAI-compatible interface
                return new DeepSeekAdapter({
                    apiKey: config.apiKey,
                    model: config.name,
                    baseUrl: config.baseUrl || "https://api.openai.com/v1",
                });
        }
    }
    /**
     * Create a sub-agent model (can use cheaper models)
     */
    static createSubAgent(mainConfig) {
        const provider = mainConfig.subAgentProvider || mainConfig.provider;
        const model = mainConfig.subAgentModel || mainConfig.name;
        return ModelFactory.create({
            ...mainConfig,
            provider: provider,
            name: model,
        });
    }
}
//# sourceMappingURL=factory.js.map