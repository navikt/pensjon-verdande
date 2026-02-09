import { Alert, Box, CopyButton, HStack, Page, Theme } from '@navikt/ds-react'
import { useState } from 'react'
import { createCookie, isRouteErrorResponse, Outlet } from 'react-router'
import { hentMe } from '~/brukere/brukere.server'
import NavHeader from '~/components/nav-header/NavHeader'
import VenstreMeny from '~/components/venstre-meny/VenstreMeny'
import { getSchedulerStatus } from '~/services/behandling.server'
import { env } from '~/services/env.server'
import type { Route } from './+types/layout'
import IkkeTilgang from './components/feilmelding/IkkeTilgang'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const darkmodeCookie = await createCookie('darkmode').parse(request.headers.get('cookie'))
  const darkmode = darkmodeCookie === 'true' || darkmodeCookie === true

  const [me, schedulerStatus] = await Promise.all([hentMe(request), getSchedulerStatus(request)])

  return {
    env: env.env,
    me: me,
    schedulerStatus: schedulerStatus,
    darkmode: darkmode,
  }
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const { env, me, schedulerStatus, darkmode } = loaderData
  const [isDarkmode, setIsDarkmode] = useState<boolean>(darkmode)
  const [showIconMenu, setShowIconMenu] = useState<boolean>(false)

  const schedulerAlert = schedulerStatus && !schedulerStatus.schedulerEnabled && !schedulerStatus.schedulerLocal && (
    <Alert variant="error" style={{ marginBottom: '1rem' }}>
      Behandlingsløsningen er avslått i dette miljøet. Behandlinger vil ikke bli prosessert.
    </Alert>
  )

  return (
    <Theme theme={isDarkmode ? 'dark' : 'light'}>
      <Box.New asChild background={'default'}>
        <Page>
          <NavHeader
            erProduksjon={env === 'p'}
            env={env}
            me={me}
            darkmode={isDarkmode}
            setDarkmode={setIsDarkmode}
            showIconMenu={showIconMenu}
            setShowIconMenu={setShowIconMenu}
          />

          <HStack gap="0" wrap={false}>
            <VenstreMeny me={me} showIconMenu={showIconMenu}></VenstreMeny>

            <Page.Block>
              <Box padding={'4'}>
                {schedulerAlert}
                <Outlet context={me} />
              </Box>
            </Page.Block>
          </HStack>
        </Page>
      </Box.New>
    </Theme>
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
      <Theme>
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
            <>
              <CopyButton copyText={obj.trace.toString()} />
              <details className="mt-2">
                <summary style={{ cursor: 'pointer' }}>Stack trace</summary>
                <pre className="mt-2 overflow-auto">{obj.trace}</pre>
              </details>
            </>
          )}
        </div>
      </Theme>
    )
  }

  if (error instanceof Error) {
    return (
      <Theme>
        <div className="p-6 space-y-2">
          <h1 className="text-xl font-semibold">Operasjon feilet</h1>
          <p>{error.message}</p>
          {error.stack && (
            <>
              <CopyButton copyText={error.stack.toString()} />
              <details>
                <summary style={{ cursor: 'pointer' }}>Stack trace</summary>
                <pre className="mt-2 overflow-auto">{error.stack}</pre>
              </details>
            </>
          )}
        </div>
      </Theme>
    )
  }

  return (
    <Theme>
      <div className="p-6 space-y-2">
        <h1 className="text-xl font-semibold">Ukjent feil</h1>
        <details>
          <summary style={{ cursor: 'pointer' }}>Stack trace</summary>
          <pre className="mt-2 overflow-auto">{JSON.stringify(error, null, 2)}</pre>
        </details>
      </div>
    </Theme>
  )
}
