import { BodyShort, Heading, HStack, Table, VStack } from '@navikt/ds-react'
import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/sakstype'
import LastNedTabData from './components/LastNedTabData'
import type { SakstypeAnalyseResponse, SakstypeStatistikk } from './types'
import { formaterVarighet } from './utils/formattering'
import { parseAnalyseParams } from './utils/parseAnalyseParams'
import { useSortableTable } from './utils/useSortableTable'

export async function loader({ request }: Route.LoaderArgs) {
  const { params } = parseAnalyseParams(request)
  return await apiGet<SakstypeAnalyseResponse>(`/api/behandling/analyse/sakstype?${params}`, request)
}

export default function SakstypeTab({ loaderData }: Route.ComponentProps) {
  const data = loaderData
  const [searchParams] = useSearchParams()
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''

  const totalAntall = data.sakstyper.reduce((s, t) => s + t.antall, 0)

  const getValue = useCallback((item: SakstypeStatistikk, key: string): number | string | null => {
    switch (key) {
      case 'sakstype':
        return item.sakstype
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

  const { sort, handleSort, sorted } = useSortableTable(data.sakstyper, 'antall', 'descending', getValue)

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Sakstypefordeling viser ytelse per pensjonstype (alderspensjon, uføretrygd, gjenlevendepensjon osv.).
        Identifiser hvilke sakstyper som har høyest feilrate eller lengst behandlingstid.
      </BodyShort>

      <HStack gap="space-24" wrap>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {data.sakstyper.length}
          </Heading>
          <BodyShort size="small">Sakstyper</BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {totalAntall.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small">Totalt</BodyShort>
        </VStack>
      </HStack>

      {data.sakstyper.length > 0 && (
        <Table size="small" zebraStripes sort={sort} onSortChange={handleSort}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader sortable sortKey="sakstype">
                Sakstype
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
            {sorted.map((s) => (
              <Table.Row key={s.sakstype}>
                <Table.DataCell>{s.sakstype}</Table.DataCell>
                <Table.DataCell align="right">{s.antall.toLocaleString('nb-NO')}</Table.DataCell>
                <Table.DataCell align="right">{s.antallFullfort.toLocaleString('nb-NO')}</Table.DataCell>
                <Table.DataCell align="right">{s.antallFeilet.toLocaleString('nb-NO')}</Table.DataCell>
                <Table.DataCell align="right">
                  {s.feilrate != null ? `${(s.feilrate * 100).toFixed(1)}%` : '–'}
                </Table.DataCell>
                <Table.DataCell align="right">{formaterVarighet(s.gjennomsnittVarighetSekunder)}</Table.DataCell>
                <Table.DataCell align="right">{formaterVarighet(s.medianVarighetSekunder)}</Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      <HStack justify="end">
        <LastNedTabData data={data.sakstyper} filnavn={`sakstype-${behandlingType}-${fom}-${tom}`} />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="sakstypedata" />
}
