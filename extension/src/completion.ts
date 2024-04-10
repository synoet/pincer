import axios from "axios";
import { v4 as uuid } from "uuid";
import { Completion } from "shared";

export async function getCompletion(
  input: string,
  context: string,
  fileExtension: string,
  netId: string,
): Promise<Completion | null> {
  const response = await axios
    .post(
      `${process.env['BASE_URL']}/completion`,
      {
        prompt: input,
        context: context ?? "",
        fileExtension: fileExtension,
        netId,
      },
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
  netId: string,
  sessionId: string,
): Promise<void> {
  console.log(completion);
  axios
    .post(`${process.env['BASE_URL']}/sync/completion`, {
      completion: completion,
      netId: netId,
      sessionId: sessionId,
    })
    .catch((e) => {
      console.error(e);
    });
}
