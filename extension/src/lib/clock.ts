interface Timer {
  name: string;
  startTime: Date;
  endTime: Date;
}

export interface TimerReport {
  name: string;
  timeTaken: Date;
}

class Timer implements Timer {
  constructor(name: string) {
    this.name = name;
  }

  calcTimeTaken(): Date{
    return new Date(this.endTime).getTime() - new Date(this.startTime).getTime() as any;
  }
}

export interface Clock {
  timers: Array<Timer>;
}

export class Clock implements Clock{
  constructor(){
    this.timers = [];
  }

  private getTimer(name: string): Timer {
    return this.timers.filter(timer => timer.name === name)[0];
  }

  clear(): void {
    this.timers = [];
  }

  newTimer(name: string): {startTimer: () => void} {
    const tempTimer = new Timer(name);
    this.timers.push(tempTimer);

    return { startTimer: () => this.startTimer(name)};
  }

  startTimer(name: string): void {
    const time = new Date();

    const timer = this.getTimer(name);
    
    if (!timer) return;
    timer.startTime = time;
  }

  endTimer(name: string): void {
    const time = new Date();

    const timer = this.getTimer(name);
    
    if (!timer) return;
    timer.endTime = time;
  }

  report(): Array<TimerReport> {
    return this.timers.map((timer) => {
      return {
        name: timer.name,
        timeTaken: timer.calcTimeTaken(),
      } as TimerReport;
    });
  }

}
