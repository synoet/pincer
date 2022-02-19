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

  app.get(
    "/session/user/:userId",
    async (req: Request, res: Response) => {
      const {userId} = req.params;

      const users = dbClient.collection("users");
      const sessions = dbClient.collection("sessions");

      if(!users || !sessions) res.status(500).send();

      const [user] = await users
                    .find({userId: userId})
                    .toArray();

      const userSessionIds = user?.sessions;

      if (!userSessionIds || userSessionIds.length == 0) 
        return res.status(400).send({message: "User has no sessions"});

      let userSessions: any = [];

      await Promise.all(
        userSessionIds.map(async (sessionId: string) => {
          let [ session ] = await sessions
                          .find({sessionId: sessionId})
                          .toArray();
          userSessions.push(session);
        })
      )

      res.json(userSessions);
    }
  );

}
