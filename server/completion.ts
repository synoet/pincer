import { get_encoding } from "tiktoken";
import axios from "axios";
import { OPENAI_API_KEY } from ".";
import { constructPrompt } from "./prompt";

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

  const fullPrompt = constructPrompt(prompt, context, fileExtension);
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${OPENAI_API_KEY}`,
  };

  const body = {
    prompt: fullPrompt,
    model,
    max_tokens: OPEN_AI_MAX_TOKENS,
  };

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
