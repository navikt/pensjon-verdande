import { createRequestHandler } from '@react-router/express'
import compression from 'compression'
import express, { type Request, type Response } from 'express'
import * as build from "./build/server/index.js"

const app = express();

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

app.get(["/internal/live", "/internal/ready"], (_req: Request, res: Response) => {
  res.sendStatus(200);
});

// handle SSR requests
app.all('/{*splat}', createRequestHandler({
  build,
}));

app.listen(8080, () => {
    console.log(`Express server listening at http://localhost:8080`)
});
