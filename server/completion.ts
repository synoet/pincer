import { get_encoding } from "tiktoken";
import axios from "axios";
import { OPENAI_API_KEY } from ".";
import { DEFAULT_CONFIGURATION } from "./types";

const OPEN_AI_MAX_TOKENS = 200;
const PROMPT_TOKENS = 140;
const encoding = get_encoding("gpt2");

export function constructOpenAICompletionRequest({
  prompt,
  context,
  model,
  fileExtension,
  maxTokens,
}: {
  prompt: string;
  context: string;
  model: string;
  fileExtension: string;
  maxTokens: number;
}) {
  const promptTokenCount = countTokens(prompt);
  const contextTokenCount = countTokens(context);

  const totalTokens =
    promptTokenCount + OPEN_AI_MAX_TOKENS + PROMPT_TOKENS + contextTokenCount;

  if (totalTokens > maxTokens) {
    const overflow = totalTokens - maxTokens;
    const trimmedContext = trimToTokens(context, contextTokenCount - overflow);
    context = trimmedContext;
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${OPENAI_API_KEY}`,
  };

  const messages = [
    {
      role: "system",
      content: `1. Complete the code provided, using the code provided.
                2. DO NOT RE-INCLUDE THE CODE PROVIDED IN YOUR ANSWER.
                3. DO NOT EXPLAIN ANYTHING
                4. ONLY return code, do not explain anything
                5. Your completion should start with the character after the code provided
                6. Use the following language ${fileExtension}
                Here is some context to help you get started:\n ${context}`,
    },
    {
      role: "user",
      content: prompt
    }
  ]

  const body = {
    messages,
    model: DEFAULT_CONFIGURATION.model,
    max_tokens: 512,
  };


  console.log(headers)
  console.log(body)

  return axios.post("https://api.openai.com/v1/chat/completions", body, {
    headers,
  });
}

function countTokens(text: string): number {
  return encoding.encode(text).length;
}

function trimToTokens(text: string, maxTokens: number): string {
  const tokens = encoding.encode(text);
  const overflow = tokens.length - maxTokens;
  return encoding.decode(tokens.slice(overflow, tokens.length)).toString();
}
