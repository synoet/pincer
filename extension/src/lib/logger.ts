import {TimerReport} from './clock';
import axios from 'axios';

interface CompletionLog {
  input: string;
  language: string;
  suggestion: string;
  taken: boolean;
}

export interface Logger {
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

  generateLogReport() {
    return {
      logTimeStamp: new Date(),
      timerLogs: this.timerLogs,
      completionLogs: this.completionLogs,
    };
  }

  sendLogs(): void{
    if(!this.timerLogs || !this.completionLogs) return;

    axios.post('http://localhost:8000/log', {
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
