import winston from 'winston';

const transports = [];

transports.push(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.cli(),
      winston.format.splat(),
    )
  })
)
const LoggerInstance = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports
});

export default LoggerInstance;
