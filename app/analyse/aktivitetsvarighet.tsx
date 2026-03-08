import { BodyShort, Box, Heading, HStack, Table, VStack } from '@navikt/ds-react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/aktivitetsvarighet'
import AktivitetsvarighetChart from './components/AktivitetsvarighetChart'
import LastNedTabData from './components/LastNedTabData'
import type { AktivitetsvarighetResponse } from './types'
import { parseAnalyseParams } from './utils/parseAnalyseParams'

export async function loader({ request }: Route.LoaderArgs) {
  const { params } = parseAnalyseParams(request)
  return await apiGet<AktivitetsvarighetResponse>(`/api/behandling/analyse/aktivitetsvarighet?${params}`, request)
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}t`
  return `${(seconds / 86400).toFixed(1)}d`
}

export default function AktivitetsvarighetTab({ loaderData }: Route.ComponentProps) {
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

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Flaskehalsanalyse viser gjennomsnittlig tidsbruk per aktivitetssteg i behandlingen. Identifiser de tregeste
        stegene for å finne optimaliseringsmuligheter. Andel av total viser hvor stor del av behandlingstiden hvert steg
        utgjør.
      </BodyShort>

      <HStack gap="space-24" wrap>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {formatDuration(totalSnitt)}
          </Heading>
          <BodyShort size="small">Sum snitt</BodyShort>
        </VStack>
        {tregestAktivitet && (
          <Box borderWidth="2" padding="space-16" borderRadius="4" borderColor="warning">
            <VStack gap="space-4">
              <BodyShort size="small" weight="semibold">
                Tregeste steg
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

      {data.aktiviteter.length > 0 && <AktivitetsvarighetChart data={data.aktiviteter} />}

      {data.aktiviteter.length > 0 && (
        <VStack gap="space-8">
          <Heading level="3" size="small">
            Varighetsdetaljer per aktivitetssteg
          </Heading>
          <Table size="small" zebraStripes>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Aktivitet</Table.HeaderCell>
                <Table.HeaderCell align="right">Antall</Table.HeaderCell>
                <Table.HeaderCell align="right">Snitt</Table.HeaderCell>
                <Table.HeaderCell align="right">Median</Table.HeaderCell>
                <Table.HeaderCell align="right">P90</Table.HeaderCell>
                <Table.HeaderCell align="right">P95</Table.HeaderCell>
                <Table.HeaderCell align="right">Min</Table.HeaderCell>
                <Table.HeaderCell align="right">Maks</Table.HeaderCell>
                <Table.HeaderCell align="right">Andel</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {[...data.aktiviteter]
                .sort((a, b) => b.gjennomsnittSekunder - a.gjennomsnittSekunder)
                .map((a) => (
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
        <LastNedTabData data={data.aktiviteter} filnavn={`aktivitetsvarighet-${behandlingType}-${fom}-${tom}`} />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="aktivitetsvarighetsdata" />
}
