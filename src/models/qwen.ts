import OpenAI from "openai";
import type { ModelAdapter, ChatOptions, ChatResponse } from "./adapter.js";

export class QwenAdapter implements ModelAdapter {
  private client: OpenAI;
  private modelName: string;

  constructor(config: { apiKey: string; baseUrl?: string; model?: string }) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl || "https://dashscope.aliyuncs.com/compatible-mode/v1",
    });
    this.modelName = config.model || "qwen-max";
  }

  async chat(
    messages: Array<{ role: string; content: string }>,
    options?: ChatOptions
  ): Promise<ChatResponse> {
    const response = await this.client.chat.completions.create({
      model: this.modelName,
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 4096,
      stop: options?.stop,
    });

    return {
      content: response.choices[0]?.message?.content || "",
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      finishReason: response.choices[0]?.finish_reason || "stop",
    };
  }

  async *streamChat(
    messages: Array<{ role: string; content: string }>,
    options?: ChatOptions
  ): AsyncIterable<string> {
    const stream = await this.client.chat.completions.create({
      model: this.modelName,
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 4096,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) yield content;
    }
  }
}
