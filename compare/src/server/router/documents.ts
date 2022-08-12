import { createRouter } from "./context";
import { MongoClient } from "mongodb";
import { z } from "zod";

import {getMongoClient} from "../client";

export const documentsRouter = createRouter().query("getDocuments", {
  input: z.object({
    id: z.string(),
  }),
  async resolve({ input }) {
    const { id } = input;

    const client = await getMongoClient();


    const db = client.db("DavinciLogs");

    const user = await db.collection("users").findOne({ userId: id }).catch((e) => console.log(e));

    console.log(user)

    const allDocuments = await db.collection("documents").find({}).toArray();

    const userDocuments = allDocuments
      .filter(
        (document) =>
          user.sessions.filter((session: any) => session === document.sessionId)
            .length > 0
      )
      .map((document: any) => ({
        content: document.document,
        timestamp: document.timeStamp,
      }));

    const timestamps = userDocuments.map((document: any) => document.timestamp);

    let allFunctions: any = []

    userDocuments.forEach((document) => {
      let lines = document.content.split("\n")
      let functions: Array<{
        startLine: number,
        endLine: number,
        content: string,
        timestamp: string,
        name: string,
      }> = []
      for (let i = 0; i < lines.length; i++){
        let func: any = {}
        let splitLine = lines[i].split(" ")
        if (splitLine[0] === "int" && lines[i + 1] === "{"){
          func.startLine = i
          for (let j = i + 1; j < lines.length; j++){
            if (lines[j].split(" ").length === 1 && lines[j].split(" ")[0] === "}"){
              func.endLine = j
              break;
            }
            i = j
          }
          if (func.endLine){
            func.content = lines.slice(func.startLine, func.endLine + 1).join("\n")
            let firstLine = lines[func.startLine].split(" ")[1]
            func.name =  firstLine.slice(0, firstLine.indexOf("("))
            func.timestamp = document.timestamp
            functions.push(func)
          }
        }
      }
      allFunctions.push(functions)
    })
    return {
      id: id,
      documents: userDocuments,
      timestamps: timestamps,
      functions: allFunctions,
    };
  },
})
