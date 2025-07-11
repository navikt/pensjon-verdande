import { ActionFunctionArgs, useLoaderData } from 'react-router'

import { getBehandlinger } from '~/services/behandling.server'

import { requireAccessToken } from '~/services/auth.server'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import { BehandlingerPage } from '~/types'

export const loader = async ({ request }: ActionFunctionArgs) => {
  let { searchParams } = new URL(request.url);
  const size = searchParams.get('size')
  const page = searchParams.get('page')

  const accessToken = await requireAccessToken(request)
  const behandlinger = await getBehandlinger(accessToken, {
    behandlingType: searchParams.get('behandlingType'),
    status: searchParams.get('status'),
    ansvarligTeam: searchParams.get('ansvarligTeam'),
    isBatch: true,
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

  return (
    <div id="behandlinger">
      <BehandlingerTable visStatusSoek={true} behandlingerResponse={behandlinger as BehandlingerPage} />
    </div>
  )
}
