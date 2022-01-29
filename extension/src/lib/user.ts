import * as fs from 'fs';
import * as uuid from 'uuid';

const local = process.env.HOME;

const getUser = (): string | void => {
  let userId;
  fs.readFile(`${local}/.davinci.conf`, 'utf-8', (err, data) => {
    if (err) {
      throw err;
    };
    if (data) {
      userId = data;
    }
  })

  if (!userId) return ;

  return userId;
}

const createUser = async (): Promise<void> => {
  const newId = uuid.v1();

  fs.writeFile(`${local}/.davinci.conf`, newId, (err: any) => {
    if (err) console.log(err);

    return {userId: newId}
  })

}

console.log(getUser());
