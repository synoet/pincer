import express, { Application } from "express";

import {Logger} from './config/logger.config';
import ConfigureApp from './config/express.config';

import BaseRoutes from './routes/base.routes';
import SessionRoutes from './routes/session.routes';
import LogRoutes from './routes/log.routes';
import DocumentRoutes from './routes/document.routes';
import UserRoutes from './routes/user.routes';
import ExtRoutes from './routes/ext.routes';

require('dotenv').config();

const port = process.env.PORT;
const app: Application = express();

// Any Express Configuration (Middleware)
ConfigureApp(app);

// All Routes
BaseRoutes(app);
SessionRoutes(app);
LogRoutes(app);
DocumentRoutes(app);
UserRoutes(app);
ExtRoutes(app);

app.listen(port, () => {
  Logger.info(`Davinci Started on port ${port}`)
});

