import { ActionFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { getBehandlinger } from '~/services/behandling.server'

import { requireAccessToken } from '~/services/auth.server'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import invariant from 'tiny-invariant'
import { BehandlingerPage } from '~/types'

export const loader = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.status, 'Missing status param')
  let { searchParams } = new URL(request.url)

  const size = searchParams.get('size')
  const page = searchParams.get('page')

  const accessToken = await requireAccessToken(request)
  const behandlinger = await getBehandlinger(
    accessToken,
    searchParams.get('behandlingType'),
    params.status,
    searchParams.get('ansvarligTeam'),
    null,
    null,
    page ? +page : 0,
    size ? +size : 100,
    searchParams.get('sort'),
  )
  if (!behandlinger) {
    throw new Response('Not Found', { status: 404 })
  }

  return json({ behandlinger })
}

export default function BehandlingerStatus() {
  const { behandlinger } = useLoaderData<typeof loader>()

  return (
    <div id="behandlinger">
      <BehandlingerTable visStatusSoek={false} behandlingerResponse={behandlinger as BehandlingerPage} />
    </div>
  )
}
