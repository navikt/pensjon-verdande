import { BodyShort, Heading, HStack, Table, VStack } from '@navikt/ds-react'
import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/kravtype'
import LastNedTabData from './components/LastNedTabData'
import type { KravtypeAnalyseResponse } from './types'
import { formaterVarighet } from './utils/formattering'
import { parseAnalyseParams } from './utils/parseAnalyseParams'
import { useSortableTable } from './utils/useSortableTable'

export async function loader({ request }: Route.LoaderArgs) {
  const { params } = parseAnalyseParams(request)
  return await apiGet<KravtypeAnalyseResponse>(`/api/behandling/analyse/kravtype?${params}`, request)
}

export default function KravtypeTab({ loaderData }: Route.ComponentProps) {
  const data = loaderData
  const [searchParams] = useSearchParams()
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''

  const totalAntall = data.kravtyper.reduce((s, k) => s + k.antall, 0)

  const getValue = useCallback((item: (typeof data.kravtyper)[number], key: string) => {
    switch (key) {
      case 'kravGjelder':
        return item.kravGjelder
      case 'kravStatus':
        return item.kravStatus
      case 'antall':
        return item.antall
      case 'antallFullfort':
        return item.antallFullfort
      case 'antallFeilet':
        return item.antallFeilet
      case 'feilrate':
        return item.feilrate
      case 'gjennomsnittVarighetSekunder':
        return item.gjennomsnittVarighetSekunder
      default:
        return null
    }
  }, [])

  const { sort, handleSort, sorted } = useSortableTable(data.kravtyper, 'antall', 'descending', getValue)

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Kravtypeanalyse bryter ned behandlinger etter hva kravet gjelder og kravstatus. Identifiser hvilke kravtyper som
        gir flest feil eller lengst behandlingstid for målrettet forbedring.
      </BodyShort>

      <HStack gap="space-24" wrap>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {data.kravtyper.length}
          </Heading>
          <BodyShort size="small">Kombinasjoner</BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {totalAntall.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small">Totalt</BodyShort>
        </VStack>
      </HStack>

      {data.kravtyper.length > 0 && (
        <Table size="small" zebraStripes sort={sort} onSortChange={handleSort}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader sortable sortKey="kravGjelder">
                Krav gjelder
              </Table.ColumnHeader>
              <Table.ColumnHeader sortable sortKey="kravStatus">
                Kravstatus
              </Table.ColumnHeader>
              <Table.ColumnHeader sortable sortKey="antall" align="right">
                Antall
              </Table.ColumnHeader>
              <Table.ColumnHeader sortable sortKey="antallFullfort" align="right">
                Fullført
              </Table.ColumnHeader>
              <Table.ColumnHeader sortable sortKey="antallFeilet" align="right">
                Feilet
              </Table.ColumnHeader>
              <Table.ColumnHeader sortable sortKey="feilrate" align="right">
                Feilrate
              </Table.ColumnHeader>
              <Table.ColumnHeader sortable sortKey="gjennomsnittVarighetSekunder" align="right">
                Snitt varighet
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sorted.map((k) => (
              <Table.Row key={`${k.kravGjelder}-${k.kravStatus}`}>
                <Table.DataCell>{k.kravGjelder}</Table.DataCell>
                <Table.DataCell>{k.kravStatus}</Table.DataCell>
                <Table.DataCell align="right">{k.antall.toLocaleString('nb-NO')}</Table.DataCell>
                <Table.DataCell align="right">{k.antallFullfort.toLocaleString('nb-NO')}</Table.DataCell>
                <Table.DataCell align="right">{k.antallFeilet.toLocaleString('nb-NO')}</Table.DataCell>
                <Table.DataCell align="right">
                  {k.feilrate != null ? `${(k.feilrate * 100).toFixed(1)}%` : '–'}
                </Table.DataCell>
                <Table.DataCell align="right">{formaterVarighet(k.gjennomsnittVarighetSekunder)}</Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      <HStack justify="end">
        <LastNedTabData data={data.kravtyper} filnavn={`kravtype-${behandlingType}-${fom}-${tom}`} />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="kravtypedata" />
}
