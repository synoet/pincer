import * as fs from "fs";
import * as uuid from "uuid";

const local = process.env.HOME;

export const getUser = async (): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    fs.readFile(`${local}/.davinci.conf`, "utf-8", (err, data) => {
      if (err) {
        resolve(null);
      }
      if (data) {
        resolve(data);
      }
    });
  });
};

export const createUser = async (): Promise<string> => {
  const newId = uuid.v1();

  fs.writeFile(`${local}/.davinci.conf`, newId, (err: any) => {
    if (err) console.log(err);
  });

  return newId;
};
