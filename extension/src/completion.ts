import axios from "axios";
import { v4 as uuid } from "uuid";
import { Completion, User } from "shared";

export async function getCompletion(
  input: string,
  context: string,
  userId: string,
  netId: string,
  fileExtension: string
): Promise<Completion | null> {
  console.log(process.env.AUTH_KEY);
  const response = await axios.post(
    "https://pincer-server.fly.dev/completion",
    { prompt: input, context: context, fileExtension: fileExtension, userId, netId},
    { headers: { "auth-key": process.env.AUTH_KEY } }
  ).catch((error) => {
    console.error(error);
    return null
  });

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

  return null;
}

export async function syncCompletion(
  completion: Completion,
  user: User
): Promise<void> {
  axios.post("https://pincer-server.fly.dev/sync/completion", {
    completion: completion,
    user: user,
  }).catch((e) => {
    console.log(e)
  })
}
