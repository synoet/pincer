import express, { Router } from 'express';
import cors from 'cors';

import { LoggerMiddleware } from './logger.config';

export default (app: Router) => {
  app.use(express.json());
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));

  // custom logger middleware
  app.use(LoggerMiddleware);

}
