import { VStack } from '@navikt/ds-react'
import { BehandlingerPerDagLineChartCard } from '~/components/behandlinger-per-dag-linechart/BehandlingerPerDagLineChartCard'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import { apiGet } from '~/services/api.server'
import { getBehandlinger } from '~/services/behandling.server'
import type { OpprettetPerDagResponse } from '~/types'
import type { Route } from './+types/behandlinger._index'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Behandlinger | Verdande' }]
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { searchParams } = new URL(request.url)

  const page = searchParams.get('page')
  const size = searchParams.get('size')

  const behandlingType = searchParams.get('behandlingType')

  const behandlinger = await getBehandlinger(request, {
    behandlingType,
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

  const opprettetPerDag = behandlingType
    ? await apiGet<OpprettetPerDagResponse>(
        `/api/behandling/oppsummering-opprettet-per-dag?${new URLSearchParams({ behandlingType }).toString()}`,
        request,
      ).then((it) => it.opprettetPerDag)
    : null

  return { behandlinger, opprettetPerDag }
}

export default function AvhengigeBehandlinger({ loaderData }: Route.ComponentProps) {
  const { behandlinger, opprettetPerDag } = loaderData

  return (
    <VStack gap="space-24">
      {opprettetPerDag && <BehandlingerPerDagLineChartCard opprettetPerDag={opprettetPerDag} chartHeight={180} />}
      <BehandlingerTable visStatusSoek={true} behandlingerResponse={behandlinger} />
    </VStack>
  )
}
