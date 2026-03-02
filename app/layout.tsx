import { Box, CopyButton, GlobalAlert, HStack, Page, Theme, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import { createCookie, isRouteErrorResponse, Outlet, useNavigation } from 'react-router'
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
  const ua = request.headers.get('User-Agent') ?? ''
  const isMac = /Mac|iPhone|iPad/.test(ua)

  const [me, schedulerStatus] = await Promise.all([hentMe(request), getSchedulerStatus(request)])

  return {
    env: env.env,
    me: me,
    schedulerStatus: schedulerStatus,
    darkmode: darkmode,
    isMac: isMac,
  }
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const { env, me, schedulerStatus, darkmode, isMac } = loaderData
  const [isDarkmode, setIsDarkmode] = useState<boolean>(darkmode)
  const [showIconMenu, setShowIconMenu] = useState<boolean>(false)
  const navigation = useNavigation()
  const isNavigating = navigation.state !== 'idle'

  const schedulerAlert = schedulerStatus && !schedulerStatus.schedulerEnabled && !schedulerStatus.schedulerLocal && (
    <GlobalAlert status="warning">
      <GlobalAlert.Header>
        <GlobalAlert.Title as="h2">Behandlingsløsningen er stoppet</GlobalAlert.Title>
      </GlobalAlert.Header>
      <GlobalAlert.Content>
        Ingen behandlinger vil bli prosessert i dette miljøet. Behandlingsløsningen må aktiveres for å gjenoppta
        behandling.
      </GlobalAlert.Content>
    </GlobalAlert>
  )

  return (
    <Theme theme={isDarkmode ? 'dark' : 'light'}>
      <Box asChild background={'default'}>
        <Page>
          {isNavigating && (
            <div
              role="progressbar"
              aria-label="Laster side"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '3px',
                zIndex: 9999,
                background: 'var(--ax-bg-brand-blue-strong, var(--ax-accent-600))',
                animation: 'loading-bar 1.5s ease-in-out infinite',
              }}
            />
          )}
          <NavHeader
            erProduksjon={env === 'p'}
            env={env}
            me={me}
            darkmode={isDarkmode}
            setDarkmode={setIsDarkmode}
            showIconMenu={showIconMenu}
            setShowIconMenu={setShowIconMenu}
            isMac={isMac}
          />

          <HStack gap="space-0" wrap={false}>
            <VenstreMeny me={me} showIconMenu={showIconMenu}></VenstreMeny>

            <Page.Block>
              <Box padding={'space-16'}>
                <VStack gap="space-16">
                  {schedulerAlert}
                  <Outlet context={me} />
                </VStack>
              </Box>
            </Page.Block>
          </HStack>
        </Page>
      </Box>
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
