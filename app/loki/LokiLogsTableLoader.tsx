import { Alert, HStack, Loader } from '@navikt/ds-react'
import type React from 'react'
import { Suspense } from 'react'
import { Await } from 'react-router'
import LokiLogsTable from '~/loki/LokiLogsTable'
import type { LokiInstantQueryResponse } from '~/loki/loki-query-types'
import type { TempoConfiguration } from '~/loki/utils'

function LokiLogsError() {
  return (
    <Alert variant="error" size="small">
      Feil ved henting av logger. Dette kan skyldes tregt svar fra logg-tjenesten. Forsøk igjen senere
    </Alert>
  )
}

export function LokiLogsTableLoader({
  selectedFilters,
  selectedColumns,
  response,
  start,
  slutt,
  setShareUrl,
  tempoConfiguration,
  visAlltidFullDato,
}: {
  selectedFilters: { key: string; value: string; mode: 'in' | 'out' }[]
  selectedColumns: string[]
  response: Promise<LokiInstantQueryResponse>
  start: string
  slutt: string
  setShareUrl?: React.Dispatch<React.SetStateAction<string>> | undefined
  tempoConfiguration?: TempoConfiguration | null
  visAlltidFullDato?: boolean | null
}) {
  return (
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
            initialSelectedCols={selectedColumns}
            setShareUrl={setShareUrl}
            start={start}
            slutt={slutt}
            tempoConfiguration={tempoConfiguration}
            visAlltidFullDato={visAlltidFullDato}
          />
        )}
      </Await>
    </Suspense>
  )
}
