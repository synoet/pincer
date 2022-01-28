import {TimerReport} from './clock';

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
    // make request to server
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
