import { BodyShort, Heading, HStack, Table, VStack } from '@navikt/ds-react'
import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/gjenforsok'
import GjenforsokFordelingChart from './components/GjenforsokFordelingChart'
import LastNedTabData from './components/LastNedTabData'
import type { GjenforsokAnalyseResponse } from './types'
import { parseAnalyseParams } from './utils/parseAnalyseParams'
import { useSortableTable } from './utils/useSortableTable'

export async function loader({ request }: Route.LoaderArgs) {
  const { params } = parseAnalyseParams(request)
  return await apiGet<GjenforsokAnalyseResponse>(`/api/behandling/analyse/gjenforsok?${params}`, request)
}

export default function GjenforsokTab({ loaderData }: Route.ComponentProps) {
  const data = loaderData
  const [searchParams] = useSearchParams()
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''

  const totalMedRetry = data.aktiviteter.reduce((sum, a) => sum + a.antallMedRetry, 0)
  const totalAktiviteter = data.aktiviteter.reduce((sum, a) => sum + a.antallAktiviteter, 0)
  const retryProsent = totalAktiviteter > 0 ? `${((totalMedRetry / totalAktiviteter) * 100).toFixed(1)}%` : '–'

  const getValue = useCallback((item: GjenforsokAnalyseResponse['aktiviteter'][number], key: string) => {
    switch (key) {
      case 'aktivitetType':
        return item.aktivitetType
      case 'antallAktiviteter':
        return item.antallAktiviteter
      case 'gjennomsnittKjoringer':
        return item.gjennomsnittKjoringer
      case 'maxKjoringer':
        return item.maxKjoringer
      case 'antallMedRetry':
        return item.antallMedRetry
      case 'retryRate':
        return item.retryRate ?? null
      case 'suksessEtterRetryRate':
        return item.suksessEtterRetryRate ?? null
      default:
        return null
    }
  }, [])

  const { sort, handleSort, sorted } = useSortableTable(data.aktiviteter, 'antallMedRetry', 'descending', getValue)

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Gjenforsøksanalyse viser hvor ofte aktiviteter må kjøres flere ganger for å fullføres. Høy retry-rate kan
        indikere ustabile integrasjoner, datakvalitetsproblemer eller for aggressive retry-strategier.
      </BodyShort>

      <HStack gap="space-24" wrap>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {retryProsent}
          </Heading>
          <BodyShort size="small">Retry-rate</BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {totalMedRetry.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small">Med retry</BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {totalAktiviteter.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small">Totalt aktiviteter</BodyShort>
        </VStack>
      </HStack>

      {data.aktiviteter.length > 0 && (
        <VStack gap="space-8">
          <Heading level="3" size="small">
            Retry-statistikk per aktivitetstype
          </Heading>
          <Table size="small" zebraStripes sort={sort} onSortChange={handleSort}>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader sortable sortKey="aktivitetType">
                  Aktivitet
                </Table.ColumnHeader>
                <Table.ColumnHeader sortable sortKey="antallAktiviteter" align="right">
                  Antall
                </Table.ColumnHeader>
                <Table.ColumnHeader sortable sortKey="gjennomsnittKjoringer" align="right">
                  Snitt kjøringer
                </Table.ColumnHeader>
                <Table.ColumnHeader sortable sortKey="maxKjoringer" align="right">
                  Maks
                </Table.ColumnHeader>
                <Table.ColumnHeader sortable sortKey="antallMedRetry" align="right">
                  Med retry
                </Table.ColumnHeader>
                <Table.ColumnHeader sortable sortKey="retryRate" align="right">
                  Retry-rate
                </Table.ColumnHeader>
                <Table.ColumnHeader sortable sortKey="suksessEtterRetryRate" align="right">
                  Fullført etter retry
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sorted.map((a) => (
                <Table.Row key={a.aktivitetType}>
                  <Table.DataCell>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>{a.aktivitetType}</span>
                  </Table.DataCell>
                  <Table.DataCell align="right">{a.antallAktiviteter.toLocaleString('nb-NO')}</Table.DataCell>
                  <Table.DataCell align="right">{a.gjennomsnittKjoringer.toFixed(2)}</Table.DataCell>
                  <Table.DataCell align="right">{a.maxKjoringer}</Table.DataCell>
                  <Table.DataCell align="right">{a.antallMedRetry.toLocaleString('nb-NO')}</Table.DataCell>
                  <Table.DataCell align="right">
                    {a.retryRate != null ? `${(a.retryRate * 100).toFixed(1)}%` : '–'}
                  </Table.DataCell>
                  <Table.DataCell align="right">
                    {a.suksessEtterRetryRate != null ? `${(a.suksessEtterRetryRate * 100).toFixed(1)}%` : '–'}
                  </Table.DataCell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </VStack>
      )}

      {data.fordeling.length > 0 && (
        <VStack gap="space-8">
          <Heading level="3" size="small">
            Fordeling av antall kjøringer
          </Heading>
          <BodyShort size="small" textColor="subtle">
            Hvor mange aktiviteter trengte 1 kjøring, 2 kjøringer, osv.
          </BodyShort>
          <GjenforsokFordelingChart data={data.fordeling} />
        </VStack>
      )}

      <HStack justify="end">
        <LastNedTabData
          data={[...data.aktiviteter, ...data.fordeling]}
          filnavn={`gjenforsok-${behandlingType}-${fom}-${tom}`}
        />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="gjenforsøksdata" />
}
