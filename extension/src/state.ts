import axios from "axios";
import { randomUUID } from "crypto";
import { DocumentChange, User, Completion, UserSettings } from "shared";

interface ExtensionState {
  changeLog: DocumentChange[];
  unsavedChanges: DocumentChange[];
  saveLog: number[];
  completions: Completion[];
  events: number[];
  user: User | undefined;
}

class ExtensionState implements ExtensionState {
  netId: string;
  id: string;
  changeLog: DocumentChange[] = [];
  unsavedChanges: DocumentChange[] = [];
  saveLog: number[] = [];
  completions: Completion[] = [];
  events: number[] = [];
  settings: UserSettings | null;

  constructor() {
    this.id = randomUUID();
  }

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
      this.saveLog.push(Date.now());
    return axios
      .post(
        `${process.env['BASE_URL']}/sync/documents`,
        {
          documents: this.unsavedChanges,
          netId: this.netId,
          sessionId: this.id,
        },
      )
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

    if (
      Date.now() - this.events.sort((a, b) => b - a)[this.events.length - 1] >
      200
    ) {
      return true;
    }

    return false;
  }

  addCompletion(completion: Completion) {
    this.completions.push(completion);
  }

  setCompletionAsTaken(id: string): Completion | undefined {
    let completion: Completion | undefined = this.completions.find(
      (completion) => {
        return completion.id === id;
      }
    );

    console.log("COMPLETION", completion);

    if (!completion) {
      console.error("Completion not found");
      return;
    }

    completion.accepted = true;
    completion.acceptedTimestamp = Date.now();

    console.log("COMPLETION", completion);

    return completion;
  }
}
export { ExtensionState, DocumentChange, Completion };
