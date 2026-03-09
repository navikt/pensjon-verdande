import { BodyShort, Heading, HStack, Table, VStack } from '@navikt/ds-react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/feilklassifisering'
import LastNedTabData from './components/LastNedTabData'
import type { FeilklassifiseringResponse } from './types'
import { parseAnalyseParams } from './utils/parseAnalyseParams'

export async function loader({ request }: Route.LoaderArgs) {
  const { params } = parseAnalyseParams(request)
  return await apiGet<FeilklassifiseringResponse>(`/api/behandling/analyse/feilklassifisering?${params}`, request)
}

export default function FeilklassifiseringTab({ loaderData }: Route.ComponentProps) {
  const data = loaderData
  const [searchParams] = useSearchParams()
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Feilklassifisering grupperer feil etter exception-type fra stack trace. Gir et overordnet bilde av hvilke
        feilkategorier som dominerer — nyttig for å prioritere feilretting og identifisere systemiske problemer.
      </BodyShort>

      <HStack gap="space-24" wrap>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {data.totaltFeiledeKjoringer.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small">Feilede kjøringer</BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {data.exceptionTyper.length}
          </Heading>
          <BodyShort size="small">Feilklasser</BodyShort>
        </VStack>
      </HStack>

      {data.exceptionTyper.length > 0 && (
        <Table size="small" zebraStripes>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Exception-type</Table.HeaderCell>
              <Table.HeaderCell align="right">Antall</Table.HeaderCell>
              <Table.HeaderCell>Siste opptreden</Table.HeaderCell>
              <Table.HeaderCell>Eksempel</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.exceptionTyper.map((e) => (
              <Table.Row key={e.exceptionType}>
                <Table.DataCell>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>{e.exceptionType}</span>
                </Table.DataCell>
                <Table.DataCell align="right">{e.antall.toLocaleString('nb-NO')}</Table.DataCell>
                <Table.DataCell>{e.sisteOpptreden}</Table.DataCell>
                <Table.DataCell>
                  {e.eksempelMelding && (
                    <span
                      style={{
                        fontSize: '0.85em',
                        maxWidth: '400px',
                        display: 'inline-block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={e.eksempelMelding}
                    >
                      {e.eksempelMelding}
                    </span>
                  )}
                </Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      <HStack justify="end">
        <LastNedTabData data={data.exceptionTyper} filnavn={`feilklassifisering-${behandlingType}-${fom}-${tom}`} />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="feilklassifiseringsdata" />
}
