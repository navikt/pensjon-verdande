import { Alert, Box, HStack, Page, Theme } from '@navikt/ds-react'
import { useState } from 'react'
import { createCookie, type LoaderFunctionArgs, Outlet, useLoaderData } from 'react-router'
import { hentMe } from '~/brukere/brukere.server'
import NavHeader from '~/components/nav-header/NavHeader'
import VenstreMeny from '~/components/venstre-meny/VenstreMeny'
import { getSchedulerStatus } from '~/services/behandling.server'
import { env } from '~/services/env.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
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

export default function Layout() {
  const { env, me, schedulerStatus, darkmode } = useLoaderData<typeof loader>()
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

            <div style={{ paddingLeft: '12px', paddingRight: '12px', flex: 1 }}>
              {schedulerAlert}
              <Outlet context={me} />
            </div>
          </HStack>
        </Page>
      </Box.New>
    </Theme>
  )
}
