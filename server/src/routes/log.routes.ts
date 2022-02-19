import { Router, Request, Response } from 'express';

export default (app: Router, dbClient: any) => {
  /*
    Create a new log
  */
  app.post(
    "/logs",
    async (req: Request, res: Response): Promise<Response> => {
      const logs = dbClient.collection("logs");

      await logs
        .insertOne(req.body, (err: any) => {
          if(err) return res.status(400).send({message: 'Failed to Log'});
        })
      return res.status(201).send({
        message: "Log Went Through Successfully"
      })
    }
  );

  /*
    Get all logs 
  */
  app.get(
    "/logs",
    async (req: Request, res: Response): Promise<any> => {
      const logs = dbClient.collection("logs");

      await logs
            .find({})
            .limit(100)
            .toArray((err: any, result: any) => {
              if (err) console.log(err);
              res.json(result);
            })
    }
  );

  /*
    Get a logs by session sessionId
  */
  app.get(
    "/logs/session/:sessionId",
    async (req: Request, res: Response): Promise<any> => {
      const {sessionId} = req.params;

      const logs = dbClient.collection("logs");

      logs
        .find({sessionId: sessionId})
        .limit(100)
        .toArray((err: any, result: any) => {
          if(err) console.log(err);     
          res.json(result);
        });

    }
  );

  
  
}
