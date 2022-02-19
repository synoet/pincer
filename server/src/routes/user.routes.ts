import { Router, Request, Response } from 'express';

export default (app: Router, dbClient: any) => {
  /*
    get all users
  */
  app.get(
    "/user",
    async (req: Request, res: Response): Promise<any> => {
      const users = dbClient.collection("users");

      await users
        .find({})
        .limit(100)
        .toArray((err: any, result: any) => {
          res.json(result);
        });
    }
  )

  /*
    Create a new user with an Id.
    Activated represents wether their extension is activated.
  */
  app.post(
    "/user/create",
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
          res.status(400).send({message: "Failed to create User"});
          console.log(err);
        } 
      })
    }
  );

  /*
    Add a new session to a user.
  */
  app.post(
    "/user/session",
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
        }, (err: any, res:any) => {
            if(err) throw err 
            if (res) console.log(res);
        });

      res.status(201).send({message: 'Success'});
    }
  );    
}
