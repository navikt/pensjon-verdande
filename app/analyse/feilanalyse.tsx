import { BodyShort, Heading, HStack, Table, VStack } from '@navikt/ds-react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/feilanalyse'
import FeilTidsserieChart from './components/FeilTidsserieChart'
import LastNedTabData from './components/LastNedTabData'
import type { FeilAnalyseResponse } from './types'
import { parseAnalyseParams } from './utils/parseAnalyseParams'

export async function loader({ request }: Route.LoaderArgs) {
  const { paramsAgg } = parseAnalyseParams(request)
  return await apiGet<FeilAnalyseResponse>(`/api/behandling/analyse/feil?${paramsAgg}`, request)
}

export default function FeilanalyseTab({ loaderData }: Route.ComponentProps) {
  const data = loaderData
  const [searchParams] = useSearchParams()
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Oversikt over feilmeldinger fra kjøringer. Tabellen viser de mest frekvente feilmeldingene med antall og siste
        forekomst. Diagrammet viser feiltrend over tid. Bruk dette til å identifisere og prioritere feilretting.
      </BodyShort>

      <HStack gap="space-24" wrap>
        <VStack gap="space-4" align="center" style={{ minWidth: '120px' }}>
          <Heading level="3" size="xlarge">
            {data.totaltFeiledeKjoringer.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small" weight="semibold">
            Feilede kjøringer totalt
          </BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '120px' }}>
          <Heading level="3" size="large">
            {data.toppFeilmeldinger.length}
          </Heading>
          <BodyShort size="small">Unike feilmeldinger</BodyShort>
        </VStack>
      </HStack>

      {data.toppFeilmeldinger.length > 0 && (
        <VStack gap="space-8">
          <Heading level="3" size="small">
            Topp feilmeldinger
          </Heading>
          <Table size="small" zebraStripes>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>#</Table.HeaderCell>
                <Table.HeaderCell>Feilmelding</Table.HeaderCell>
                <Table.HeaderCell align="right">Antall</Table.HeaderCell>
                <Table.HeaderCell>Sist sett</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.toppFeilmeldinger.map((feil, idx) => (
                <Table.Row key={feil.feilmelding}>
                  <Table.DataCell>{idx + 1}</Table.DataCell>
                  <Table.DataCell>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85em', wordBreak: 'break-word' }}>
                      {feil.feilmelding}
                    </span>
                  </Table.DataCell>
                  <Table.DataCell align="right">{feil.antall.toLocaleString('nb-NO')}</Table.DataCell>
                  <Table.DataCell>{feil.sisteOpptreden.replace('T', ' ').substring(0, 16)}</Table.DataCell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </VStack>
      )}

      <FeilTidsserieChart data={data.datapunkter} />
      <HStack justify="end">
        <LastNedTabData
          data={[...data.toppFeilmeldinger, ...data.datapunkter]}
          filnavn={`feilanalyse-${behandlingType}-${fom}-${tom}`}
        />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="feilanalysedata" />
}
