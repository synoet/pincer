import express, { Application, Request, Response, NextFunction} from "express";
import { MongoClient } from 'mongodb';
import cors from 'cors';

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

app.get('/', (req, res) => {
  res.status(200).send({message: "davinci"})
})

Session(app);
Log(app);
Document(app);
User(app);


try {
	app.listen(port, (): void => {
		console.log(`Connected successfully on port ${port}`);
	});
} catch (error) {
	console.error(`Error occured: ${error}`);
}
