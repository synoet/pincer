import axios from "axios";
import { v4 as uuid } from "uuid";
import { Completion, User } from "shared";

export async function getCompletion(
  input: string,
  context: string,
  fileExtension: string,
  userId: string,
  netId: string,
): Promise<Completion | null> {
  const response = await axios
    .post(
      `${process.env.BASE_URL}/completion`,
      {
        prompt: input,
        context: context ?? "",
        fileExtension: fileExtension,
        userId,
        netId,
      },
      { headers: { "auth-key": process.env.AUTH_KEY } }
    )
    .catch((error) => {
      console.error(error);
      return null;
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
  axios
    .post(`${process.env.BASE_URL}/sync/completion`, {
      completion: completion,
      user: user,
    })
    .catch((e) => {
      console.log(e);
    });
}
