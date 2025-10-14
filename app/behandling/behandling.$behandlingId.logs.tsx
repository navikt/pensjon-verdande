import { Alert, HStack, Loader, VStack } from '@navikt/ds-react'
import { Suspense } from 'react'
import { Await, type LoaderFunctionArgs, useAsyncError, useLoaderData } from 'react-router'
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

function LokiLogsError() {
  const errors = useAsyncError()

  console.error(errors)

  return (
    <Alert variant="error" size="small">
      Feil ved henting av logger. Dette kan skyldes tregt svar fra logg-tjenesten. Forsøk igjen senere
    </Alert>
  )
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
        <Await resolve={response} errorElement={<LokiLogsError />}>
          {(it) => (
            <LokiLogsTable
              response={it}
              initialFilters={selectedFilters}
              initialSelectedCols={selectedCols}
              start={start}
              slutt={slutt}
              tempoConfiguration={tempoConfiguration}
              visAlltidFullDato={true}
            />
          )}
        </Await>
      </Suspense>
    </VStack>
  )
}
