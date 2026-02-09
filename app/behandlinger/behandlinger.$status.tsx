import { type LoaderFunctionArgs, useLoaderData } from 'react-router'
import invariant from 'tiny-invariant'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger } from '~/services/behandling.server'
import type { BehandlingerPage } from '~/types'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.status, 'Missing status param')
  const { searchParams } = new URL(request.url)

  const size = searchParams.get('size')
  const page = searchParams.get('page')

  const accessToken = await requireAccessToken(request)
  const behandlinger = await getBehandlinger(accessToken, {
    behandlingType: searchParams.get('behandlingType'),
    status: params.status,
    ansvarligTeam: searchParams.get('ansvarligTeam'),
    page: page ? +page : 0,
    size: size ? +size : 100,
    sort: searchParams.get('sort'),
  })
  if (!behandlinger) {
    throw new Response('Not Found', { status: 404 })
  }

  return { behandlinger }
}

export default function BehandlingerStatus() {
  const { behandlinger } = useLoaderData<typeof loader>()

  return <BehandlingerTable visStatusSoek={false} behandlingerResponse={behandlinger as BehandlingerPage} />
}
