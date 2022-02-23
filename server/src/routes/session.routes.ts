import { Router, Request, Response } from 'express';
import { getDbClient } from '../db/client.db';
import { Logger } from '../config/logger.config';


export default async (app: Router) => {
  const dbClient = await getDbClient();

  /*
    Create a new session for a user, with an id.
  */
  app.post(
    "/v2/session",
   async (req: Request, res: Response) => {
      const {userId, sessionId} = req.body;

      const users = dbClient.collection("users");

      const user = await users.find({userId: userId}).limit(1).toArray();

      if (!user[0]) {
        Logger.error(`no user found with userid ${userId}`)
        return;
      }

      await users
        .updateOne({userId: userId}, {
          $set: {
            userId: userId,
            activated: user[0].activated || true,
            sessions: user[0].sessions.length > 0 ? [... user[0].sessions, sessionId] : [sessionId],
          }
        }, (err: any) => {
            if(err) Logger.error(err);
        });

      res.status(201).send({message: 'Success'});
    }
  );

  /*
    Get all recent sessions
  */
  app.get(
    "/v2/sessions",
    async (req: Request, res: Response) => {
      const sessions = dbClient.collection("sessions");

      const { limit } = req.query;

      sessions
        .find({})
        .limit(limit || 100)
        .sort({latestPing: -1})
        .toArray((err: any, result: any) => {
          if (err) Logger.error(err); 
          res.status(200).json(result);
        })
    }
  );

  /*
    Get session info by its id.
  */
  app.get(
    "/v2/sessions/:sessionId",
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


    /*
    Get a session by a user id
  */
  app.get(
    "/v2/session/user/:userId",
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

  /*
    Extension will ping a session to keep it alive
  */
  app.post(
    "/v2/session/ping",
    async (req: Request, res: Response) => {
      const {sessionId} = req.body;

      const sessions = await dbClient.collection("sessions");

      const session = await sessions
                        .find({sessionId: sessionId})
                        .limit(1)
                        .toArray();

      if(session.length === 0){
        sessions
          .insertOne({          
            sessionId: req.body.sessionId,
            startTime: new Date(),
            latestPing: new Date(),
          })

        return res.status(201).send();
      }

      sessions.updateOne({sessionId: sessionId}, {
        $set: {
          ...session[0],
          latestPing: new Date(),
        }
      }, (err: Error) => {
          if (err) Logger.error(err); 
      });

      return res.status(201).send();
    }
  );

  /*
    Statistics regarding sessions
  */
  app.get(
    "/v2/session/stats",
    async (req: Request, res: Response) => {
      const sessions = await dbClient.collection("sessions");

      const allSessions = await sessions
                              .find({})
                              .toArray();

      let totalTime = allSessions
        .map((session: any) => {
          let start = new Date(session.startTime), end = new Date(session.latestPing);
          return Math.abs(((start.getTime() - end.getTime()) / 1000));
        })
        .reduce((a: number, b: number) => a + b);

      res.status(200).send({
        totalTime: totalTime,
        totalSessions: allSessions.length,
        averageSessionTime: totalTime / allSessions.length,
      });
    }
  )
}
