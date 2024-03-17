export enum CompletionSource {
  OpenAI = "openai",
}

export type Message = {
  role: string;
  content: string;
};

export type OpenAISource = {
  model: string;
  maxTokens: number;
  messages: string[];
};

// NOTE: can extend this if needed
export type Source = OpenAISource;
