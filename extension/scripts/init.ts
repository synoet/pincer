import fs from "fs";
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const EXTENSION_VERSION_PATH = "./EXTENSION_VERSION";

if (!supabaseKey) {
  throw new Error("Missing SUPABASE_KEY env variable");
}

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL env variable");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const content = fs.readFileSync('./scripts/users.txt', 'utf8');

let emails = content.split('\n').filter((e) => e !== '');

for ( const email of emails) {
  await supabase.from('UserSettings').insert([{
    net_id: email,
    model: 'gpt-3.5-turbo',
    source: 'openai',
    enabled: true
  }])
}

