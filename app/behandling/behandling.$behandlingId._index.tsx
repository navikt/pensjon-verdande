import invariant from 'tiny-invariant'
import { BehandlingKjoringerTable } from '~/components/kjoringer-table/BehandlingKjoringerTable'
import { getBehandling } from '~/services/behandling.server'
import type { Route } from './+types/behandling.$behandlingId._index'

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const behandling = await getBehandling(request, params.behandlingId)
  if (!behandling) {
    throw new Response('Not Found', { status: 404 })
  }

  return {
    behandling,
  }
}

export default function BehandlingKjoringer({ loaderData }: Route.ComponentProps) {
  const { behandling } = loaderData

  return <BehandlingKjoringerTable behandling={behandling} erAldeKjoring={!!behandling.erAldeBehandling} />
}
