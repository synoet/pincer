import express from 'express';
import bodyParser from 'body-parser';
import {createClient} from '@supabase/supabase-js';

const app = express();
app.use(bodyParser.json());

const supabaseUrl = 'https://fhoizdhrqwsmbjhbkmxx.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseKey) {
  throw new Error('Missing SUPABASE_KEY env variable');
}

const supabase = createClient(supabaseUrl, supabaseKey)

app.get('/completion', (req, res) => {
});

app.post('/sync/documents', async (req, res) => {
  const { documents, userId } = req.body;


  documents.forEach(async (doc: any) => {
    const { error } = await supabase
      .from('Documents')
      .insert([
        {
          id: doc.id,
          timestamp: doc.timestamp,
          content: doc.timestamp,
          filePath: doc.filePath,
          userId: userId,
        },
      ])

    if (error) {
      console.log('error', error);
    }
  });

  res.status(200).send('ok');
});


app.post('/sync/completion', async (req, res) => {
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
        accepted_timestamp: completion.accepted_timestamp,
        userId: user.id,
      })
      .eq('id', completion.id)

    if (error) {
      console.log('error', error);
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
          accepted_timestamp: completion.accepted_timestamp,
          input: completion.input,
          userId: user.id,
        },
      ])

    if (error) {
      console.log('error', error);
    }

  }

  res.status(200).send('ok');
});


app.listen(8000, () => {
  console.log('Server started on port 8000');
});
