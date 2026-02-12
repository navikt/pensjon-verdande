import { BodyLong, Box, Detail, Heading, VStack } from '@navikt/ds-react'
import {
  isRouteErrorResponse,
  Links,
  type LinksFunction,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router'
import IkkeTilgang from '~/components/feilmelding/IkkeTilgang'

import { env } from '~/services/env.server'
import type { Route } from '../.react-router/types/app/+types/root'
import appStylesHref from './app.css?url'
import '@navikt/ds-css'

export const links: LinksFunction = () => {
  return [...[{ rel: 'stylesheet', href: appStylesHref }]]
}

export const loader = async () => {
  return {
    env: env.env,
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  const rootData = useRouteLoaderData<typeof loader>('root')
  const envName = rootData?.env
  const title = envName ? (envName === 'p' ? 'Verdande' : `(${envName.toUpperCase()}) Verdande`) : 'Verdande'

  return (
    <html lang="nb">
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div style={{ width: '100%' }}>{children}</div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
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
      <Box padding="space-24">
        <VStack gap="space-12">
          <Heading level="1" size="large">
            {error.status} {error.statusText}
          </Heading>

          {obj?.message && <BodyLong>{obj.message}</BodyLong>}
          {obj?.detail && <pre style={{ whiteSpace: 'pre-wrap' }}>{obj.detail}</pre>}
          {str && <pre style={{ whiteSpace: 'pre-wrap' }}>{str}</pre>}

          {(obj?.path || obj?.timestamp) && (
            <VStack gap="space-4">
              {obj?.path && (
                <Detail>
                  Path: <code>{obj.path}</code>
                </Detail>
              )}
              {obj?.timestamp && <Detail>Tid: {obj.timestamp}</Detail>}
            </VStack>
          )}

          {obj?.trace && (
            <details>
              <summary>Stack trace</summary>
              <pre style={{ marginTop: '0.5rem', overflow: 'auto' }}>{obj.trace}</pre>
            </details>
          )}
        </VStack>
      </Box>
    )
  }

  if (error instanceof Error) {
    return (
      <Box padding="space-24">
        <VStack gap="space-8">
          <Heading level="1" size="large">
            Feil
          </Heading>
          <BodyLong>{error.message}</BodyLong>
          {error.stack && (
            <details>
              <summary>Stack trace</summary>
              <pre style={{ marginTop: '0.5rem', overflow: 'auto' }}>{error.stack}</pre>
            </details>
          )}
        </VStack>
      </Box>
    )
  }

  return (
    <Box padding="space-24">
      <Heading level="1" size="large">
        Ukjent feil
      </Heading>
    </Box>
  )
}
