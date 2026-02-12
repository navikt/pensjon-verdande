import { PassThrough } from 'node:stream'
import { inspect } from 'node:util'
import { createReadableStreamFromReadable } from '@react-router/node'
import * as isbotModule from 'isbot'
import { renderToPipeableStream } from 'react-dom/server'
import type { ActionFunctionArgs, EntryContext, LoaderFunctionArgs } from 'react-router'
import { ServerRouter } from 'react-router'
import { logger } from '~/services/logger.server'

const ABORT_DELAY = 120_000

// Styrer hvor lenge Suspense/Await venter før de feiler. Suspense/Await brukes av Dashboardet, som bruker
// endel tid på å laste inn
export const streamTimeout = 30_000

process.on('unhandledRejection', (reason: unknown) => {
  const unwrap =
    typeof reason === 'object' && reason !== null && 'reason' in reason
      ? (reason as { reason?: unknown }).reason
      : reason

  const isControlFlow = (() => {
    // Router control-flow objects:
    if (unwrap instanceof Response) return true

    if (typeof unwrap === 'object' && unwrap !== null) {
      const obj = unwrap as Record<string, unknown>

      // DataWithResponseInit from `throw data(...)`
      if (obj.type === 'DataWithResponseInit') return true

      // RouteErrorResponse-like
      if (obj.name === 'RouteErrorResponse') return true

      const hasStatus = 'status' in obj && typeof obj.status === 'number'
      const hasStatusText = 'statusText' in obj && typeof obj.statusText === 'string'
      const hasDataOrBodyUsed = 'data' in obj || 'bodyUsed' in obj
      if (hasStatus && hasStatusText && hasDataOrBodyUsed) return true
    }

    return false
  })()

  if (isControlFlow) {
    // Let the router / ErrorBoundary handle it without noisy logs
    return
  }

  let stack: string
  if (unwrap instanceof Error) {
    stack = `${unwrap.name}: ${unwrap.message}\n${unwrap.stack ?? ''}`
  } else if (typeof unwrap === 'string') {
    stack = unwrap
  } else {
    stack = inspect(unwrap, { depth: 2, breakLength: 120 })
  }

  logger.error('Unhandled rejection', { reason: unwrap, stack })
})

process.on('uncaughtException', (error: Error) => {
  const stack = `${error.name}: ${error.message}\n${error.stack ?? ''}`

  logger.error('Uncaught exception', { error, stack })

  process.exit(1)
})

export function handleError(error: unknown, { request }: LoaderFunctionArgs | ActionFunctionArgs) {
  if (!request.signal.aborted) {
    logger.error('Unhandled error', { error })
  }
}

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
) {
  const prohibitOutOfOrderStreaming = isBotRequest(request.headers.get('user-agent')) || reactRouterContext.isSpaMode

  return prohibitOutOfOrderStreaming
    ? handleBotRequest(request, responseStatusCode, responseHeaders, reactRouterContext)
    : handleBrowserRequest(request, responseStatusCode, responseHeaders, reactRouterContext)
}

function isBotRequest(userAgent: string | null) {
  if (!userAgent) {
    return false
  }

  if ('isbot' in isbotModule && typeof isbotModule.isbot === 'function') {
    return isbotModule.isbot(userAgent)
  }

  return false
}

function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false
    const { pipe, abort } = renderToPipeableStream(<ServerRouter context={reactRouterContext} url={request.url} />, {
      onAllReady() {
        shellRendered = true
        const body = new PassThrough()
        const stream = createReadableStreamFromReadable(body)

        responseHeaders.set('Content-Type', 'text/html')

        resolve(
          new Response(stream, {
            headers: responseHeaders,
            status: responseStatusCode,
          }),
        )

        pipe(body)
      },
      onShellError(error: unknown) {
        reject(error)
      },
      onError(error: unknown) {
        responseStatusCode = 500
        // Log streaming rendering errors from inside the shell.  Don't log
        // errors encountered during initial shell rendering since they'll
        // reject and get logged in handleDocumentRequest.
        if (shellRendered) {
          logger.error('Streaming render error', { error })
        }
      },
    })

    setTimeout(abort, ABORT_DELAY)
  })
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false
    const { pipe, abort } = renderToPipeableStream(<ServerRouter context={reactRouterContext} url={request.url} />, {
      onShellReady() {
        shellRendered = true
        const body = new PassThrough()
        const stream = createReadableStreamFromReadable(body)

        responseHeaders.set('Content-Type', 'text/html')

        resolve(
          new Response(stream, {
            headers: responseHeaders,
            status: responseStatusCode,
          }),
        )

        pipe(body)
      },
      onShellError(error: unknown) {
        reject(error)
      },
      onError(error: unknown) {
        responseStatusCode = 500
        // Log streaming rendering errors from inside the shell.  Don't log
        // errors encountered during initial shell rendering since they'll
        // reject and get logged in handleDocumentRequest.
        if (shellRendered) {
          logger.error('Streaming render error', { error })
        }
      },
    })

    setTimeout(abort, ABORT_DELAY)
  })
}
