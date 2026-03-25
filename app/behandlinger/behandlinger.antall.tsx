import { BehandlingAntallTableCard } from '~/components/behandling-antall-table/BehandlingAntallTableCard'
import { apiGet } from '~/services/api.server'
import type { BehandlingAntallResponse } from '~/types'
import type { Route } from './+types/behandlinger.antall'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Antall behandlinger | Verdande' }]
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { behandlingAntall } = await apiGet<BehandlingAntallResponse>(
    '/api/behandling/oppsummering-behandling-antall',
    request,
  )
  return { behandlingAntall }
}

export default function BehandlingerAntall({ loaderData }: Route.ComponentProps) {
  return <BehandlingAntallTableCard behandlingAntall={loaderData.behandlingAntall} />
}
