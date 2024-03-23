export enum CompletionType {
  Chat = "chat",
  Text = "text",
}

export type Message = {
  role: string;
  content: string;
};


export enum Models {
  GPT3 = "gpt-3.5-turbo-0125",
  Davinci = "davinci",
}

export const DEFAULT_CONFIGURATION = {
  url: "https://api.openai.com/v1/chat/completions",
  completionType: CompletionType.Chat,
  model: Models.GPT3,
  maxTokens: 2000,
}
