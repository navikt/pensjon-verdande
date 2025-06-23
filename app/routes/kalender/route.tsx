import { ActionFunctionArgs, useLoaderData } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { hentKalenderHendelser } from '~/services/behandling.server'
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
    kalenderHendelser: await hentKalenderHendelser({accessToken: accessToken}, {
      fom: forsteDato,
      tom: sisteDato,
    }),
    startDato: startDato,
  }
}

export default function KalenderVisning() {
  const { kalenderHendelser, startDato } = useLoaderData<typeof loader>()

  return (
    <Kalender
        kalenderHendelser={kalenderHendelser}
        maksAntallPerDag={6}
        startDato={startDato}
        visKlokkeSlett={true}
      ></Kalender>
  )
}
