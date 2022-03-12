import { Router, Request, Response } from 'express';
import { getDbClient } from '../db/client.db';
import { Logger } from '../config/logger.config';

export default async (app: Router) => {
  const dbClient = await getDbClient();
  /*
    get all users
  */
  app.get(
    "/v2/user",
    async (req: Request, res: Response): Promise<any> => {
      const users = dbClient.collection("users");

      await users
        .find({})
        .limit(100)
        .toArray((err: any, result: any) => {
          if (err) Logger.error(err);
          res.json(result).status(200);
        });
    }
  )

  app.get(
    "/v2/user/active",
    async (req: Request, res: Response) => {
      const users = dbClient.collection("users");
      const sessions = dbClient.collection("sessions");

      const allUsers = await users.find({}).limit(100).toArray();


      const activeUsers = await Promise.all(allUsers.filter(async (user: any) => {
        if (user.sessions.length === 0 ) return false;
        await Promise.all(user.sessions.filter(async (session: any ) => {
          const [currSession] = await sessions.find({sessionId: session.sessionId}).toArray();

          console.log(currSession);

          //const latestDate = new Date(latestPing), currDate = new Date();
          //const diff = Math.ceil(Math.abs(((latestDate.getTime() - currDate.getTime()) / 1000) / 60));

          //console.log(`from ${latestDate} to ${currDate} elapsed: ${diff}`);
        }))
      }));

      res.status(200).send({});
    }
  )

  /*
    Create a new user with an Id.
    Activated represents wether their extension is activated.
  */
  app.post(
    "/v2/user/create",
    async (req: Request, res: Response): Promise<any> => {
      const {userId, activated} = req.body;

      const users = await dbClient.collection("users");

      await users
        .insertOne({
          userId: userId,
          activated,
          sessions: [],
        }, (err: any) => {
        if (err) {
          if (err) Logger.error(err);
          res.status(400).send({message: "Failed to create User"});
        } 
      })
    }
  );

  /*
    Add a new session to a user.
  */
  app.post(
    "/v2/user/session",
    async (req: Request, res: Response): Promise<any> => {
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
        }, (err: any) => {
            if(err) Logger.error(err);
        });

      res.status(201).send({message: 'Success'});
    }
  );    

  /*
    user statistics
  */
  app.get(
    "/v2/users/stats",
    async (req: Request, res: Response) => {
      const users = dbClient.collection("users");

      const allUsers = await users.find({}).toArray();

      const activatedUsers = allUsers.filter((user: any) => user.activated);

      res.status(200).send({
        users: allUsers.length,
        activatedUsers: activatedUsers.length,
        unactivatedusers: allUsers.length - activatedUsers.length,
        percentActivated: Math.ceil((activatedUsers.length / allUsers.length) * 100),
      })
    }
  )
}
