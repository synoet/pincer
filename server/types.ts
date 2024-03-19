

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

export enum OpenAIModels {
  GPT3 = "gpt-3.5-turbo-0125",
}

// NOTE: can extend this if needed
export type Source = OpenAISource;

export const DEFAULT_CONFIGURATION = {
  url: "https://api.openai.com/v1/chat/completions",
  source: CompletionSource.OpenAI,
  model: OpenAIModels.GPT3,
  maxTokens: 2000,
}
