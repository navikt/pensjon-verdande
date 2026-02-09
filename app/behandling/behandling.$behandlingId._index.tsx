import { useLoaderData } from 'react-router'
import invariant from 'tiny-invariant'
import { BehandlingKjoringerTable } from '~/components/kjoringer-table/BehandlingKjoringerTable'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandling } from '~/services/behandling.server'
import type { Route } from './+types/behandling.$behandlingId._index'

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const accessToken = await requireAccessToken(request)
  const behandling = await getBehandling(accessToken, params.behandlingId)
  if (!behandling) {
    throw new Response('Not Found', { status: 404 })
  }

  return {
    behandling,
  }
}

export default function BehandlingKjoringer() {
  const { behandling } = useLoaderData<typeof loader>()

  return <BehandlingKjoringerTable behandling={behandling} erAldeKjoring={!!behandling.erAldeBehandling} />
}
