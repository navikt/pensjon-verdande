import { ActionFunctionArgs, useLoaderData } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger, hentKalenderHendelser } from '~/services/behandling.server'
import { Box } from '@navikt/ds-react'
import React from 'react'
import Kalender, { forsteOgSisteDatoForKalender } from '~/components/kalender/Kalender'

export const loader = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)

  let { searchParams } = new URL(request.url)

  const dato = searchParams.get('dato')

  let startDato = dato ? new Date(dato) : new Date()

  let { forsteDato, sisteDato } = forsteOgSisteDatoForKalender(startDato)

  return {
    behandlinger: await getBehandlinger(accessToken, {
      fom: forsteDato,
      tom: sisteDato,
      isBatch: true,
      page: 0,
      size: 1000,
      sort: 'opprettet,desc',
    }),
    kalenderHendelser: await hentKalenderHendelser(accessToken, {
      fom: forsteDato,
      tom: sisteDato,
    }),
    startDato: startDato,
  }
}

export default function KalenderVisning() {
  const { behandlinger, kalenderHendelser, startDato } = useLoaderData<typeof loader>()

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
      <Kalender
        behandlinger={behandlinger.content}
        kalenderHendelser={kalenderHendelser}
        maksAntallPerDag={6}
        startDato={startDato}
        visKlokkeSlett={true}
      ></Kalender>
    </Box>
  )
}
