import { Router, Request, Response } from "express";
import { getDbClient } from "../db/client.db";

import { Logger } from "../config/logger.config";

export default async (app: Router) => {
  const dbClient = await getDbClient();

  /*
    Create a new document
  */

  app.post("/v2/document", async (req: Request, res: Response) => {
    const { document, timeStamp, sessionId } = req.body;
    const documents = dbClient.collection("documents");

    await documents.insertOne(
      {
        sessionId: sessionId,
        document: document,
        timeStamp: timeStamp,
      },
      (err: any) => {
        if (err) {
          if (err) Logger.error(err);
          res.status(500).send({ message: "failed to add document" });
          return;
        }
      }
    );

    res.status(201).send({ message: "Success!" });
  });

  app.get("/v2/document/:userId", async (req: Request, res: Response) => {
    const { userId } = req.params;
    const users = dbClient.collection("users");
    const documents = dbClient.collection("documents");

    const { sessions: userSessions } = await users.findOne({ userId: userId });

    if (userSessions.length === 0) {
      res.status(404).send({ message: "No sessions found" });
      return;
    }

    const sessionDocuments = await documents.find({
      sessionId: { $in: userSessions },
    }).toArray();

    res.status(200).send(sessionDocuments);
  });

  /*
    Get timestamp of last document
  */
  app.get(
    "/v2/document/:sessionId/last",
    async (req: Request, res: Response): Promise<any> => {
      const { sessionId } = req.params;

      const documents = dbClient.collection("documents");

      const lastDocument = await documents
        .find({ sessionId: sessionId })
        .sort({ timeStamp: -1 })
        .limit(1)
        .toArray();

      if (!lastDocument[0]) {
        res.status(200).json(null);
        return;
      }
      res.status(200).json(lastDocument[0]);
    }
  );
};
