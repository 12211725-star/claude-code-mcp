export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  stop?: string[];
}

export interface ChatResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
}

export interface ModelAdapter {
  chat(
    messages: Array<{ role: string; content: string }>,
    options?: ChatOptions
  ): Promise<ChatResponse>;

  streamChat(
    messages: Array<{ role: string; content: string }>,
    options?: ChatOptions
  ): AsyncIterable<string>;
}
