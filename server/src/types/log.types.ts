export interface CompletionLog {
  input: string;
  language: string;
  suggestion: string;
  taken: boolean;
}

export interface TimerLog {
  name: string;
  timeTaken: number;
}

export default interface Log {
  sessionId: string;
  timeStamp: Date;
  completionLogs: Array<CompletionLog>;
  timerLogs: Array<TimerLog>;
}


