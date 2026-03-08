import { BodyShort, Heading, HStack, Table, VStack } from '@navikt/ds-react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/stoppet'
import LastNedTabData from './components/LastNedTabData'
import type { StoppetAnalyseResponse } from './types'
import { parseAnalyseParams } from './utils/parseAnalyseParams'

export async function loader({ request }: Route.LoaderArgs) {
  const { paramsAgg } = parseAnalyseParams(request)
  return await apiGet<StoppetAnalyseResponse>(`/api/behandling/analyse/stoppet?${paramsAgg}`, request)
}

export default function StoppetTab({ loaderData }: Route.ComponentProps) {
  const data = loaderData
  const [searchParams] = useSearchParams()
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''

  const stoppprosent = data.stopprate != null ? `${(data.stopprate * 100).toFixed(1)}%` : '–'

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Analyse av stoppede behandlinger. Viser hvor mange som stoppes, ved hvilket aktivitetssteg de stoppes og
        utviklingen over tid. Høy stopprate kan tyde på problemer med inndata eller forretningsregler.
      </BodyShort>

      <HStack gap="space-24" wrap>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {data.antallStoppet.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small">Stoppet</BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {data.totaltAntall.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small">Totalt</BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {stoppprosent}
          </Heading>
          <BodyShort size="small">Stopprate</BodyShort>
        </VStack>
      </HStack>

      {data.stoppetPerAktivitet.length > 0 && (
        <VStack gap="space-8">
          <Heading level="3" size="small">
            Stoppet per aktivitetssteg
          </Heading>
          <Table size="small" zebraStripes>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Aktivitet</Table.HeaderCell>
                <Table.HeaderCell align="right">Antall stoppet</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.stoppetPerAktivitet.map((a) => (
                <Table.Row key={a.aktivitetType}>
                  <Table.DataCell>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>{a.aktivitetType}</span>
                  </Table.DataCell>
                  <Table.DataCell align="right">{a.antall.toLocaleString('nb-NO')}</Table.DataCell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </VStack>
      )}

      {data.datapunkter.length > 0 && (
        <VStack gap="space-8">
          <Heading level="3" size="small">
            Stopprate over tid
          </Heading>
          <Table size="small" zebraStripes>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Periode</Table.HeaderCell>
                <Table.HeaderCell align="right">Stoppet</Table.HeaderCell>
                <Table.HeaderCell align="right">Totalt</Table.HeaderCell>
                <Table.HeaderCell align="right">Stopprate</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.datapunkter.map((d) => (
                <Table.Row key={d.periodeFra}>
                  <Table.DataCell>{d.periodeFra}</Table.DataCell>
                  <Table.DataCell align="right">{d.antallStoppet.toLocaleString('nb-NO')}</Table.DataCell>
                  <Table.DataCell align="right">{d.antallTotalt.toLocaleString('nb-NO')}</Table.DataCell>
                  <Table.DataCell align="right">
                    {d.stopprate != null ? `${(d.stopprate * 100).toFixed(1)}%` : '–'}
                  </Table.DataCell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </VStack>
      )}

      <HStack justify="end">
        <LastNedTabData
          data={[...data.stoppetPerAktivitet, ...data.datapunkter]}
          filnavn={`stoppet-${behandlingType}-${fom}-${tom}`}
        />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="stoppede behandlinger" />
}
