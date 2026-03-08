import { BodyShort, Heading, HStack, Table, VStack } from '@navikt/ds-react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/kravtype'
import LastNedTabData from './components/LastNedTabData'
import type { KravtypeAnalyseResponse } from './types'
import { formaterVarighet } from './utils/formattering'
import { parseAnalyseParams } from './utils/parseAnalyseParams'

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
        <Table size="small" zebraStripes>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Krav gjelder</Table.HeaderCell>
              <Table.HeaderCell>Kravstatus</Table.HeaderCell>
              <Table.HeaderCell align="right">Antall</Table.HeaderCell>
              <Table.HeaderCell align="right">Fullført</Table.HeaderCell>
              <Table.HeaderCell align="right">Feilet</Table.HeaderCell>
              <Table.HeaderCell align="right">Feilrate</Table.HeaderCell>
              <Table.HeaderCell align="right">Snitt varighet</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.kravtyper.map((k) => (
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
