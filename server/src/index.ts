import express, { Application, Request, Response } from "express";
import { MongoClient } from 'mongodb';
import cors from 'cors';

require('dotenv').config();

const uri = process.env.URL || "";
const app: Application = express();
const port = 8000;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true } as any);

let dbConnection: any;

client.connect((err: any) => {
  dbConnection = client.db("DavinciLogs");
  if (err) console.log(err);
});

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.get(
	"/",
	async (req: Request, res: Response): Promise<Response> => {
		return res.status(200).send({
			message: "Hello from Davinci",
		});
	}
);

app.post(
  "/logs",
  async (req: Request, res: Response): Promise<Response> => {
    console.log(req.body);

    if(!dbConnection) return res.status(400).send({message: "Failed to Connect to DB"});

    dbConnection
      .collection("logs")
      .insertOne(req.body, (err: any) => {
        if(err) return res.status(400).send({message: 'Failed to Log'});
      })
  
    return res.status(201).send({
      message: "Log Went Through Successfully"
    })
  }
)

app.post(
  "/ping",
  async (req: Request, res: Response): Promise<Response> => {

    const {sessionId} = req.body;

    if(!dbConnection) return res.status(400).send({message: "Failed to Connect to DB"});

    const sessions = await dbConnection.collection("sessions");

    const session = await sessions
                      .find({sessionId: sessionId})
                      .limit(1)
                      .toArray();

    if(session.length === 0){
      sessions
        .insertOne({          
          sessionId: req.body.sessionId,
          startTime: new Date(),
          latestPing: new Date(),
        })

      return res.status(201).send({message: "Created Session"});
    }

    sessions.updateOne({sessionId: sessionId}, {
      $set: {
        ...session,
        latestPing: new Date(),
      }
    }, (err: any) => {
        if (err) console.log(err);
    });

    return res.status(201).send({message: "Pinged Session"})
  }
)

app.post(
  "/user",
  async (req: Request, res: Response): Promise<any> => {
    const {userId} = req.body;

    if(!dbConnection) res.status(400).send({message: "Not connected to db"});

    if(!userId) res.status(400).send({message: "No UserId in request"});

    const users = dbConnection.collection("users");

    users
      .insertOne({
        userId: userId,
        sessions: [],
      }, (err: any) => {
      if (err) {
            res.status(400).send({message: "Failed to create User"});
            console.log(err);
      } 
    })

  }
)

app.get(
  "/logs",
  async (req: Request, res: Response): Promise<any> => {
    if (!dbConnection) return res.status(400).send({message: "Failed to Connect to DB"});

    dbConnection
      .collection("logs")
      .find({})
      .limit(100)
      .toArray((err: any, result: any) => {
        if (err) console.log(err);
        res.json(result);
      })
  }
)

try {
	app.listen(port, (): void => {
		console.log(`Connected successfully on port ${port}`);
	});
} catch (error) {
	console.error(`Error occured: ${error}`);
}
