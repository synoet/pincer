import { Router, Request, Response } from 'express';
import {complete} from '../lib/complete';

import { Logger } from '../config/logger.config';

const KEY = process.env.KEY || "";

export default (app: Router) => {
  /*
    Powers extension code completion
  */
  app.post(
    "/v2/complete",
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
    "/v2/debug",
    async(req: Request, res: Response) => {
      Logger.info(req.body);
    }
  );
}
