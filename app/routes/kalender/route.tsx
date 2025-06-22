import { ActionFunctionArgs, Await, useLoaderData } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger } from '~/services/behandling.server'
import { Box, Skeleton } from '@navikt/ds-react'
import React, { Suspense } from 'react'
import Kalender from '~/components/kalender/Kalender'

export const loader = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)

  // TODO: Quick and dirty hack for å hente batch-behandlinger for en måned (antar at det er mindre enn 100 i prod for en måned), uten å legge til et api i pen
  // Erstatt med et eget endepunkt i pen som henter batch-behandlinger for en måned
  const behandlinger = await getBehandlinger(
    accessToken,
    null,
    null,
    null,
    null,
    true,
    0,
    100,
    'opprettet,desc'
  )

  return {
    behandlinger: behandlinger,
    startDato: new Date(),
  }
}

export default function KalenderVisning() {
  const { behandlinger, startDato } = useLoaderData<typeof loader>()

  return (
    <Box
      background={'surface-default'}
      borderRadius="medium"
      shadow="medium"
      style={{
        paddingTop: '6px',
        paddingBottom: '6px',
        paddingLeft: '12px',
        paddingRight: '12px',
        width: '100%',
      }}
    >
      <Kalender behandlinger={behandlinger.content} visKlokkeSlett={true} startDato={startDato} maksAntallPerDag={6}></Kalender>
    </Box>
  )
}
