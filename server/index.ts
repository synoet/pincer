import morgan from "morgan";
import { ResultAsync, err} from "neverthrow";
import { v4 as uuidv4 } from "uuid";
import { Configuration, OpenAIApi } from "openai";
import express, { Request } from "express";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";
import { Completion, User, DocumentChange } from "shared";

const app = express();
app.use(bodyParser.json());
app.use(morgan("combined"));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (!supabaseKey) {
  throw new Error("Missing SUPABASE_KEY env variable");
}

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL env variable");
}

if (!openaiKey) {
  throw new Error("Missing OPENAI_API_KEY env variable");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const configuration = new Configuration({
  apiKey: openaiKey,
});

interface UserRequest extends Request {
  body: {
    id: string;
  };
}

interface CompletionRequest extends Request {
  body: {
    prompt: string;
    context: string;
    fileExtension: string;
  };
}

interface DocumentRequest extends Request {
  body: {
    documents: DocumentChange[];
    user: User;
  };
}

interface CompletionSyncRequest extends Request {
  body: {
    completion: Completion;
    user: User;
  };
}

app.post("/user", async (req: UserRequest, res) => {
  return ResultAsync.fromPromise(
    supabase.from("User").select("*").eq("id", req.body.id),
    (error) => {
      console.log(error);
      return error;
    },
  )
    .andThen((response) => {
      if (response && (response.count ?? 0) > 0) {
        return err("User already exists");
      }
      return ResultAsync.fromPromise(
        supabase.from("User").insert([
          {
            id: req.body.id,
          },
        ]),
        (error) => {
          console.log("Failed to add new user", error);
          return error;
        },
      );
    })
    .match(
      (_ok) => {
        res.status(200).send();
      },
      (_err) => {
        res.status(500).send();
      },
    );
});

app.post("/completion", async (req: CompletionRequest, res) => {
  const openai = new OpenAIApi(configuration);

  return ResultAsync.fromPromise(
    openai.createCompletion({
      model: "text-davinci-003",
      prompt: "complete the following code snippet" + req.body.prompt,
    }),
    (error) => {
      console.log(error);
      return error;
    },
  ).match(
    (ok) => {
      res
        .status(200)
        .json({
          completion: ok.data.choices[0].text,
        })
        .send();
    },
    (err) => {
      console.error(err);
      res.status(500).send();
    },
  );
});

app.post("/sync/documents", async (req: DocumentRequest, res) => {
  const { documents, user } = req.body;
  if (!document) {
    console.error("Missing documents");
    return res.status(500).send();
  }

  if (!user) {
    console.error("Missing user");
    return res.status(500).send();
  }

  ResultAsync.combine(
    documents.map((doc: DocumentChange) =>
      ResultAsync.fromPromise(
        supabase.from("Document").insert([
          {
            id: uuidv4(),
            timestamp: doc.timestamp,
            content: doc.content,
            filePath: doc.filePath,
            userId: user.id,
          },
        ]),
        (error) => {
          console.error(error);
          return error;
        },
      ),
    ),
  ).match(
    (_ok) => {
      res.status(200).send("ok");
    },
    (err) => {
      console.error(err);
      res.status(500).send();
    },
  );
});

app.post("/sync/completion", async (req: CompletionSyncRequest, res) => {
  const { completion, user } = req.body;
   
  return ResultAsync.fromPromise(
    supabase.from("Completion").upsert([
      {
        id: completion.id,
        timestamp: completion.timestamp,
        completion: completion.completion,
        userId: user.id,
        accepted: completion.accepted,
        language: completion.language,
        acceptedTimestamp: completion.acceptedTimestamp,
        input: completion.input,
      }
    ]),
    (error) => error
  ).match(
    (_ok) => {
      res.status(200).send();
    },
    (err) => {
      console.error(err);
      res.status(500).send();
    }
  )
});

app.get("/health", (_req, res) => {
  res.status(200).send("ok");
});

app.listen(8000, "0.0.0.0", () => {
  console.log("Server started on port 8000");
});
