import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {v4 as uuid} from 'uuid';

export interface User {
  id: string;
}

export function getOrCreateUser(): Promise<User> {
  const configPath: string  = path.join(os.homedir(), '.pincer.conf');
  return new Promise((resolve, reject) => {
    fs.access(configPath, fs.constants.F_OK, (err) => {
      if (err) {
        const newId = uuid();
        fs.writeFile(configPath, newId, 'utf8', (err) => {
          if (err) {
            reject(err);
          } else {
            resolve({id: newId} as User);
          }
        });
      } else {
        // File exists, read the ID from it
        fs.readFile(configPath, 'utf8', (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve({id: data.trim()} as User);
          }
        });
      }
    });
  });
}
