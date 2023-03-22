import {User} from './user';
interface ExtensionState {
  changeLog: DocumentChange[];
  unsavedChanges: DocumentChange[];
  saveLog: number[];
  completions: Completion[];
  events: number[];
  user: User | undefined;
}

interface DocumentChange {
  id: string;
  content: string;
  filePath: string;
  timestamp: number;
}

interface Completion {
  id: string;
  completion: string;
  timestamp: number;
  input: string;
  accepted: boolean;
  acceptedTimestamp: number;
  language: string;
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

    if (Date.now() - this.saveLog[this.saveLog.length - 1] > 3600) {
      return true;
    }

    return false;
  }

  sync() {
  }

  shouldGetCompletion(): boolean {
    if (Date.now() - this.events[this.events.length - 1] > 3600) {
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
