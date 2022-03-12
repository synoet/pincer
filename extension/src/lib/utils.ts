export const sleep = (ms = 2500) => new Promise((r) => setTimeout(r, ms));

export const includesCompletions = (document: string, completions: any = []) => {
  return document.split('\n').join('').includes(completions.pop().split('\n').join(''))
}

export const timeFromNow = (time: string | Date) => {
  const currTime = new Date(), otherTime = new Date(time); 
  return Math.ceil(Math.abs(((currTime.getTime() - otherTime.getTime()) / 1000) / 60));
}
