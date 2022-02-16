import {TimerReport} from './clock';
import * as config from '../config';
import axios from 'axios';
import {getUser, createUser} from './user';
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

  async initSession() {
    let userId = await getUser();

    // If no user Id we create it and create on server
    if (!userId) {
      userId = await createUser();

      await axios.post(`${config.SERVER_URI}/user/create`, {
        userId: userId,
      })
      .catch((err) => console.log(err));
      
      await this.debug(`created user with id: ${userId}`);
    } else {
      await this.debug(`Found user with id: ${userId}`)
    }

    this.userId = userId;

    this.sessionId = uuid.v4();
    await this.pingSession();

    await this.debug('before');

    await axios.post(`${config.SERVER_URI}/user/session`, {
      userId: userId,
      sessionId: this.sessionId,
    }).catch(async (err: any) => await this.debug(`EXTENSION ERROR ${err}`));

    await this.debug('FINISHED INITIALIZING SESSION');
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
      .catch((err) => console.log(err));
  }

  sendSessionLogs(): void{
    if(!this.timerLogs || !this.completionLogs) return;

    axios.post(`${config.SERVER_URI}/logs`, {
      sessionId: this.sessionId,
      timeStamp: new Date,
      completionLogs: this.completionLogs,
      timerLogs: this.timerLogs,
      documentLogs: this.documentLogs,
    }).catch((err) => console.log(err));
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
    this.debug("pushed document log");
    await axios.post(`${config.SERVER_URI}/document`, {
      sessionId: this.sessionId,
      ...log,
    })
    .catch((err: any) => {
      this.debug(`ERROR: ${err}`);
    })
  }

  async getLastDocumentTime(): Promise<any> {
    const last = await axios.get(`${config.SERVER_URI}/document/${this.sessionId}/last`)
                    .then((res) => res.data);

    this.debug("LAST");
    this.debug(last);
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
