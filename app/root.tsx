import { isRouteErrorResponse, LinksFunction } from 'react-router'

import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
} from 'react-router';
import navStyles from '@navikt/ds-css/dist/index.css?url'

import appStylesHref from './app.css?url'

import { Alert, HStack, VStack } from '@navikt/ds-react'
import { LoaderFunctionArgs } from 'react-router';
import { env } from '~/services/env.server'
import { tryAccessToken } from '~/services/auth.server'
import { hentMe } from '~/services/brukere.server'
import IkkeTilgang from '~/components/feilmelding/IkkeTilgang'
import NavHeader from '~/components/nav-header/NavHeader'
import VenstreMeny from '~/components/venstre-meny/VenstreMeny'
import { getSchedulerStatus } from '~/services/behandling.server'
import React from 'react'
import { Route } from '../.react-router/types/app/+types/root'

export const links: LinksFunction = () => {
  return [
    ...(
      [
        { rel: 'icon', href: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🧝‍♀️</text></svg>' },
        { rel: 'stylesheet', href: navStyles },
        { rel: 'stylesheet', href: appStylesHref },
      ]),
  ]
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const accessToken = await tryAccessToken(request)

  if (!accessToken) {
    return {
      env: env.env,
      me: undefined,
      schedulerStatus: undefined,
    }
  }

  const [me, schedulerStatus] = await Promise.all([
    hentMe(accessToken),
    getSchedulerStatus(accessToken),
  ])

  return {
    env: env.env,
    me,
    schedulerStatus,
  }
}

export default function App() {
  const navigation = useNavigation()

  const { env, me, schedulerStatus } = useLoaderData<typeof loader>()

  let title = env === 'p' ? 'Verdande' : `(${env.toUpperCase()}) Verdande`

  const schedulerAlert = schedulerStatus && !schedulerStatus.schedulerEnabled && !schedulerStatus.schedulerLocal && (
    <Alert variant="error" style={{ marginBottom: '1rem' }}>
      Behandlingsløsningen er avslått i dette miljøet. Behandlinger vil ikke bli prosessert.
    </Alert>
  )

  return (
    <html lang='en'>
    <head>
      <title>{title}</title>
      <meta charSet='utf-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <Meta />
      <Links />
    </head>
    <body>
      <VStack gap='0' style={{ width: '100%' }}>
        {me && <NavHeader erProduksjon={env === 'p'} env={env} me={me} />}

        <HStack gap='0' wrap={false}>
          {me && <VenstreMeny me={me} />}

          <div className={navigation.state === 'loading' ? 'loading' : ''} id='detail'>
            {schedulerAlert}
            <Outlet />
          </div>
        </HStack>
      </VStack>

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
      return (<IkkeTilgang error={error}></IkkeTilgang>)
    }

    return (
      <div className="p-6 space-y-3">
        <h1 className="text-xl font-semibold">
          {error.status} {error.statusText}
        </h1>

        {obj?.message && <p>{obj.message}</p>}
        {obj?.detail && (
          <pre className="whitespace-pre-wrap">{obj.detail}</pre>
        )}
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
