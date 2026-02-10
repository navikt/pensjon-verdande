import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'

import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger } from '~/services/behandling.server'
import type { Route } from './+types/behandlinger._index'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Behandlinger | Verdande' }]
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { searchParams } = new URL(request.url)

  const accessToken = await requireAccessToken(request)

  const page = searchParams.get('page')
  const size = searchParams.get('size')

  const behandlinger = await getBehandlinger(accessToken, {
    behandlingType: searchParams.get('behandlingType'),
    status: searchParams.get('status'),
    ansvarligTeam: searchParams.get('ansvarligTeam'),
    behandlingManuellKategori: searchParams.get('behandlingManuellKategori'),
    page: page ? +page : 0,
    size: size ? +size : 100,
    sort: searchParams.get('sort'),
  })
  if (!behandlinger) {
    throw new Response('Not Found', { status: 404 })
  }

  return { behandlinger }
}

export default function AvhengigeBehandlinger({ loaderData }: Route.ComponentProps) {
  const { behandlinger } = loaderData

  return <BehandlingerTable visStatusSoek={true} behandlingerResponse={behandlinger} />
}
