import {TimerReport} from './clock';
import axios from 'axios';
import {getUser, createUser} from './user';
import * as uuid from 'uuid';

interface CompletionLog {
  input: string;
  language: string;
  suggestion: string;
  taken: boolean;
}

export interface Logger {
  userId: String;
  sessionId: String;
  timerLogs: Array<TimerReport>;
  completionLogs: Array<CompletionLog>;
}

export class Logger implements Logger {
  contructor(){
    this.timerLogs = [];
    this.completionLogs = [];
  }

  clear(): void{
    this.contructor();
  }

  private async debug(value: any){
    await axios.post('http://localhost:8000/debug', {
      value: value,
    });
  }

  async initSession() {
    let userId = await getUser() || "";

    // If no user Id we create it and create on server
    if (!userId) {
      userId = await createUser();

      await axios.post('http://localhost:8000/user/create', {
        userId: userId,
      })
      .catch((err) => console.log(err));
    }

    this.userId = userId;

    this.sessionId = uuid.v4();
    await this.pingSession();

    await axios.post('http://localhost:8000/user/session', {
      userId: userId,
      sessionId: this.sessionId,
    }).catch((err: any) => console.log(err));
  }

  generateLogReport() {
    return {
      logTimeStamp: new Date(),
      timerLogs: this.timerLogs,
      completionLogs: this.completionLogs,
    };
  }

  async pingSession(){
    if (!this.sessionId) this.initSession();

    await axios.post('http://localhost:8000/ping', {sessionId: this.sessionId})
      .catch((err) => console.log(err));
  }

  sendSessionLogs(): void{
    if(!this.timerLogs || !this.completionLogs) return;

    axios.post('http://localhost:8000/logs', {
      sessionId: this.sessionId,
      timeStamp: new Date,
      completionLogs: this.completionLogs,
      timerLogs: this.timerLogs,
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

}
