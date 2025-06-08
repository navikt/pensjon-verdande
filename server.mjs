import { createRequestHandler } from '@remix-run/express'
import express from 'express'
import PinoHttp from 'pino-http'
import pino from 'pino'

// notice that the result of `remix build` is "just a module"
import * as build from './build/index.js'

export const logger = pino({
  serializers: {
    req: pino.stdSerializers.wrapRequestSerializer((req) => {
      return {
        id: req.raw.id,
        method: req.raw.method,
        path: req.raw.url.split('?')[0], // Remove query params which might be sensitive
        // Allowlist useful headers
        headers: {
          host: req.raw.headers.host,
          'user-agent': req.raw.headers['user-agent'],
          referer: req.raw.headers.referer,
        }
      };
    }),
    res: pino.stdSerializers.wrapResponseSerializer((res) => {
      return {
        statusCode: res.raw.statusCode,
        // Allowlist useful headers
        headers: {
          'content-type': res.raw.headers['content-type'],
          'content-length': res.raw.headers['content-length'],
        }
      };
    }),
  },
})

const app = express()
app.use(PinoHttp({ logger: logger }))
app.use(express.static('public'))

app.get(['/internal/live', '/internal/ready'], (_, res) => res.sendStatus(200))

// and your app is "just a request handler"
app.all('*', createRequestHandler({ build }))

app.listen(8080, () => {
  logger.info('App listening on http://localhost:8080')
})
