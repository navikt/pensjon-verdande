import { VStack } from '@navikt/ds-react'
import invariant from 'tiny-invariant'
import { selectedColumns, selectedFilters } from '~/loki/LokiLogsTable'
import { LokiLogsTableLoader } from '~/loki/LokiLogsTableLoader'
import { fetchPenLogs, tempoConfiguration } from '~/loki/loki.server'
import { apiGet } from '~/services/api.server'
import type { BehandlingDto } from '~/types'
import type { Route } from './+types/behandling.$behandlingId.logs'

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const { behandlingId } = params

  invariant(behandlingId, 'Missing behandlingId param')

  const behandling = await apiGet<BehandlingDto>(`/api/behandling/${behandlingId}`, request)

  return {
    response: fetchPenLogs(behandling.opprettet, behandling.sisteKjoring, {
      behandlingId: behandling.behandlingId,
    }),
    selectedColumns: selectedColumns(request.url),
    selectedFilters: selectedFilters(request.url),
    start: behandling.opprettet,
    slutt: behandling.sisteKjoring,
    tempoConfiguration: tempoConfiguration,
  }
}

export default function BehandlingLogs({ loaderData }: Route.ComponentProps) {
  const { response, selectedColumns, selectedFilters, start, slutt, tempoConfiguration } = loaderData

  return (
    <VStack gap="space-24">
      <LokiLogsTableLoader
        response={response}
        selectedFilters={selectedFilters}
        selectedColumns={selectedColumns}
        start={start}
        slutt={slutt}
        tempoConfiguration={tempoConfiguration}
        visAlltidFullDato={true}
      ></LokiLogsTableLoader>
    </VStack>
  )
}
