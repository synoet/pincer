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

    const user = await db.collection("users").findOne({ userId: id }).catch((e: any) => console.log(e));

    const allDocuments = await db.collection("documents").find({}).toArray();

    const userDocuments = allDocuments
      .filter(
        (document: any) =>
          user.sessions.filter((session: any) => session === document.sessionId)
            .length > 0
      )
      .map((document: any) => ({
        content: document.document,
        timestamp: document.timeStamp,
      }));

    const timestamps = userDocuments.map((document: any) => document.timestamp);
    const functionDefinitions = [
      "int list_init(node **head)",
      "int list_item_to_string(node *head, char *str)",
      "int list_print(node *head)",
      "int list_add_item_at_pos(node **head, char *item_name, float price, int quantity, unsigned int pos)",
      "int list_update_item_at_pos(node **head, char *item_name, float price, int quantity, unsigned int pos)",
      "int list_remove_item_at_pos(node **head, int pos)", 
      "int list_swap_item_positions(node **head, int pos1, int pos2)",
      "int list_find_highest_price_item_position(node *head, int *pos)",
      "int list_cost_sum(node *head, float *total)",
      "int list_save(node *head, char *filename)",
      "int list_load(node **head, char *filename)",
      "int list_deduplicate(node **head)",
    ]

      
      let betterFunctions: Array<any> = []
      userDocuments.forEach((document: any) => {
        let localFunctions: Array<any> = []
        let lines = document.content.split("\n")
        for (let i = 0; i < lines.length; i++){
          for (let fd of functionDefinitions){
            if (lines[i].includes(fd)){
              for (let j = i; j < lines.length; j++){
                if (lines[j].split(" ")[0] === "}"){
                  localFunctions.push({
                    name: fd.substring(fd.indexOf(" ") +1, fd.indexOf("(")),
                    startLine: i,
                    endLine: j,
                    content: lines.slice(i, j + 1).join("\n")
                  })
                  i = j
                  break;
                }
              }
            }
          }
        }
        betterFunctions.push(localFunctions)
      })

    return {
      id: id,
      documents: userDocuments,
      timestamps: timestamps,
      functions: betterFunctions,
    };
  },
})
