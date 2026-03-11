import { BodyShort, HStack, Table, VStack } from '@navikt/ds-react'
import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/prioritet'
import LastNedTabData from './components/LastNedTabData'
import type { PrioritetAnalyseResponse, PrioritetStatistikk } from './types'
import { formaterVarighet } from './utils/formattering'
import { parseAnalyseParams } from './utils/parseAnalyseParams'
import { useSortableTable } from './utils/useSortableTable'

export async function loader({ request }: Route.LoaderArgs) {
  const { params } = parseAnalyseParams(request)
  return await apiGet<PrioritetAnalyseResponse>(`/api/behandling/analyse/prioritet?${params}`, request)
}

export default function PrioritetTab({ loaderData }: Route.ComponentProps) {
  const data = loaderData
  const [searchParams] = useSearchParams()
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''

  const getValue = useCallback((item: PrioritetStatistikk, key: string): number | string | null => {
    switch (key) {
      case 'prioritet':
        return item.prioritet
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
      case 'medianVarighetSekunder':
        return item.medianVarighetSekunder
      default:
        return null
    }
  }, [])

  const { sort, handleSort, sorted } = useSortableTable(data.prioriteter, 'antall', 'descending', getValue)

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Prioritetsanalyse viser om prioritet faktisk påvirker behandlingstid og utfall. Sammenlign varighet og feilrate
        per prioritetsnivå for å verifisere at høyt prioriterte behandlinger faktisk behandles raskere.
      </BodyShort>

      {data.prioriteter.length > 0 && (
        <Table size="small" zebraStripes sort={sort} onSortChange={handleSort}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader sortable sortKey="prioritet">
                Prioritet
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
              <Table.ColumnHeader sortable sortKey="medianVarighetSekunder" align="right">
                Median varighet
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sorted.map((p) => (
              <Table.Row key={p.prioritet}>
                <Table.DataCell>{p.prioritet}</Table.DataCell>
                <Table.DataCell align="right">{p.antall.toLocaleString('nb-NO')}</Table.DataCell>
                <Table.DataCell align="right">{p.antallFullfort.toLocaleString('nb-NO')}</Table.DataCell>
                <Table.DataCell align="right">{p.antallFeilet.toLocaleString('nb-NO')}</Table.DataCell>
                <Table.DataCell align="right">
                  {p.feilrate != null ? `${(p.feilrate * 100).toFixed(1)}%` : '–'}
                </Table.DataCell>
                <Table.DataCell align="right">{formaterVarighet(p.gjennomsnittVarighetSekunder)}</Table.DataCell>
                <Table.DataCell align="right">{formaterVarighet(p.medianVarighetSekunder)}</Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      <HStack justify="end">
        <LastNedTabData data={data.prioriteter} filnavn={`prioritet-${behandlingType}-${fom}-${tom}`} />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="prioritetsdata" />
}
