import { asLocalDateString } from '~/common/date'
import Kalender, { forsteOgSisteDatoForKalender } from '~/components/kalender/Kalender'
import { hentKalenderHendelser } from '~/services/behandling.server'
import type { Route } from './+types/route'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Kalender | Verdande' }]
}

export const loader = async ({ request }: Route.LoaderArgs) => {
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
    serverIDag: asLocalDateString(new Date()),
  }
}

export default function KalenderVisning({ loaderData }: Route.ComponentProps) {
  const { kalenderHendelser, startDato, serverIDag } = loaderData

  return (
    <Kalender
      kalenderHendelser={kalenderHendelser}
      maksAntallPerDag={6}
      startDato={startDato}
      visKlokkeSlett={true}
      serverIDag={serverIDag}
    ></Kalender>
  )
}
