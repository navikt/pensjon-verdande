import { Alert, BodyShort, Heading, HStack, Table, VStack } from '@navikt/ds-react'
import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/feilanalyse'
import FeilTidsserieChart from './components/FeilTidsserieChart'
import LastNedTabData from './components/LastNedTabData'
import type { ExceptionTypeStatistikk, FeilAnalyseResponse, FeilklassifiseringResponse } from './types'
import { parseAnalyseParams } from './utils/parseAnalyseParams'
import { useSortableTable } from './utils/useSortableTable'

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const obj = err as Record<string, unknown>
    // react-router data() throws DataWithResponseInit with .data being NormalizedError
    if ('data' in obj && obj.data && typeof obj.data === 'object') {
      const d = obj.data as Record<string, unknown>
      const status = d.status ?? (obj.init as Record<string, unknown>)?.status ?? ''
      const msg = d.message ?? d.title ?? d.detail ?? ''
      return status ? `${status}: ${msg}` : String(msg)
    }
  }
  return err instanceof Error ? err.message : String(err)
}

export async function loader({ request }: Route.LoaderArgs) {
  const { params, paramsAgg } = parseAnalyseParams(request)
  const [feilResult, klassResult] = await Promise.allSettled([
    apiGet<FeilAnalyseResponse>(`/api/behandling/analyse/feil?${paramsAgg}`, request),
    apiGet<FeilklassifiseringResponse>(`/api/behandling/analyse/feilklassifisering?${params}`, request),
  ])
  const feil = feilResult.status === 'fulfilled' ? feilResult.value : null
  const klassifisering = klassResult.status === 'fulfilled' ? klassResult.value : null
  const feilError = feilResult.status === 'rejected' ? feilResult.reason : undefined
  const klassError = klassResult.status === 'rejected' ? klassResult.reason : undefined
  if (!feil && !klassifisering) {
    throw feilError ?? klassError ?? new Error('Kunne ikke hente feilanalysedata')
  }
  return {
    feil,
    klassifisering,
    feilError: feilError ? extractErrorMessage(feilError) : null,
    klassError: klassError ? extractErrorMessage(klassError) : null,
  }
}

export default function FeilanalyseTab({ loaderData }: Route.ComponentProps) {
  const { feil, klassifisering, feilError, klassError } = loaderData
  const [searchParams] = useSearchParams()
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''

  const getFeilValue = useCallback((item: FeilAnalyseResponse['toppFeilmeldinger'][number], key: string) => {
    switch (key) {
      case 'feilmelding':
        return item.feilmelding
      case 'antall':
        return item.antall
      case 'sisteOpptreden':
        return item.sisteOpptreden
      default:
        return null
    }
  }, [])

  const getKlassifiseringValue = useCallback((item: ExceptionTypeStatistikk, key: string) => {
    switch (key) {
      case 'exceptionType':
        return item.exceptionType
      case 'antall':
        return item.antall
      case 'sisteOpptreden':
        return item.sisteOpptreden
      case 'eksempelMelding':
        return item.eksempelMelding
      default:
        return null
    }
  }, [])

  const {
    sort: feilSort,
    handleSort: handleFeilSort,
    sorted: sortedFeil,
  } = useSortableTable(feil?.toppFeilmeldinger ?? [], 'antall', 'descending', getFeilValue)
  const {
    sort: klassSort,
    handleSort: handleKlassSort,
    sorted: sortedKlass,
  } = useSortableTable(klassifisering?.exceptionTyper ?? [], 'antall', 'descending', getKlassifiseringValue)

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Oversikt over feilmeldinger og feilklassifisering fra kjøringer. Tabellene viser de mest frekvente
        feilmeldingene og feilkategorier gruppert etter exception-type. Diagrammet viser feiltrend over tid.
      </BodyShort>

      {feilError && (
        <Alert variant="warning" size="small">
          Kunne ikke hente feilmeldingsdata: {feilError}
        </Alert>
      )}
      {klassError && (
        <Alert variant="warning" size="small">
          Kunne ikke hente feilklassifiseringsdata: {klassError}
        </Alert>
      )}

      <HStack gap="space-24" wrap>
        {feil && (
          <VStack gap="space-4" align="center" style={{ minWidth: '120px' }}>
            <Heading level="3" size="large">
              {feil.totaltFeiledeKjoringer.toLocaleString('nb-NO')}
            </Heading>
            <BodyShort size="small" weight="semibold">
              Feilede kjøringer totalt
            </BodyShort>
          </VStack>
        )}
        {feil && (
          <VStack gap="space-4" align="center" style={{ minWidth: '120px' }}>
            <Heading level="3" size="large">
              {feil.toppFeilmeldinger.length}
            </Heading>
            <BodyShort size="small">Unike feilmeldinger</BodyShort>
          </VStack>
        )}
        {klassifisering && (
          <VStack gap="space-4" align="center" style={{ minWidth: '120px' }}>
            <Heading level="3" size="large">
              {klassifisering.exceptionTyper.length}
            </Heading>
            <BodyShort size="small">Feilklasser</BodyShort>
          </VStack>
        )}
      </HStack>

      {sortedFeil.length > 0 && (
        <VStack gap="space-8">
          <Heading level="3" size="small">
            Topp feilmeldinger
          </Heading>
          <Table size="small" zebraStripes sort={feilSort} onSortChange={handleFeilSort}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>#</Table.HeaderCell>
                <Table.ColumnHeader sortable sortKey="feilmelding">
                  Feilmelding
                </Table.ColumnHeader>
                <Table.ColumnHeader sortable sortKey="antall" align="right">
                  Antall
                </Table.ColumnHeader>
                <Table.ColumnHeader sortable sortKey="sisteOpptreden">
                  Sist sett
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sortedFeil.map((feilItem, idx) => (
                <Table.Row key={feilItem.feilmelding}>
                  <Table.DataCell>{idx + 1}</Table.DataCell>
                  <Table.DataCell>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85em', wordBreak: 'break-word' }}>
                      {feilItem.feilmelding}
                    </span>
                  </Table.DataCell>
                  <Table.DataCell align="right">{feilItem.antall.toLocaleString('nb-NO')}</Table.DataCell>
                  <Table.DataCell>{feilItem.sisteOpptreden.replace('T', ' ').substring(0, 16)}</Table.DataCell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </VStack>
      )}

      {feil && <FeilTidsserieChart data={feil.datapunkter} />}

      {sortedKlass.length > 0 && (
        <VStack gap="space-8">
          <Heading level="3" size="small">
            Feilklassifisering etter exception-type
          </Heading>
          <BodyShort size="small" textColor="subtle">
            Feil gruppert etter exception-type fra stack trace — nyttig for å prioritere feilretting og identifisere
            systemiske problemer.
          </BodyShort>
          <Table size="small" zebraStripes sort={klassSort} onSortChange={handleKlassSort}>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader sortable sortKey="exceptionType">
                  Exception-type
                </Table.ColumnHeader>
                <Table.ColumnHeader sortable sortKey="antall" align="right">
                  Antall
                </Table.ColumnHeader>
                <Table.ColumnHeader sortable sortKey="sisteOpptreden">
                  Siste opptreden
                </Table.ColumnHeader>
                <Table.ColumnHeader sortable sortKey="eksempelMelding">
                  Eksempel
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sortedKlass.map((e) => (
                <Table.Row key={e.exceptionType}>
                  <Table.DataCell>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>{e.exceptionType}</span>
                  </Table.DataCell>
                  <Table.DataCell align="right">{e.antall.toLocaleString('nb-NO')}</Table.DataCell>
                  <Table.DataCell>{e.sisteOpptreden.replace('T', ' ').substring(0, 16)}</Table.DataCell>
                  <Table.DataCell>
                    {e.eksempelMelding && (
                      <span
                        style={{
                          fontSize: '0.85em',
                          maxWidth: '400px',
                          display: 'inline-block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={e.eksempelMelding}
                      >
                        {e.eksempelMelding}
                      </span>
                    )}
                  </Table.DataCell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </VStack>
      )}

      <HStack justify="end">
        <LastNedTabData
          data={[
            ...(feil?.toppFeilmeldinger ?? []),
            ...(feil?.datapunkter ?? []),
            ...(klassifisering?.exceptionTyper ?? []),
          ]}
          filnavn={`feilanalyse-${behandlingType}-${fom}-${tom}`}
        />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="feilanalysedata" />
}
