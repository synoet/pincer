import { Router, Request, Response } from 'express';
import { getDbConnection } from '../db/connection.db';


export default async (app: Router) => {
  const dbClient = await getDbConnection();

  /*
    Create a new session for a user, with an id.
  */
  app.post(
    "/v2/session",
   async (req: Request, res: Response): Promise<any> => {
      console.log(dbClient);
      const {userId, sessionId} = req.body;

      const users = dbClient.collection("users");

      const user = await users.find({userId: userId}).limit(1).toArray();

      if (!user[0]) return;

      await users
        .updateOne({userId: userId}, {
          $set: {
            userId: userId,
            activated: user[0].activated || true,
            sessions: user[0].sessions.length > 0 ? [... user[0].sessions, sessionId] : [sessionId],
          }
        }, (err: any, res:any) => {
            if(err) throw err 
            if (res) console.log(res);
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

      sessions
        .find({})
        .sort({latestPing: -1})
        .toArray((err: any, result: any) => {
          if (err) console.log(err);
          res.json(result);
        })
    }
  );

  /*
    Get session info by its id.
  */
  app.get(
    "/v2/session/:sessionId",
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
      }, (err: any) => {
          if (err) console.log(err);
      });

      return res.status(201).send();
    }
  );
}
