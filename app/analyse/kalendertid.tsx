import { BodyShort, Box, Heading, HStack, Table, VStack } from '@navikt/ds-react'
import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/kalendertid'
import AktivitetsvarighetChart from './components/AktivitetsvarighetChart'
import LastNedTabData from './components/LastNedTabData'
import type { AktivitetKalendertidResponse, AktivitetKalendertidStatistikk } from './types'
import { parseAnalyseParams } from './utils/parseAnalyseParams'
import { useSortableTable } from './utils/useSortableTable'

export async function loader({ request }: Route.LoaderArgs) {
  const { params } = parseAnalyseParams(request)
  return await apiGet<AktivitetKalendertidResponse>(`/api/behandling/analyse/aktivitet-kalendertid?${params}`, request)
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}t`
  return `${(seconds / 86400).toFixed(1)}d`
}

export default function KalendertidTab({ loaderData }: Route.ComponentProps) {
  const data = loaderData
  const [searchParams] = useSearchParams()
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''

  const totalSnitt = data.aktiviteter.reduce((sum, a) => sum + a.gjennomsnittSekunder, 0)
  const tregestAktivitet =
    data.aktiviteter.length > 0
      ? [...data.aktiviteter].sort((a, b) => b.gjennomsnittSekunder - a.gjennomsnittSekunder)[0]
      : null

  const getValue = useCallback((item: AktivitetKalendertidStatistikk, key: string): number | string | null => {
    switch (key) {
      case 'aktivitetType':
        return item.aktivitetType
      case 'antall':
        return item.antall
      case 'gjennomsnittSekunder':
        return item.gjennomsnittSekunder
      case 'medianSekunder':
        return item.medianSekunder
      case 'p90Sekunder':
        return item.p90Sekunder
      case 'p95Sekunder':
        return item.p95Sekunder
      case 'minSekunder':
        return item.minSekunder
      case 'maxSekunder':
        return item.maxSekunder
      case 'andelAvTotal':
        return item.andelAvTotal
      default:
        return null
    }
  }, [])

  const { sort, handleSort, sorted } = useSortableTable(
    data.aktiviteter,
    'gjennomsnittSekunder',
    'descending',
    getValue,
  )

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Kalendertid viser total ventetid fra en aktivitet opprettes til siste kjøring er fullført, inkludert pauser,
        ventetid og gjenforsøk. Til forskjell fra flaskehalsanalysen (som viser ren prosesseringstid) gir dette et bilde
        av den reelle kalendertiden en aktivitet tar.
      </BodyShort>

      <HStack gap="space-24" wrap>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {formatDuration(totalSnitt)}
          </Heading>
          <BodyShort size="small">Sum snitt kalendertid</BodyShort>
        </VStack>
        {tregestAktivitet && (
          <Box borderWidth="2" padding="space-16" borderRadius="4" borderColor="warning">
            <VStack gap="space-4">
              <BodyShort size="small" weight="semibold">
                Lengst kalendertid
              </BodyShort>
              <BodyShort size="small" style={{ fontFamily: 'monospace' }}>
                {tregestAktivitet.aktivitetType}
              </BodyShort>
              <Heading level="3" size="medium">
                {formatDuration(tregestAktivitet.gjennomsnittSekunder)}
                {tregestAktivitet.andelAvTotal != null && (
                  <span style={{ fontSize: '0.7em', marginLeft: 8, color: 'var(--ax-text-subtle)' }}>
                    ({(tregestAktivitet.andelAvTotal * 100).toFixed(0)}%)
                  </span>
                )}
              </Heading>
            </VStack>
          </Box>
        )}
      </HStack>

      {data.aktiviteter.length > 0 && (
        <AktivitetsvarighetChart
          data={data.aktiviteter}
          title="Kalendertid per aktivitetssteg"
          ariaLabel="Horisontalt søylediagram: Kalendertid per aktivitetssteg"
          xAxisLabel="Tid"
        />
      )}

      {data.aktiviteter.length > 0 && (
        <VStack gap="space-8">
          <Heading level="3" size="small">
            Kalendertid per aktivitetssteg
          </Heading>
          <Table size="small" zebraStripes sort={sort} onSortChange={handleSort}>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader sortable sortKey="aktivitetType">
                  Aktivitet
                </Table.ColumnHeader>
                <Table.ColumnHeader sortable sortKey="antall" align="right">
                  Antall
                </Table.ColumnHeader>
                <Table.ColumnHeader sortable sortKey="gjennomsnittSekunder" align="right">
                  Snitt
                </Table.ColumnHeader>
                <Table.ColumnHeader sortable sortKey="medianSekunder" align="right">
                  Median
                </Table.ColumnHeader>
                <Table.ColumnHeader sortable sortKey="p90Sekunder" align="right">
                  P90
                </Table.ColumnHeader>
                <Table.ColumnHeader sortable sortKey="p95Sekunder" align="right">
                  P95
                </Table.ColumnHeader>
                <Table.ColumnHeader sortable sortKey="minSekunder" align="right">
                  Min
                </Table.ColumnHeader>
                <Table.ColumnHeader sortable sortKey="maxSekunder" align="right">
                  Maks
                </Table.ColumnHeader>
                <Table.ColumnHeader sortable sortKey="andelAvTotal" align="right">
                  Andel
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sorted.map((a) => (
                <Table.Row key={a.aktivitetType}>
                  <Table.DataCell>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>{a.aktivitetType}</span>
                  </Table.DataCell>
                  <Table.DataCell align="right">{a.antall.toLocaleString('nb-NO')}</Table.DataCell>
                  <Table.DataCell align="right">{formatDuration(a.gjennomsnittSekunder)}</Table.DataCell>
                  <Table.DataCell align="right">{formatDuration(a.medianSekunder)}</Table.DataCell>
                  <Table.DataCell align="right">{formatDuration(a.p90Sekunder)}</Table.DataCell>
                  <Table.DataCell align="right">{formatDuration(a.p95Sekunder)}</Table.DataCell>
                  <Table.DataCell align="right">{formatDuration(a.minSekunder)}</Table.DataCell>
                  <Table.DataCell align="right">{formatDuration(a.maxSekunder)}</Table.DataCell>
                  <Table.DataCell align="right">
                    {a.andelAvTotal != null ? `${(a.andelAvTotal * 100).toFixed(1)}%` : '–'}
                  </Table.DataCell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </VStack>
      )}

      <HStack justify="end">
        <LastNedTabData data={data.aktiviteter} filnavn={`kalendertid-${behandlingType}-${fom}-${tom}`} />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="kalendertidsdata" />
}
