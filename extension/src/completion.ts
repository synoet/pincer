import axios from 'axios';
import {v4 as uuid} from 'uuid';
import {Completion} from './state';

export async function getCompletion(input: string): Promise<Completion | undefined> {
  return axios.post('http://localhost:8000/completion', input)
    .then((response) => {
      return {
        id: uuid(), 
        completion: response.data.completion,
        timestamp: Date.now(),
        input: input,
        accepted: false,
      };
    })
    .catch((error) => {
      console.log(error);
      return undefined;
    });

}

export async function syncCompletion(completion: Completion): Promise<void> {
  return axios.post('http://localhost:8000/sync/completion', completion)
    .then((_) => {
      return;
    })
    .catch((error) => {
      console.log(error);
      return;
    });
}
