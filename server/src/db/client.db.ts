import { MongoClient } from 'mongodb';

require('dotenv').config();

const uri = process.env.URL || "";

let dbClient: any;

export const getDbClient = async () => {
  if (dbClient) return dbClient;

  const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    } as any
  );

  await client.connect();

  return client.db("DavinciLogs");
}

