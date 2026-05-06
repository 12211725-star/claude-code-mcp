import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadConfig } from "../src/utils/config.js";

describe("loadConfig()", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clear relevant env vars
    delete process.env.WORKSPACE_ROOT;
    delete process.env.MODEL_PROVIDER;
    delete process.env.MODEL_NAME;
    delete process.env.DEEPSEEK_API_KEY;
    delete process.env.DOUBAO_API_KEY;
    delete process.env.QWEN_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.MODEL_BASE_URL;
    delete process.env.SUB_AGENT_MODEL;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("loads default config", () => {
    const config = loadConfig();
    expect(config.model.provider).toBeDefined();
    expect(config.model.name).toBeDefined();
    expect(config.context.maxTokens).toBeGreaterThan(0);
  });

  it("overrides model provider from env", () => {
    process.env.MODEL_PROVIDER = "qwen";
    const config = loadConfig();
    expect(config.model.provider).toBe("qwen");
  });

  it("overrides model name from env", () => {
    process.env.MODEL_NAME = "qwen-max";
    const config = loadConfig();
    expect(config.model.name).toBe("qwen-max");
  });

  it("reads DEEPSEEK_API_KEY from env", () => {
    process.env.DEEPSEEK_API_KEY = "sk-test-deepseek";
    const config = loadConfig();
    expect(config.model.apiKey).toBe("sk-test-deepseek");
  });

  it("reads DOUBAO_API_KEY from env", () => {
    process.env.DOUBAO_API_KEY = "sk-test-doubao";
    const config = loadConfig();
    expect(config.model.apiKey).toBe("sk-test-doubao");
  });

  it("reads MODEL_BASE_URL from env", () => {
    process.env.MODEL_BASE_URL = "https://custom.api.com/v1";
    const config = loadConfig();
    expect(config.model.baseUrl).toBe("https://custom.api.com/v1");
  });

  it("sets workspaceRoot to process.cwd() when not provided", () => {
    const config = loadConfig();
    expect(config.workspaceRoot).toBeDefined();
  });

  it("reads SUB_AGENT_MODEL from env", () => {
    process.env.SUB_AGENT_MODEL = "deepseek-chat-lite";
    const config = loadConfig();
    expect(config.model.subAgentModel).toBe("deepseek-chat-lite");
  });

  it("includes sandbox config", () => {
    const config = loadConfig();
    expect(config.sandbox).toBeDefined();
    expect(config.sandbox.allowedCommands).toBeInstanceOf(Array);
    expect(config.sandbox.blockedCommands).toBeInstanceOf(Array);
  });

  it("includes tools config", () => {
    const config = loadConfig();
    expect(config.tools.smartEdit.enabled).toBe(true);
    expect(config.tools.globSearch.enabled).toBe(true);
    expect(config.tools.taskAgent.maxConcurrent).toBeGreaterThan(0);
  });
});
