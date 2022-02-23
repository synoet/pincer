import express, { Application } from "express";
import cors from 'cors';

import {Logger, LoggerMiddleware } from './config/logger';

import Session from './routes/session.routes';
import Log from './routes/log.routes';
import Document from './routes/document.routes';
import User from './routes/user.routes';

require('dotenv').config();

const port = process.env.PORT;
const app: Application = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(LoggerMiddleware);

Session(app);
Log(app);
Document(app);
User(app);

app.listen(port, (): void => {
  Logger.info(`Davinci Started on port ${port}`)
});

