import {TimerReport} from './clock';
import axios from 'axios';
import * as uuid from 'uuid';

interface CompletionLog {
  input: string;
  language: string;
  suggestion: string;
  taken: boolean;
}

export interface Logger {
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

  initSession() {
    this.sessionId = uuid.v4();
    this.pingSession();
  }

  generateLogReport() {
    return {
      logTimeStamp: new Date(),
      timerLogs: this.timerLogs,
      completionLogs: this.completionLogs,
    };
  }

  pingSession(){
    if (!this.sessionId) this.initSession();

    axios.post('http://localhost:8000/ping', {sessionId: this.sessionId})
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
