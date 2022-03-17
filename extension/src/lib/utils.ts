export const sleep = (ms = 2500) => new Promise((r) => setTimeout(r, ms));

export const includesCompletions = (
  document: string,
  completions: any = []
) => {
  return document
    .split("\n")
    .join("")
    .includes(completions.pop().split("\n").join(""));
};

export const timeFromNow = (time: string | Date) => {
  const currTime = new Date(),
    otherTime = new Date(time);
  return Math.ceil(
    Math.abs((currTime.getTime() - otherTime.getTime()) / 1000 / 60)
  );
};

export const tokenize = (prompt: string) => {
  return Math.ceil(prompt.split("").length / 4);
};

export const trimToTokens = (prompt: string, tokens: number) => {
  let counter = 0,
    full = tokenize(prompt);
  return prompt
    .split("\n")
    .filter((p) => {
      counter += tokenize(p);
      if (full - tokens - counter < 0) {
        return true;
      }
      return false;
    })
    .join("\n");
};
