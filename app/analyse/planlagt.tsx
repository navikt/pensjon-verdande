import { BodyShort, Heading, HStack, Table, VStack } from '@navikt/ds-react'
import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/planlagt'
import LastNedTabData from './components/LastNedTabData'
import type { PlanlagtAnalyseResponse, PlanlagtDatapunkt } from './types'
import { formaterVarighet } from './utils/formattering'
import { parseAnalyseParams } from './utils/parseAnalyseParams'
import { useSortableTable } from './utils/useSortableTable'

export async function loader({ request }: Route.LoaderArgs) {
  const { paramsAgg } = parseAnalyseParams(request)
  return await apiGet<PlanlagtAnalyseResponse>(`/api/behandling/analyse/planlagt?${paramsAgg}`, request)
}

export default function PlanlagtTab({ loaderData }: Route.ComponentProps) {
  const data = loaderData
  const [searchParams] = useSearchParams()
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''

  const totalt = data.antallMedPlanlagt + data.antallUtenPlanlagt
  const planlagtAndel = totalt > 0 ? `${((data.antallMedPlanlagt / totalt) * 100).toFixed(1)}%` : '–'

  const getValue = useCallback((item: PlanlagtDatapunkt, key: string) => {
    switch (key) {
      case 'periodeFra':
        return item.periodeFra
      case 'antallPlanlagt':
        return item.antallPlanlagt
      case 'antallIkkePlanlagt':
        return item.antallIkkePlanlagt
      case 'gjennomsnittForsinkelseSekunder':
        return item.gjennomsnittForsinkelseSekunder
      default:
        return null
    }
  }, [])

  const { sort, handleSort, sorted } = useSortableTable(data.datapunkter, 'periodeFra', 'ascending', getValue)

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Planleggingsanalyse viser forskjellen mellom planlagt starttidspunkt og faktisk opprettelse. Positiv forsinkelse
        betyr at behandlingen startet senere enn planlagt. Viser også andelen behandlinger med planlagt start.
      </BodyShort>

      <HStack gap="space-24" wrap>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {data.antallMedPlanlagt.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small">Med planlagt start</BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {planlagtAndel}
          </Heading>
          <BodyShort size="small">Andel planlagt</BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '120px' }}>
          <Heading level="3" size="large">
            {formaterVarighet(data.gjennomsnittForsinkelseSekunder)}
          </Heading>
          <BodyShort size="small">Snitt forsinkelse</BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '120px' }}>
          <Heading level="3" size="large">
            {formaterVarighet(data.medianForsinkelseSekunder)}
          </Heading>
          <BodyShort size="small">Median forsinkelse</BodyShort>
        </VStack>
      </HStack>

      {data.datapunkter.length > 0 && (
        <VStack gap="space-8">
          <Heading level="3" size="small">
            Planlegging over tid
          </Heading>
          <Table size="small" zebraStripes sort={sort} onSortChange={handleSort}>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader sortable sortKey="periodeFra">
                  Periode
                </Table.ColumnHeader>
                <Table.ColumnHeader sortable sortKey="antallPlanlagt" align="right">
                  Planlagt
                </Table.ColumnHeader>
                <Table.ColumnHeader sortable sortKey="antallIkkePlanlagt" align="right">
                  Ikke planlagt
                </Table.ColumnHeader>
                <Table.ColumnHeader sortable sortKey="gjennomsnittForsinkelseSekunder" align="right">
                  Snitt forsinkelse
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sorted.map((d) => (
                <Table.Row key={d.periodeFra}>
                  <Table.DataCell>{d.periodeFra}</Table.DataCell>
                  <Table.DataCell align="right">{d.antallPlanlagt.toLocaleString('nb-NO')}</Table.DataCell>
                  <Table.DataCell align="right">{d.antallIkkePlanlagt.toLocaleString('nb-NO')}</Table.DataCell>
                  <Table.DataCell align="right">{formaterVarighet(d.gjennomsnittForsinkelseSekunder)}</Table.DataCell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </VStack>
      )}

      <HStack justify="end">
        <LastNedTabData data={data.datapunkter} filnavn={`planlagt-${behandlingType}-${fom}-${tom}`} />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="planleggingsdata" />
}
