import * as dotenv from 'dotenv'
import { Configuration, OpenAIApi } from "openai";
dotenv.config()
import express, {Request} from 'express';
import bodyParser from 'body-parser';
import {createClient} from '@supabase/supabase-js';
import {Completion, User, DocumentChange} from 'shared';

const app = express();
app.use(bodyParser.json());

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const openaiKey = process.env.OPENAI_API_KEY

if (!supabaseKey) {
  throw new Error('Missing SUPABASE_KEY env variable');
}

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL env variable');
}

if (!openaiKey) {
  throw new Error('Missing OPENAI_API_KEY env variable');
}

const supabase = createClient(supabaseUrl, supabaseKey)

const configuration = new Configuration({
  apiKey: openaiKey,
});

interface UserRequest extends Request {
  body: {
    id: string;
  }
}

app.post("/user", async (req: UserRequest, res) => {
  await supabase
    .from('User')
    .insert([
      {
        id: req.body.id,
      }
    ])

  res.status(200).send('ok');
});

interface CompletionRequest extends Request {
  body: {
    prompt: string;
    context: string;
    fileExtension: string;
  }
}

interface CompletionResponse {
  completion: string;
  context: string;
  fileExtension: string;
}

app.post('/completion', async (req: CompletionRequest , res) => {
  const { prompt } = req.body;

  const openai = new OpenAIApi(configuration);

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: "complete the following code snippet" + prompt,
  });

  const completion: string | undefined = response.data.choices[0].text;

  if (!completion) {
    console.warn("was not able to generate a completion");
    return res.status(500).send();
  }

  return res.status(200).json({ completion } as CompletionResponse);
});

interface DocumentRequest extends Request {
  body: {
    documents: DocumentChange[];
    user: User;
  }
}

app.post('/sync/documents', async (req: DocumentRequest, res) => {
  const { documents, user } = req.body;

  documents.forEach(async (doc: any) => {
    const { error } = await supabase
      .from('Document')
      .insert([
        {
          id: doc.id,
          timestamp: doc.timestamp,
          content: doc.content,
          filePath: doc.filePath,
          userId: user.id,
        },
      ])

    if (error) {
      console.error(error);
      return res.status(500).send();
    }
  });

  res.status(200).send('ok');
});

interface CompletionSyncRequest extends Request{
  body: {
    completion: Completion;
    user: User;
  }
}

app.post('/sync/completion', async (req: CompletionSyncRequest, res) => {
  const {completion, user } = req.body;

  let {data} = await supabase
    .from('Completion')
    .select('*')
    .eq('id', completion.id)

  if (data && data.length > 0) {
    const {error} = await supabase
      .from('Completion')
      .update({
        timestamp: completion.timestamp,
        completion: completion.completion,
        accepted: completion.accepted,
        language: completion.language,
        acceptedTimestamp: completion.acceptedTimestamp,
        userId: user.id,
      })
      .eq('id', completion.id)

    if (error) {
      console.error(error)
      return res.status(500).send()
    }
  } else {
    const {error} = await supabase
      .from('Completion')
      .insert([
        {
          id: completion.id,
          timestamp: completion.timestamp,
          completion: completion.completion,
          accepted: completion.accepted,
          language: completion.language,
          acceptedTimestamp: completion.acceptedTimestamp,
          input: completion.input,
          userId: user.id,
        },
      ])

    if (error) {
      console.error(error)
      return res.status(500).send()
    }

  }

  res.status(200).send('ok');
});

app.post("/log", async (req, res) => {
  const { body: { data, level} } = req;
  if (level === 'error') {
    console.error(data);
  } else if (level === 'warn') {
    console.warn(data);
  } else {
    console.info(data);
  }

  res.status(200).send('ok');
});

app.get("/health", (req, res) => {
  res.status(200).send('ok');
});

app.listen(8000, () => {
  console.log('Server started on port 8000');
});
