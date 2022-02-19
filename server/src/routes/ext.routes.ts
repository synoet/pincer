import { Router, Request, Response } from 'express';
import {complete} from '../lib/complete';

const KEY = process.env.KEY || "";

export default (app: Router, dbClient: any) => {
  /*
    Powers extension code completion
  */
  app.post(
    "/complete",
    async (req: Request, res: Response) => {
      const {prompt, language} = req.body;

      const suggestions = await complete(prompt, language, KEY);

      return res.status(200).json({
        suggestions: suggestions,
      })
    }
  );

  /*
    TODO: create better debugging
  */
  app.post(
    "/debug",
    async(req: Request, res: Response) => {
      return res.status(200).send({
        message: "debug printed",
      });
    }
  );
}
