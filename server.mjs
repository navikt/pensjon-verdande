import { createRequestHandler } from "@react-router/express";
import compression from "compression";
import express from "express";
import PinoHttp from 'pino-http'
import pino from 'pino'

let pinoHttp = PinoHttp({
  logger: pino(),
  serializers: {
    err: pino.stdSerializers.wrapErrorSerializer((res) => {
      return {
        statusCode: res.raw.statusCode,
        // Allowlist useful headers
        headers: {
          'content-type': res.raw.headers['content-type'],
          'content-length': res.raw.headers['content-length'],
        }
      };
    }),
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

const remixHandler = createRequestHandler({
  build: await import("./build/server/index.js"),
});

const app = express();

app.use(pinoHttp)
app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

 // Vite fingerprints its assets so we can cache forever.
app.use(
  "/assets",
  express.static("build/client/assets", { immutable: true, maxAge: "1y" })
);

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("build/client", { maxAge: "1h" }));

app.get(['/internal/live', '/internal/ready'], (_, res) => res.sendStatus(200))

// handle SSR requests
app.all('/{*splat}', remixHandler);

app.listen(8080, () => {
    console.log(`Express server listening at http://localhost:8080`)
});
