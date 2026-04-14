import { BehandlingAntallTableCard } from '~/components/behandling-antall-table/BehandlingAntallTableCard'
import { apiGet } from '~/services/api.server'
import type { BehandlingAntallResponse } from '~/types'
import type { Route } from './+types/behandlinger.antall'

export function meta({ loaderData }: Route.MetaArgs): Route.MetaDescriptors {
  const prefix = loaderData.kunUkjente ? 'Ukjente behandlingstyper' : 'Antall behandlinger'
  return [{ title: `${prefix} | Verdande` }]
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url)
  const kunUkjente = url.searchParams.get('kunUkjente') === 'true'

  const { behandlingAntall } = await apiGet<BehandlingAntallResponse>(
    '/api/behandling/oppsummering-behandling-antall',
    request,
  )
  return { behandlingAntall, kunUkjente }
}

export default function BehandlingerAntall({ loaderData }: Route.ComponentProps) {
  return (
    <BehandlingAntallTableCard
      behandlingAntall={loaderData.behandlingAntall}
      defaultVisAlle
      kunUkjente={loaderData.kunUkjente}
    />
  )
}
