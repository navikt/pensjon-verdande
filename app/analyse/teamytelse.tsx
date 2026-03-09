import { BodyShort, Heading, HStack, Table, VStack } from '@navikt/ds-react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/teamytelse'
import LastNedTabData from './components/LastNedTabData'
import type { TeamytelseResponse } from './types'
import { formaterVarighet } from './utils/formattering'
import { parseAnalyseParams } from './utils/parseAnalyseParams'

export async function loader({ request }: Route.LoaderArgs) {
  const { params } = parseAnalyseParams(request)
  return await apiGet<TeamytelseResponse>(`/api/behandling/analyse/teamytelse?${params}`, request)
}

export default function TeamytelseTab({ loaderData }: Route.ComponentProps) {
  const data = loaderData
  const [searchParams] = useSearchParams()
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''

  const totalAntall = data.team.reduce((s, t) => s + t.antall, 0)
  const antallTeam = data.team.length

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Teamytelse viser nøkkeltall per ansvarlig team. Sammenlign gjennomstrømning, feilrate og behandlingstid for å
        identifisere team som trenger støtte eller som har beste praksis.
      </BodyShort>

      <HStack gap="space-24" wrap>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {antallTeam}
          </Heading>
          <BodyShort size="small">Team</BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {totalAntall.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small">Totalt behandlinger</BodyShort>
        </VStack>
      </HStack>

      {data.team.length > 0 && (
        <Table size="small" zebraStripes>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Team</Table.HeaderCell>
              <Table.HeaderCell align="right">Antall</Table.HeaderCell>
              <Table.HeaderCell align="right">Fullført</Table.HeaderCell>
              <Table.HeaderCell align="right">Feilet</Table.HeaderCell>
              <Table.HeaderCell align="right">Stoppet</Table.HeaderCell>
              <Table.HeaderCell align="right">Fullføringsrate</Table.HeaderCell>
              <Table.HeaderCell align="right">Feilrate</Table.HeaderCell>
              <Table.HeaderCell align="right">Snitt varighet</Table.HeaderCell>
              <Table.HeaderCell align="right">Median varighet</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.team.map((t) => (
              <Table.Row key={t.ansvarligTeam}>
                <Table.DataCell>{t.ansvarligTeam}</Table.DataCell>
                <Table.DataCell align="right">{t.antall.toLocaleString('nb-NO')}</Table.DataCell>
                <Table.DataCell align="right">{t.antallFullfort.toLocaleString('nb-NO')}</Table.DataCell>
                <Table.DataCell align="right">{t.antallFeilet.toLocaleString('nb-NO')}</Table.DataCell>
                <Table.DataCell align="right">{t.antallStoppet.toLocaleString('nb-NO')}</Table.DataCell>
                <Table.DataCell align="right">
                  {t.fullforingsrate != null ? `${(t.fullforingsrate * 100).toFixed(1)}%` : '–'}
                </Table.DataCell>
                <Table.DataCell align="right">
                  {t.feilrate != null ? `${(t.feilrate * 100).toFixed(1)}%` : '–'}
                </Table.DataCell>
                <Table.DataCell align="right">{formaterVarighet(t.gjennomsnittVarighetSekunder)}</Table.DataCell>
                <Table.DataCell align="right">{formaterVarighet(t.medianVarighetSekunder)}</Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      <HStack justify="end">
        <LastNedTabData data={data.team} filnavn={`teamytelse-${behandlingType}-${fom}-${tom}`} />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="teamdata" />
}
