import { createRequestHandler } from '@react-router/express'
import compression from 'compression'
import express, { type Request, type Response } from 'express'
import expressWinston from 'express-winston'
import winston from 'winston'
import * as build from './build/server/index.js'

const app = express()

const isDevelopment = process.env.NODE_ENV !== 'production'

// Winston logger configuration
const winstonLogger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    isDevelopment
      ? winston.format.combine(winston.format.colorize(), winston.format.simple())
      : winston.format.json(),
  ),
  defaultMeta: {
    service: 'pensjon-verdande',
  },
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
})

// Express Winston middleware for HTTP request logging
app.use(
  expressWinston.logger({
    winstonInstance: winstonLogger,
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}}',
    expressFormat: false,
    colorize: isDevelopment,
    ignoreRoute: (req) => {
      // Ignore health check endpoints
      return req.url === '/internal/live' || req.url === '/internal/ready'
    },
  }),
)

app.use(compression())

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable('x-powered-by')

// Vite fingerprints its assets so we can cache forever.
app.use('/assets', express.static('build/client/assets', { immutable: true, maxAge: '1y' }))

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static('build/client', { maxAge: '1h' }))

app.get(['/internal/live', '/internal/ready'], (_req: Request, res: Response) => {
  res.sendStatus(200)
})

// handle SSR requests
app.all(
  '/{*splat}',
  createRequestHandler({
    build,
  }),
)

const port = process.env.PORT || 8080

app.listen(port, () => {
  winstonLogger.info(`Express server listening at http://localhost:${port}`)
})
