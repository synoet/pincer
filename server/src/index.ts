import express, { Application, Request, Response } from "express";
import { MongoClient } from 'mongodb';
import cors from 'cors';

import {complete} from './lib/complete';

require('dotenv').config();

const uri = process.env.URL || "";
const key = process.env.KEY || "";
const port = process.env.PORT || 8000;
const app: Application = express();
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
  "/complete",
  async (req: Request, res: Response): Promise<Response> => {
    const {prompt, language} = req.body;
    console.log(prompt, language);

    const suggestions = await complete(prompt, language, key);

    return res.status(200).json({
      suggestions: suggestions,
    })
  }
)

// Print something cause vscode -> trash
app.post(
  "/debug",
  async(req: Request, res: Response): Promise<Response> => {
    console.log("/debug: \n", req.body, "\n")
    return res.status(200).send({
      message: "debug printed",
    });
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

// get logs by sessionId,
app.get(
  "/logs/session/:sessionId",
  async (req: Request, res: Response): Promise<any> => {
    if (!dbConnection) return res.status(500).send({message: "Failed to Connect to DB"});

    const {sessionId} = req.params;

    const logs = dbConnection.collection("logs");

    logs
      .find({sessionId: sessionId})
      .limit(100)
      .toArray((err: any, result: any) => {
        if(err) console.log(err);     
        res.json(result);
      });

  }
)

app.post(
  "/logs",
  async (req: Request, res: Response): Promise<Response> => {
    console.log("/logs", req.body);

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

app.get(
  "/session",
  async (req: Request, res: Response): Promise<any> => {
    if (!dbConnection) return res.status(400).send({message: "Failed to Connect to DB"});

    const sessions = dbConnection.collection("sessions");

    sessions
      .find({})
      .limit(12)
      .toArray((err: any, result: any) => {
        if (err) console.log(err);
        res.json(result);
      })
  }
)

app.get(
  "/session/user/:userId",
  async (req: Request, res: Response): Promise<any> => {
    if (!dbConnection) return res.status(400).send({message: "Failed to Connect to DB"});

    const {userId} = req.params;

    const users = dbConnection.collection("users");
    const sessions = dbConnection.collection("sessions");

    const [user] = await users
                  .find({userId: userId})
                  .toArray();

    const userSessionIds = user?.sessions;

    if (!userSessionIds || userSessionIds.length == 0) 
      return res.status(400).send({message: "User has no sessions"});

    let userSessions: any = [];

    await Promise.all(
      userSessionIds.map(async (sessionId: string) => {
        let [ session ] = await sessions
                        .find({sessionId: sessionId})
                        .toArray();
        userSessions.push(session);
      })
    )

    res.json(userSessions);
  }
)


// ping a session to keep it alive
app.post(
  "/session/ping",
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

app.get(
  "/user",
  async (req: Request, res: Response): Promise<any> => {
    if(!dbConnection) res.status(500).send({message: "Not connected to db"});

    const users = dbConnection.collection("users");


    await users
      .find({})
      .limit(100)
      .toArray((err: any, result: any) => {
        res.json(result);
      });
  }
)

app.post(
  "/user/create",
  async (req: Request, res: Response): Promise<any> => {
    console.log("/user/create", req.body);

    const {userId} = req.body;

    if(!dbConnection) res.status(400).send({message: "Not connected to db"});

    if(!userId) res.status(400).send({message: "No UserId in request"});

    const users = await dbConnection.collection("users");

    await users
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


app.post(
  "/user/session",
  async (req: Request, res: Response): Promise<any> => {
    console.log("/user/session invoked \n");
    const {userId, sessionId} = req.body;

    if (!dbConnection) return res.status(400).send({message: "Failed to Connect to DB"});

    const users = dbConnection.collection("users");

    const user = await users.find({userId: userId}).limit(1).toArray();

    console.log("user", user[0]);

    if (!user[0]) return;

    users
      .updateOne({userId: userId}, {
        $set: {
          userId: userId,
          sessions: user[0].sessions.length > 0 ? [... user[0].sessions, sessionId] : [sessionId],
        }
      }, (err: any) => {
          console.log(err);
      });
  }
)

try {
	app.listen(port, (): void => {
		console.log(`Connected successfully on port ${port}`);
	});
} catch (error) {
	console.error(`Error occured: ${error}`);
}
