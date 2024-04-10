import { get_encoding } from "tiktoken";
import fetch from "node-fetch";
import { OPENAI_API_KEY } from ".";
import { constructPrompt } from "./prompt";

const OPEN_AI_MAX_TOKENS = 200;
const PROMPT_TOKENS = 140;
const encoding = get_encoding("gpt2");

export async function constructChatCompletionRequest({
  prompt,
  context,
  model,
  url,
  fileExtension,
  maxTokens,
}: {
  prompt: string;
  context: string;
  model: string;
  url: string;
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
    Authorization: `Bearer ${OPENAI_API_KEY}`,
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
      content: prompt,
    },
  ];

  const body = {
    messages,
    model,
    max_tokens: 120,
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })

  const data: any = await res.json();

  return data?.choices[0]?.message?.content;
}

export async function constructTextCompletionRequest({
  prompt,
  url,
  context,
  model,
  fileExtension,
  maxTokens,
}: {
  prompt: string;
  context: string;
  url: string;
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
    Authorization: `Bearer ${OPENAI_API_KEY}`,
  };

  const constructedPrompt = constructPrompt(prompt, context, fileExtension);

  const body = {
    prompt: constructedPrompt,
    model: model,
    max_tokens: 120,
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const data: any = await res.json();
  return data.choices[0]?.text;
}

function countTokens(text: string): number {
  return encoding.encode(text).length;
}

function trimToTokens(text: string, maxTokens: number): string {
  const tokens = encoding.encode(text);
  const overflow = tokens.length - maxTokens;
  return encoding.decode(tokens.slice(overflow, tokens.length)).toString();
}
