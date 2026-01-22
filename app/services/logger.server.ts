import winston from 'winston'
import { env } from './env.server'

const isDevelopment = env.env === 'local'

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  isDevelopment ? winston.format.combine(winston.format.colorize(), winston.format.simple()) : winston.format.json(),
)

export const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: logFormat,
  defaultMeta: {
    service: 'pensjon-verdande',
    environment: env.env,
  },
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
  // Note: exceptionHandlers and rejectionHandlers are NOT used here
  // because entry.server.tsx has custom logic to filter out React Router
  // control-flow objects (Response, DataWithResponseInit, etc.)
})
