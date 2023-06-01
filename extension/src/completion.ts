import axios from "axios";
import { v4 as uuid } from "uuid";
import { Completion, User } from "shared";

export async function getCompletion(
  input: string,
  context: string,
  fileExtension: string
): Promise<Completion | undefined> {
  const response = await axios.post(
    "https://pincer-server.fly.dev/completion",
    { prompt: input, context: context, fileExtension: fileExtension }
  );

  if (response.status === 200) {
    return {
      id: uuid(),
      completion: response.data.completion,
      timestamp: Date.now(),
      input: input,
      accepted: false,
      language: "en",
    };
  }

  return undefined;
}

export async function syncCompletion(
  completion: Completion,
  user: User
): Promise<void> {
  axios.post("https://pincer-server.fly.dev/sync/completion", {
    completion: completion,
    user: user,
  });
}
