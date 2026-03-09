import { BodyShort, Heading, HStack, Table, VStack } from '@navikt/ds-react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/gruppe'
import LastNedTabData from './components/LastNedTabData'
import type { GruppeAnalyseResponse } from './types'
import { formaterVarighet } from './utils/formattering'
import { parseAnalyseParams } from './utils/parseAnalyseParams'

export async function loader({ request }: Route.LoaderArgs) {
  const { params } = parseAnalyseParams(request)
  return await apiGet<GruppeAnalyseResponse>(`/api/behandling/analyse/gruppe?${params}`, request)
}

export default function GruppeTab({ loaderData }: Route.ComponentProps) {
  const data = loaderData
  const [searchParams] = useSearchParams()
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Gruppeanalyse viser behandlinger som tilhører samme gruppe (f.eks. familierelaterte saker). Sammenlign
        gruppestørrelse, fullføringsgrad og varighet for å identifisere mønstre i gruppeprosessering.
      </BodyShort>

      <HStack gap="space-24" wrap>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {data.totaltGrupper.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small">Grupper</BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '120px' }}>
          <Heading level="3" size="large">
            {data.gjennomsnittStorrelse != null ? data.gjennomsnittStorrelse.toFixed(1) : '–'}
          </Heading>
          <BodyShort size="small">Snitt gruppestørrelse</BodyShort>
        </VStack>
      </HStack>

      {data.grupper.length > 0 && (
        <VStack gap="space-8">
          <Heading level="3" size="small">
            Topp 100 grupper
          </Heading>
          <Table size="small" zebraStripes>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Gruppe-ID</Table.HeaderCell>
                <Table.HeaderCell align="right">Behandlinger</Table.HeaderCell>
                <Table.HeaderCell align="right">Fullført</Table.HeaderCell>
                <Table.HeaderCell align="right">Feilet</Table.HeaderCell>
                <Table.HeaderCell align="right">Snitt varighet</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.grupper.map((g) => (
                <Table.Row key={g.gruppeId}>
                  <Table.DataCell>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>{g.gruppeId}</span>
                  </Table.DataCell>
                  <Table.DataCell align="right">{g.antallBehandlinger.toLocaleString('nb-NO')}</Table.DataCell>
                  <Table.DataCell align="right">{g.antallFullfort.toLocaleString('nb-NO')}</Table.DataCell>
                  <Table.DataCell align="right">{g.antallFeilet.toLocaleString('nb-NO')}</Table.DataCell>
                  <Table.DataCell align="right">{formaterVarighet(g.gjennomsnittVarighetSekunder)}</Table.DataCell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </VStack>
      )}

      <HStack justify="end">
        <LastNedTabData data={data.grupper} filnavn={`gruppe-${behandlingType}-${fom}-${tom}`} />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="gruppedata" />
}
