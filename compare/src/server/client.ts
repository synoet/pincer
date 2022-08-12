import {MongoClient} from "mongodb";

let client: any = null;

export const getMongoClient = async () => {
  if (!client) {
    client = new MongoClient(
      `mongodb+srv://cubed:31415@cluster0.r4nhs.mongodb.net/?retryWrites=true&w=majority`,
      {}
    );

    await client.connect();
  }

  return client;
}