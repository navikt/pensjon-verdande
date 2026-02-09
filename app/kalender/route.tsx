import { type LoaderFunctionArgs, useLoaderData } from 'react-router'
import Kalender, { forsteOgSisteDatoForKalender } from '~/components/kalender/Kalender'
import { hentKalenderHendelser } from '~/services/behandling.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url)

  const dato = searchParams.get('dato')

  const startDato = dato ? new Date(dato) : new Date()

  const { forsteDato, sisteDato } = forsteOgSisteDatoForKalender(startDato)

  return {
    kalenderHendelser: await hentKalenderHendelser(request, {
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
