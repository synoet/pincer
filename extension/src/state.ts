import axios from 'axios';
import {DocumentChange, User, Completion} from 'shared'

interface ExtensionState {
  changeLog: DocumentChange[];
  unsavedChanges: DocumentChange[];
  saveLog: number[];
  completions: Completion[];
  events: number[];
  user: User | undefined;
}

class ExtensionState implements ExtensionState {
  user: User | undefined = undefined 
  changeLog: DocumentChange[] = [];
  unsavedChanges: DocumentChange[] = [];
  saveLog: number[] = [];
  completions: Completion[] = [];
  events: number[] = [];

  addDocumentEvent(document: DocumentChange) {
    this.changeLog.push(document);
    this.unsavedChanges.push(document);
    this.events.push(Date.now());
  }

  shouldSync(): boolean {
    if (this.saveLog.length === 0) {
      return true;
    }

    if (Date.now() - this.saveLog[this.saveLog.length - 1] > 10000) {
      return true;
    }

    return false;
  }

  async sync() {
    return axios.post('https://pincer-server.fly.dev/sync/documents', {documents: this.unsavedChanges, user: this.user})
      .then((_) => {
        this.unsavedChanges = [];
        return;
      })
      .catch((error) => {
        console.log(error);
        return;
      });

  }

  shouldGetCompletion(): boolean {
    if (this.events.length == 0) {
      return true; 
    }

    if (Date.now() - this.events[this.events.length - 1] > 1800) {
      return true;
    }

    return false;
  }

  addCompletion(completion: Completion) {
    this.completions.push(completion);
  }

  setCompletionAsTaken(content: string): Completion | undefined {
    let completion: Completion | undefined = this.completions.find((completion) => {
      return completion.input === content;
    });

    if (!completion) {
      return;
    }

    completion.accepted = true;
    completion.acceptedTimestamp = Date.now();

    return completion; 
  }
}
export { ExtensionState, DocumentChange, Completion };
