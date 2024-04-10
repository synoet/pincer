import { ResultAsync } from "neverthrow";
import { pinoHttp } from "pino-http";
import * as debounce from "lodash.debounce";
import pino from "pino";
import { v4 as uuidv4 } from "uuid";
import express, {
  NextFunction,
  Request,
  Response as ExpressResponse,
} from "express";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";
import { Completion, DocumentChange } from "shared";
import { CompletionType, DEFAULT_CONFIGURATION } from "./types";
import {
  constructChatCompletionRequest,
  constructTextCompletionRequest,
} from "./completion";
import * as dotenv from "dotenv";

dotenv.config();

const logger = pino({
  level: "info",
});

const app = express();
app.use(bodyParser.json());
app.use(
  pinoHttp({
    logger: logger,
  }),
);

export const supabaseUrl = process.env.SUPABASE_URL;
export const supabaseKey = process.env.SUPABASE_KEY;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!supabaseKey) {
  throw new Error("Missing SUPABASE_KEY env variable");
}

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL env variable");
}

if (!OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY env variable");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

interface CompletionRequest extends Request {
  body: {
    id: string;
    netId: string;
    prompt: string;
    context: string;
    fileExtension: string;
  };
}

interface SessionRequest extends Request {
  body: {
    sessionId: string;
    netId: string;
  }
}

interface DocumentRequest extends Request {
  body: {
    documents: DocumentChange[];
    netId: string;
    sessionId: string;
  };
}

interface CompletionSyncRequest extends Request {
  body: {
    completion: Completion;
    sessionId: string;
    netId: string;
  };
}

const authMiddleware = (
  req: Request,
  res: ExpressResponse,
  next: NextFunction,
) => {
  const authKey = req.headers["auth-key"];
  if ((!authKey || authKey !== process.env.AUTH_KEY) && process.env.PROD) {
    return res.status(403).send("Forbidden: Invalid AUTH key");
  }
  next();
};

app.get("/health", async (_req, res) => {
  return res.status(200).send("ok");
});

app.get("/settings/:id", authMiddleware, async (req: Request, res) => {
  return await ResultAsync.fromPromise(
    supabase.from("UserSettings").select("*").eq("net_id", req.params.id),
    (error) => {
      logger.error(error);
      return error;
    },
  ).match(
    (ok) => {
      if (!ok.data || ok.data.length === 0) {
        req.log.error("no settings found");
        return res.status(500).send();
      }
      return res.status(200).json(ok.data[0]).send();
    },
    (err) => {
      logger.error(err);
      req.log.error(err);
      return res.status(500).send();
    },
  );
});

app.post("/session/start", async (req: SessionRequest, res) => {
  return await ResultAsync.fromPromise(
    supabase.from("Session").upsert([
      {
        id: req.body.sessionId,
        net_id: req.body.netId, 
        start_time: Date.now(),
        end_time: null,
      }
    ]),
    (error) => {
      logger.error(error);
      return res.status(500).send("Failed to create session")
    }
  ).match(
    (_ok) => {
      return res.status(200).send("ok");
    },
    (err) => {
      logger.error(err);
      return res.status(500).send("Failed to create session");
    }
  );
});

app.post("/session/end", async (req: SessionRequest, res) => {
  return await ResultAsync.fromPromise(
    supabase.from("Session").update([
      {
        id: req.body.sessionId,
        net_id: req.body.netId, 
        end_time: Date.now(),
      }
    ]),
    (error) => {
      logger.error(error);
      return res.status(500).send("Failed to create session")
    }
  ).match(
    (_ok) => {
      return res.status(200).send("ok");
    },
    (err) => {
      logger.error(err);
      return res.status(500).send("Failed to create session");
    }
  );
})


app.post("/completion", authMiddleware, async (req: CompletionRequest, res) => {
  return await ResultAsync.fromPromise(
    supabase.from("UserSettings").select("*").eq("net_id", req.body.netId),
    (error) => {
      logger.error(error);
      return res.status(500).send("Failed to fetch user settings");
    },
  ).match(
    (ok) => {
      if (!ok.data || ok.data.length === 0) {
        logger.error(`no settings found for user ${req.body.netId}`);
        return res.status(500).send("no settings found");
      }

      if (ok.data[0].enabled === false) {
        logger.info(`user ${req.body.netId} has completion disabled`);
        return res.status(200).json({
          completion: null,
        });
      }

      const completionType = ok.data[0].completion_type;
      const model = ok.data[0].model;
      const url = ok.data[0].url;
      const maxTokens = ok.data[0].max_tokens;

      logger.info(
        `user ${req.body.netId} has completion enabled with model ${model} and completion type ${completionType}`,
      );

      let request: Promise<any>;

      switch (completionType) {
        case CompletionType.Chat: {
          request = constructChatCompletionRequest({
            prompt: req.body.prompt,
            context: req.body.context,
            model,
            fileExtension: req.body.fileExtension,
            url,
            maxTokens,
          });
          break;
        }
        case CompletionType.Text: {
          request = constructTextCompletionRequest({
            prompt: req.body.prompt,
            context: req.body.context,
            model,
            fileExtension: req.body.fileExtension,
            url,
            maxTokens,
          });
          break;
        }
        default: {
          logger.error("requested invalid source");
          return res.status(500).send("invalid source");
        }
      }

      return ResultAsync.fromPromise(request, (error) => {
        return error;
      }).match(
        (ok) => {
          return res
            .status(200)
            .json({
              completion: ok,
            })
            .send();
        },
        (err) => {
          logger.error(err);
          return res.status(500).send();
        },
      );
    },
    (err) => {
      logger.info(err);
      return res.status(500).send();
    },
  );
});

app.post("/sync/documents", async (req: DocumentRequest, res) => {
  const { documents, netId } = req.body;
  if (!documents) {
    logger.error("No documents provided")
    return res.status(500).send("No documents provided");
  }

  if (!netId) {
    console.error("Missing netId");
    return res.status(500).send("No document provided");
  }

  return await ResultAsync.combine(
    documents.map((doc: DocumentChange) =>
      ResultAsync.fromPromise(
        supabase.from("Document").insert([
          {
            id: uuidv4(),
            timestamp: doc.timestamp,
            content: doc.content,
            file_path: doc.filePath,
            net_id: netId,
            session_id: req.body.sessionId,
          },
        ]),
        (error) => {
          logger.error(error);
          return error;
        },
      ),
    ),
  ).match(
    (_ok) => {
      res.status(200).send("ok");
    },
    (err) => {
      logger.error(err);
      console.error(err);
      res.status(500).send();
    },
  );
});

app.post(
  "/sync/completion",
  authMiddleware,
  async (req: CompletionSyncRequest, res) => {
    const { completion, netId } = req.body;

    return await ResultAsync.fromPromise(
      supabase.from("Completion").upsert([
        {
          id: completion.id,
          timestamp: completion.timestamp,
          completion: completion.completion,
          accepted_char: completion.completion.length,
          net_id: netId,
          session_id: req.body.sessionId,
          accepted: completion.accepted,
          language: completion.language,
          accepted_timestamp: completion.acceptedTimestamp,
          input: completion.input,
        },
      ]),
      (error) => error,
    ).match(
      (_ok) => {
        return res.status(200).send();
      },
      (err) => {
        logger.error(err);
        return res.status(500).send();
      },
    );
  },
);

const getLatestVersion = () =>
  ResultAsync.fromPromise(
    supabase.from("Version").select("*").eq("latest", true).limit(1),
    (error) => error,
  );

app.get("/version/latest", async (_req, res) => {
  return getLatestVersion().match(
    (ok) => {
      return res.status(200).send(ok?.data?.at(0).version);
    },
    (err) => {
      logger.error(err);
      return res.status(500).send();
    },
  );
});

app.get("/version/latest/download", async (_req, res) => {
  return await getLatestVersion().match(
    (ok) => {
      const version = ok?.data?.at(0).version;
      if (!version) {
        return res.status(500).send();
      }
      return ResultAsync.fromPromise(
        supabase.storage
          .from("extension-bin")
          .download(`pincer-extension-${version}.vsix`),
        (error) => error,
      ).match(
        async (ok) => {
          if (!ok.data) return res.status(500).send();
          return ResultAsync.fromPromise(
            ok.data.arrayBuffer(),
            (error) => error,
          ).match(
            (ok) => {
              return res
                .status(200)
                .setHeader("Content-Type", "application/vsix")
                .setHeader(
                  "Content-Disposition",
                  `attachment; filename=pincer-extension-${version}.vsix`,
                )
                .send(Buffer.from(ok));
            },
            (err) => {
              logger.error(err);
              return res.status(500).send(err);
            },
          );
        },
        async (err) => {
          logger.error(err);
          return res.status(500).send(err);
        },
      );
    },
    (err) => {
      logger.error(err);
      return res.status(500).send(err);
    },
  );
});

app.get("/health", (_req, res) => {
  res.status(200).send("ok");
});

app.listen(8000, "0.0.0.0", () => {
  logger.info("Server started on port 8000");
});
