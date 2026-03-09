import { BodyShort, Heading, HStack, Table, VStack } from '@navikt/ds-react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/planlagt'
import LastNedTabData from './components/LastNedTabData'
import type { PlanlagtAnalyseResponse } from './types'
import { formaterVarighet } from './utils/formattering'
import { parseAnalyseParams } from './utils/parseAnalyseParams'

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
          <Table size="small" zebraStripes>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Periode</Table.HeaderCell>
                <Table.HeaderCell align="right">Planlagt</Table.HeaderCell>
                <Table.HeaderCell align="right">Ikke planlagt</Table.HeaderCell>
                <Table.HeaderCell align="right">Snitt forsinkelse</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.datapunkter.map((d) => (
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
