// logger
import dotenv from 'dotenv';
dotenv.config();
import winston from 'winston';

// fix to display formatted error stacks in console
const displayStack = winston.format(info => {
  if (info.stack) {
    info.message = info.stack;
    delete info.stack;
  }
  return info;
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(displayStack(), winston.format.simple())
    })
  ]
});
export default logger;
