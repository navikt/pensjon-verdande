import { HStack, Loader, VStack } from '@navikt/ds-react'
import { Suspense } from 'react'
import { Await, type LoaderFunctionArgs, useLoaderData } from 'react-router'
import invariant from 'tiny-invariant'
import LokiLogsTable, { selectedColumns, selectedFilters } from '~/loki/LokiLogsTable'
import { fetchPenLogs, tempoConfiguration } from '~/loki/loki.server'
import { apiGet } from '~/services/api.server'
import type { BehandlingDto } from '~/types'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { behandlingId } = params

  invariant(behandlingId, 'Missing behandlingId param')

  const behandling = await apiGet<BehandlingDto>(`/api/behandling/${behandlingId}`, request)

  return {
    response: fetchPenLogs(behandling.opprettet, behandling.sisteKjoring, {
      behandlingId: behandling.behandlingId,
    }),
    selectedCols: selectedColumns(request.url),
    selectedFilters: selectedFilters(request.url),
    start: behandling.opprettet,
    slutt: behandling.sisteKjoring,
    tempoConfiguration: tempoConfiguration,
  }
}

export default function BehandlingLogs() {
  const { response, selectedCols, selectedFilters, start, slutt, tempoConfiguration } = useLoaderData<typeof loader>()

  return (
    <VStack gap="6" className="p-4">
      <Suspense
        fallback={
          <HStack justify="center">
            <Loader size="3xlarge" title="Laster inn logger..." />
          </HStack>
        }
      >
        <Await resolve={response}>
          {(it) => (
            <LokiLogsTable
              response={it}
              initialFilters={selectedFilters}
              initialSelectedCols={selectedCols}
              start={start}
              slutt={slutt}
              tempoConfiguration={tempoConfiguration}
            />
          )}
        </Await>
      </Suspense>
    </VStack>
  )
}
