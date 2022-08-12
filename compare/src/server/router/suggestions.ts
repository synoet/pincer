import { createRouter } from "./context";
import { MongoClient } from "mongodb";
import { z } from "zod";

import {getMongoClient} from '../client'

export const suggestionsRouter = createRouter().query("getSuggestions", {
  input: z.object({
    id: z.string(),
    after: z.string(),
    before: z.string(),
  }),
  async resolve({ input }) {
    const { id, before, after } = input;
    console.log(before, after);

    const client = await getMongoClient();


    const db = client.db("DavinciLogs");

    const user = (await db.collection("users").findOne({ userId: id })) as any;

    const allSuggestions = (await db
      .collection("logs")
      .find({})
      .toArray()) as any;

    const userSuggestions = allSuggestions
      .filter(
        (suggestion: any) =>
          user.sessions.filter(
            (session: any) => session === suggestion.sessionId
          ).length > 0
      )
      .filter((suggestion: any) => {
        const beforeDate = new Date(before);
        const afterDate = new Date(after);
        const timestamp = new Date(suggestion.timeStamp);
        if (timestamp < beforeDate && timestamp > afterDate) {
          return true;
        }
        return false;
      })
      .filter((suggestion: any) => suggestion.completionLogs.length > 0)
      .map((suggestion: any) => suggestion.completionLogs[0])

    console.log(userSuggestions);





    return {
      suggestions: userSuggestions.filter((suggestion: any) => suggestion && suggestion.suggestion !== "")
    };
  },
});
