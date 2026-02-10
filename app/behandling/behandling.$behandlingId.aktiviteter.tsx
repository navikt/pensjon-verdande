import invariant from 'tiny-invariant'
import BehandlingAktivitetTable from '~/components/aktiviteter-table/BehandlingAktivitetTable'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandling } from '~/services/behandling.server'
import type { Route } from './+types/behandling.$behandlingId.aktiviteter'

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

export default function BehandlingAktiviteter({ loaderData }: Route.ComponentProps) {
  const { behandling } = loaderData

  return <BehandlingAktivitetTable behandling={behandling} />
}
