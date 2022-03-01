import {TimerReport} from './clock';
import * as config from '../config';
import axios from 'axios';
import {getUser, createUser} from './user';
import {ACTIVATED} from '../config';
import * as uuid from 'uuid';

interface CompletionLog {
  input: string;
  language: string;
  suggestion: string;
  taken: boolean;
}

interface DocumentLog {
  document: string,
  sessionId?: string,
  timeStamp: Date,
}

export interface Logger {
  userId: String;
  sessionId: String;
  timerLogs: Array<TimerReport>;
  completionLogs: Array<CompletionLog>;
  documentLogs: Array<DocumentLog>;
}

export class Logger implements Logger {
  contructor(){
    this.timerLogs = [];
    this.completionLogs = [];
    this.documentLogs = [];
  }

  clear(): void{
    this.timerLogs = [];
    this.completionLogs = [];
  }

  async debug(value: any){
    await axios.post(`${config.SERVER_URI}/debug`, {
      value: value,
    });
  }

  async error(error: string){
    await axios.post(`${config.SERVER_URI}/error`, {
      error: error,
    })
  }

  async initSession() {
    let userId = await getUser();

    // If no user Id we create it and create on server
    if (!userId) {
      userId = await createUser();

      await axios.post(`${config.SERVER_URI}/user/create`, {
        userId: userId,
        activated: ACTIVATED,
      })
      .catch(async (err) => {
        await this.error(`Failed to Create User: ${userId} (Logger-65)`)
      });

      await this.debug(`created user with id: ${userId}`);
    } else {
      await this.debug(`Found user with id: ${userId}`)
    }

    this.userId = userId;
    this.sessionId = uuid.v4();

    await axios.post(`${config.SERVER_URI}/user/session`, {
      userId: userId,
      activated: ACTIVATED,
      sessionId: this.sessionId,
    }).catch(async (err: any) => {
      await this.error(`Failed to Create Session: ${this.sessionId} (Logger-81)`)
    })
  }

  generateLogReport() {
    return {
      logTimeStamp: new Date(),
      timerLogs: this.timerLogs,
      completionLogs: this.completionLogs,
      documentLogs: this.documentLogs,
    };
  }

  async pingSession(){
    if (!this.sessionId) this.initSession();

    await axios.post(`${config.SERVER_URI}/session/ping`, {sessionId: this.sessionId})
      .catch(async (err) => {
        await this.error(`Failed to Ping Session: ${this.sessionId} (Logger-100)`)
      });
  }

  sendSessionLogs(): void{
    if(!this.timerLogs || !this.completionLogs) return;

    axios.post(`${config.SERVER_URI}/logs`, {
      sessionId: this.sessionId,
      timeStamp: new Date,
      completionLogs: this.completionLogs,
      timerLogs: this.timerLogs,
      documentLogs: this.documentLogs,
    }).catch(async (err) => {
        await this.error(`Failed to post logs for session: ${this.sessionId} (Logger-114))`)
      });
  }

  takeClockReport(report: Array<TimerReport>): void {
    report.map((report) => {
      this.timerLogs.push(report);
    });
  }

  addCompletionLog(log: CompletionLog): void {
    this.completionLogs.push(log);
  }

  async pushDocumentLog(log: DocumentLog): Promise<void> {
    await axios.post(`${config.SERVER_URI}/document`, {
      sessionId: this.sessionId,
      ...log,
    })
    .catch(async (err: any) => {
      await this.error(`Failed to push document log for session: ${this.sessionId} (Logger-135)`)
    })
  }

  async getLastDocumentTime(): Promise<any> {
    const last = await axios.get(`${config.SERVER_URI}/document/${this.sessionId}/last`)
                    .then((res) => res.data)
                    .catch(async (error) => {
                      await this.error(`Failed to get last document for session: ${this.sessionId} (Logger-142)`)
                    })

    if (!last) return undefined;

    return last.timeStamp;
  }

  setRecentLogAsTaken(): void {
    let log = this.completionLogs.pop();
    if (!log) return;
    log.taken = true;
    this.completionLogs.push(log);
  }

}
