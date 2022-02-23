import express, { Application } from "express";
import cors from 'cors';

import {Logger, LoggerMiddleware } from './config/logger';

import BaseRoutes from './routes/base.routes';
import SessionRoutes from './routes/session.routes';
import LogRoutes from './routes/log.routes';
import DocumentRoutes from './routes/document.routes';
import UserRoutes from './routes/user.routes';

require('dotenv').config();

const port = process.env.PORT;
const app: Application = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(LoggerMiddleware);


BaseRoutes(app);
SessionRoutes(app);
LogRoutes(app);
DocumentRoutes(app);
UserRoutes(app);

app.listen(port, (): void => {
  Logger.info(`Davinci Started on port ${port}`)
});

