import { dirname } from "path";
import { fileURLToPath } from "url";
import defaultConfig from "../../config/default.json" with { type: "json" };
const __dirname = dirname(fileURLToPath(import.meta.url));
export function loadConfig() {
    let config = { ...defaultConfig };
    // Override with environment variables
    const env = process.env;
    if (env.WORKSPACE_ROOT) {
        config.workspaceRoot = env.WORKSPACE_ROOT;
    }
    else {
        config.workspaceRoot = process.cwd();
    }
    if (env.MODEL_PROVIDER) {
        config.model.provider = env.MODEL_PROVIDER;
    }
    if (env.MODEL_NAME) {
        config.model.name = env.MODEL_NAME;
    }
    // API keys by provider
    if (env.DEEPSEEK_API_KEY) {
        config.model.apiKey = env.DEEPSEEK_API_KEY;
    }
    else if (env.DOUBAO_API_KEY) {
        config.model.apiKey = env.DOUBAO_API_KEY;
    }
    else if (env.QWEN_API_KEY) {
        config.model.apiKey = env.QWEN_API_KEY;
    }
    else if (env.OPENAI_API_KEY) {
        config.model.apiKey = env.OPENAI_API_KEY;
    }
    if (env.MODEL_BASE_URL) {
        config.model.baseUrl = env.MODEL_BASE_URL;
    }
    if (env.SUB_AGENT_MODEL) {
        config.model.subAgentModel = env.SUB_AGENT_MODEL;
    }
    return config;
}
export { defaultConfig };
//# sourceMappingURL=config.js.map