import { type LoaderFunctionArgs, useLoaderData } from 'react-router'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'

import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger } from '~/services/behandling.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
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

export default function AvhengigeBehandlinger() {
  const { behandlinger } = useLoaderData<typeof loader>()

  return <BehandlingerTable visStatusSoek={true} behandlingerResponse={behandlinger} />
}
