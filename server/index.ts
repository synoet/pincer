// Yes I'm aware this file is getting a little messy - synoet
import morgan from "morgan";
import { ResultAsync, err } from "neverthrow";
import { v4 as uuidv4 } from "uuid";
import { Configuration, OpenAIApi } from "openai";
import express, {
  NextFunction,
  Request,
  Response as ExpressResponse,
} from "express";
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

export const supabase = createClient(supabaseUrl, supabaseKey);

const configuration = new Configuration({
  apiKey: openaiKey,
});

interface UserRequest extends Request {
  body: {
    id: string;
    netId: string;
  };
}

interface CompletionRequest extends Request {
  body: {
    id: string;
    netId: string;
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

enum CompletionSource {
  OpenAI = "openai",
  Llama = "llama",
}

enum OpenAIModel {
  Davinci = "text-davinci-003",
}

const authMiddleware = (
  req: Request,
  res: ExpressResponse,
  next: NextFunction
) => {
  const authKey = req.headers["auth-key"];
  if (!authKey || authKey !== process.env.AUTH_KEY) {
    return res.status(403).send("Forbidden: Invalid AUTH key");
  }
  next();
};

app.post("/user", authMiddleware, async (req: UserRequest, res) => {
  return ResultAsync.fromPromise(
    supabase.from("User").select("*").eq("id", req.body.id),
    (error) => {
      console.log(error);
      return error;
    }
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
        }
      );
    })
    .match(
      async (_ok) => {
        return ResultAsync.fromPromise(
          supabase.from("UserSettings").insert([
            {
              id: req.body.id,
              net_id: req.body.netId,
              model: OpenAIModel.Davinci,
              source: CompletionSource.OpenAI,
              enabled: true,
            },
          ]),
          (error) => {
            console.log("Failed to add new user settings", error);
            return error;
          }
        ).match(
          (_ok) => {
            res.status(200).send();
          },
          (err) => {
            console.error(err);
            res.status(500).send();
          }
        );
      },
      async (_err) => {
        res.status(500).send();
      }
    );
});

app.get("/settings/:id", authMiddleware, async (req: Request, res) => {
  return ResultAsync.fromPromise(
    supabase.from("UserSettings").select("*").eq("id", req.params.id),
    (error) => {
      console.log(error);
      return error;
    }
  ).match(
    (ok) => {
      if (!ok.data || ok.data.length === 0) {
        return res.status(500).send();
      }
      return res.status(200).json(ok.data[0]).send();
    },
    (err) => {
      console.error(err);
      return res.status(500).send();
    }
  );
});

app.post("/completion", authMiddleware, async (req: CompletionRequest, res) => {
  ResultAsync.fromPromise(
    supabase.from("UserSettings").select("*").eq("id", req.body.netId),
    (error) => {
      console.log(error);
      return error;
    }
  ).match(
    (ok) => {
      const openai = new OpenAIApi(configuration);

      if (!ok.data || ok.data.length === 0) {
        return res.status(500).send();
      }

      if (ok.data[0].enabled === false) {
        return res.status(200).json({
          completion: null,
        });
      }

      if (ok.data[0].source !== CompletionSource.OpenAI) {
        console.error("requested invalid source");
        return res.status(500).send();
      }

      if (![OpenAIModel.Davinci].includes(ok.data[0].model)) {
        console.error("requested invalid model");
        return res.status(500).send();
      }

      return ResultAsync.fromPromise(
        openai.createCompletion({
          model: ok.data[0].model,
          prompt: "complete the following code snippet" + req.body.prompt,
        }),
        (error) => {
          console.log(error);
          return error;
        }
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
        }
      );
    },
    (err) => {
      console.log(err);
      return err;
    }
  );
});

app.post("/sync/documents", async (req: DocumentRequest, res) => {
  const { documents, user } = req.body;
  if (!documents) {
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
        }
      )
    )
  ).match(
    (_ok) => {
      res.status(200).send("ok");
    },
    (err) => {
      console.error(err);
      res.status(500).send();
    }
  );
});

app.post(
  "/sync/completion",
  authMiddleware,
  async (req: CompletionSyncRequest, res) => {
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
        },
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
    );
  }
);

const getLatestVersion = () =>
  ResultAsync.fromPromise(
    supabase.from("Version").select("*").eq("latest", true).limit(1),
    (error) => error
  );

app.get("/version/latest", async (_req, res) => {
  return getLatestVersion().match(
    (ok) => {
      res.status(200).send(ok?.data?.at(0).version);
    },
    (err) => {
      console.error(err);
      res.status(500).send();
    }
  );
});

app.get("/version/latest/download", async (_req, res) => {
  return getLatestVersion().match(
    (ok) => {
      const version = ok?.data?.at(0).version;
      if (!version) {
        return res.status(500).send();
      }
      return ResultAsync.fromPromise(
        supabase.storage
          .from("extension-bin")
          .download(`pincer-extension-${version}.vsix`),
        (error) => error
      ).match(
        async (ok) => {
          if (!ok.data) return res.status(500).send();
          return ResultAsync.fromPromise(
            ok.data.arrayBuffer(),
            (error) => error
          ).match(
            (ok) => {
              return res
                .status(200)
                .setHeader("Content-Type", "application/vsix")
                .setHeader(
                  "Content-Disposition",
                  `attachment; filename=pincer-extension-${version}.vsix`
                )
                .send(Buffer.from(ok));
            },
            (err) => {
              console.error(err);
              return res.status(500).send();
            }
          );
        },
        async (err) => {
          console.error(err);
          return res.status(500).send();
        }
      );
    },
    (err) => {
      console.error(err);
      return res.status(500).send();
    }
  );
});

app.get("/health", (_req, res) => {
  res.status(200).send("ok");
});

app.listen(8000, "0.0.0.0", () => {
  console.log("Server started on port 8000");
});
