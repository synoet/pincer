export const getRelative = (startTime: Date, endTime: Date) => {
  const start = new Date(startTime), end = new Date(endTime);
  return ((start.getTime() - end.getTime()) / 1000) / 60;
}
