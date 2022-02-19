import { Router, Request, Response } from 'express';

export default (app: Router, dbClient: any) => {
  app.get(
    "/session/:sessionId",
    async (req: Request, res: Response) => {
      const {sessionId} = req.params;

      const sessions = dbClient.collection("sessions");

      const [session] = await sessions
                        .find({sessionId: sessionId})
                        .limit(1)
                        .toArray();

      if (!session) res.status(401).send({message: `No Session with Id ${sessionId}`})

      res.status(200).json({session: session});
    }
  );

  app.get(
    "/session",
    async (req: Request, res: Response) => {
      const sessions = dbClient.collection("sessions");

      sessions
        .find({})
        .limit(12)
        .sort({latestPing: -1})
        .toArray((err: any, result: any) => {
          if (err) console.log(err);
          res.json(result);
        })
    }
  );
}
