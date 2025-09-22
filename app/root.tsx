import navStyles from '@navikt/ds-css/dist/index.css?url'
import {
  isRouteErrorResponse,
  Links,
  type LinksFunction,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from 'react-router'
import IkkeTilgang from '~/components/feilmelding/IkkeTilgang'

import { env } from '~/services/env.server'
import type { Route } from '../.react-router/types/app/+types/root'
import appStylesHref from './app.css?url'
import '@navikt/ds-css/darkside'

export const links: LinksFunction = () => {
  return [
    ...[
      { rel: 'stylesheet', href: navStyles },
      { rel: 'stylesheet', href: appStylesHref },
    ],
  ]
}

export const loader = async () => {
  return {
    env: env.env,
  }
}

export default function App() {
  const { env } = useLoaderData<typeof loader>()

  const title = env === 'p' ? 'Verdande' : `(${env.toUpperCase()}) Verdande`

  return (
    <html lang="en">
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div style={{ width: '100%' }}>
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    const data = error.data as
      | Partial<{
          status: number
          title?: string
          message?: string
          detail?: string
          path?: string
          timestamp?: string
          trace?: string
        }>
      | string
      | undefined

    const obj = typeof data === 'object' && data ? data : undefined
    const str = typeof data === 'string' ? data : undefined

    if (error.status === 403) {
      return <IkkeTilgang error={error}></IkkeTilgang>
    }

    return (
      <div className="p-6 space-y-3">
        <h1 className="text-xl font-semibold">
          {error.status} {error.statusText}
        </h1>

        {obj?.message && <p>{obj.message}</p>}
        {obj?.detail && <pre className="whitespace-pre-wrap">{obj.detail}</pre>}
        {str && <pre className="whitespace-pre-wrap">{str}</pre>}

        <div className="text-sm opacity-70 space-y-1">
          {obj?.path && (
            <div>
              Path: <code>{obj.path}</code>
            </div>
          )}
          {obj?.timestamp && <div>Tid: {obj.timestamp}</div>}
        </div>

        {obj?.trace && (
          <details className="mt-2">
            <summary>Stack trace</summary>
            <pre className="mt-2 overflow-auto">{obj.trace}</pre>
          </details>
        )}
      </div>
    )
  }

  if (error instanceof Error) {
    return (
      <div className="p-6 space-y-2">
        <h1 className="text-xl font-semibold">Feil</h1>
        <p>{error.message}</p>
        {error.stack && (
          <details>
            <summary>Stack trace</summary>
            <pre className="mt-2 overflow-auto">{error.stack}</pre>
          </details>
        )}
      </div>
    )
  }

  return <h1>Ukjent feil</h1>
}
