import { LoaderFunctionArgs, useLoaderData } from 'react-router'

import { getBehandlinger } from '~/services/behandling.server'

import { requireAccessToken } from '~/services/auth.server'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  let { searchParams } = new URL(request.url);

  const accessToken = await requireAccessToken(request)

  let page = searchParams.get('page')
  let size = searchParams.get('size')

  const behandlinger = await getBehandlinger(accessToken, {
    behandlingType: searchParams.get('behandlingType'),
    status: searchParams.get('status'),
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

export default function AvhengigeBehandlinger() {
  const { behandlinger } = useLoaderData<typeof loader>()

  return (
    <div id="behandlinger">
      <BehandlingerTable visStatusSoek={true} behandlingerResponse={behandlinger} />
    </div>
  )
}
