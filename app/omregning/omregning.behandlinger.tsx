import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'

import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger } from '~/services/behandling.server'
import type { BehandlingerPage } from '~/types'
import type { Route } from './+types/omregning.behandlinger'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { searchParams } = new URL(request.url)

  const size = searchParams.get('size')
  const page = searchParams.get('page')

  const accessToken = await requireAccessToken(request)
  const behandlinger = await getBehandlinger(accessToken, {
    behandlingType: 'OmregningBehandling',
    ansvarligTeam: searchParams.get('ansvarligTeam'),
    page: page ? +page : 0,
    size: size ? +size : 5,
    sort: searchParams.get('sort'),
  })
  if (!behandlinger) {
    throw new Response('Not Found', { status: 404 })
  }

  return { behandlinger }
}

export default function BehandlingerStatus({ loaderData }: Route.ComponentProps) {
  const { behandlinger } = loaderData

  return (
    <BehandlingerTable
      visStatusSoek={true}
      visBehandlingTypeSoek={false}
      behandlingerResponse={behandlinger as BehandlingerPage}
    />
  )
}
