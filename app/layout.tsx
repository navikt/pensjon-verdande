import NavHeader from '~/components/nav-header/NavHeader'
import { Alert, Box, HStack, Page, Theme, } from '@navikt/ds-react'
import VenstreMeny from '~/components/venstre-meny/VenstreMeny'
import { createCookie, type LoaderFunctionArgs, Outlet, useLoaderData } from 'react-router'
import { useState } from 'react'
import { requireAccessToken } from '~/services/auth.server'
import { hentMe } from '~/brukere/brukere.server'
import { getSchedulerStatus } from '~/services/behandling.server'
import { env } from '~/services/env.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const accessToken = await requireAccessToken(request)

  const darkmodeCookie = await createCookie('darkmode').parse(request.headers.get('cookie'))
  const darkmode = darkmodeCookie === 'true' || darkmodeCookie === true

  const [me, schedulerStatus] = await Promise.all([
    hentMe(accessToken),
    getSchedulerStatus(accessToken),
  ])

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

  const schedulerAlert = schedulerStatus && !schedulerStatus.schedulerEnabled && !schedulerStatus.schedulerLocal && (
    <Alert variant="error" style={{ marginBottom: '1rem' }}>
      Behandlingsløsningen er avslått i dette miljøet. Behandlinger vil ikke bli prosessert.
    </Alert>
  )

  return (
    <Theme theme={isDarkmode ? 'dark' : 'light'}>
      <Box.New asChild background={'default'}>
        <Page>
          <NavHeader erProduksjon={env === 'p'} env={env} me={me} darkmode={isDarkmode} setDarkmode={setIsDarkmode} />

          <HStack gap="0" wrap={false}>
            <VenstreMeny me={me}></VenstreMeny>

            <Page.Block style={{paddingLeft: '12px', paddingRight: '12px'}}>
              {schedulerAlert}
              <Outlet />
            </Page.Block>
          </HStack>
        </Page>
      </Box.New>
    </Theme>
  )
}
