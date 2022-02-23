import { Request, Response, Router } from 'express';

export default (app: Router) => {
  app.get('/', (req: Request, res: Response) => {
    res.status(200).send({message: "Hello From Davinci"});
  })
}
