import { BodyShort, Heading, HStack, Table, VStack } from '@navikt/ds-react'
import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/vedtakstype'
import LastNedTabData from './components/LastNedTabData'
import type { VedtakstypeAnalyseResponse } from './types'
import { parseAnalyseParams } from './utils/parseAnalyseParams'
import { useSortableTable } from './utils/useSortableTable'

export async function loader({ request }: Route.LoaderArgs) {
  const { params } = parseAnalyseParams(request)
  return await apiGet<VedtakstypeAnalyseResponse>(`/api/behandling/analyse/vedtakstype?${params}`, request)
}

export default function VedtakstypeTab({ loaderData }: Route.ComponentProps) {
  const data = loaderData
  const [searchParams] = useSearchParams()
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''

  const totalAntall = data.vedtakstyper.reduce((s, v) => s + v.antall, 0)

  const getValue = useCallback((item: (typeof data.vedtakstyper)[number], key: string) => {
    switch (key) {
      case 'vedtakType':
        return item.vedtakType
      case 'vedtakStatus':
        return item.vedtakStatus
      case 'antall':
        return item.antall
      case 'gjennomsnittDagerTilIverksatt':
        return item.gjennomsnittDagerTilIverksatt
      default:
        return null
    }
  }, [])

  const { sort, handleSort, sorted } = useSortableTable(data.vedtakstyper, 'antall', 'descending', getValue)

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Vedtakstypeanalyse viser fordeling av vedtakstyper og -status for behandlinger som har resultert i vedtak.
        Inkluderer gjennomsnittlig tid fra vedtaksdato til iverksetting.
      </BodyShort>

      <HStack gap="space-24" wrap>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {totalAntall.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small">Vedtak totalt</BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {data.vedtakstyper.length}
          </Heading>
          <BodyShort size="small">Kombinasjoner</BodyShort>
        </VStack>
      </HStack>

      {data.vedtakstyper.length > 0 && (
        <Table size="small" zebraStripes sort={sort} onSortChange={handleSort}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader sortable sortKey="vedtakType">
                Vedtakstype
              </Table.ColumnHeader>
              <Table.ColumnHeader sortable sortKey="vedtakStatus">
                Vedtakstatus
              </Table.ColumnHeader>
              <Table.ColumnHeader sortable sortKey="antall" align="right">
                Antall
              </Table.ColumnHeader>
              <Table.ColumnHeader sortable sortKey="gjennomsnittDagerTilIverksatt" align="right">
                Snitt dager til iverksatt
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sorted.map((v) => (
              <Table.Row key={`${v.vedtakType}-${v.vedtakStatus}`}>
                <Table.DataCell>{v.vedtakType}</Table.DataCell>
                <Table.DataCell>{v.vedtakStatus}</Table.DataCell>
                <Table.DataCell align="right">{v.antall.toLocaleString('nb-NO')}</Table.DataCell>
                <Table.DataCell align="right">
                  {v.gjennomsnittDagerTilIverksatt != null ? v.gjennomsnittDagerTilIverksatt.toFixed(1) : '–'}
                </Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      <HStack justify="end">
        <LastNedTabData data={data.vedtakstyper} filnavn={`vedtakstype-${behandlingType}-${fom}-${tom}`} />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="vedtakstypedata" />
}
