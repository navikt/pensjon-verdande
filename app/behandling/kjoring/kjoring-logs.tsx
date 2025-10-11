import { ExternalLinkIcon } from '@navikt/aksel-icons'
import {
  BodyShort,
  Button,
  CopyButton,
  Heading,
  HStack,
  Label,
  Link,
  Table,
  Tag,
  Tooltip,
  VStack,
} from '@navikt/ds-react'
import { type LoaderFunctionArgs, Link as ReactRouterLink, useLoaderData } from 'react-router'
import invariant from 'tiny-invariant'
import { finnAktivitet } from '~/behandling/behandling.$behandlingId.aktivitet.$aktivitetId'
import { formatIsoTimestamp } from '~/common/date'
import { decodeAktivitet, decodeBehandling } from '~/common/decodeBehandling'
import { tidsbruk } from '~/components/kjoringer-table/BehandlingKjoringerTable'
import { fetchPenLogs, tempoUrl } from '~/loki/loki.server'
import {
  isStreams,
  type LokiInstantQueryData,
  type LokiInstantQueryResponse,
  type LokiStream,
} from '~/loki/loki-query-types'
import { apiGet } from '~/services/api.server'
import type { BehandlingDto, HalLink } from '~/types'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { behandlingId, kjoringId } = params

  invariant(behandlingId, 'Missing behandlingId param')
  invariant(kjoringId, 'Missing kjoringId param')

  const behandling = await apiGet<BehandlingDto>(`/api/behandling/${behandlingId}`, request)

  const kjoring = behandling.behandlingKjoringer.find((it) => it.behandlingKjoringId.toString() === params.kjoringId)
  if (!kjoring) {
    throw new Response('Not Found', { status: 404 })
  }

  const aktivitet = kjoring.aktivitetId && finnAktivitet(behandling, kjoring.aktivitetId)

  const response: LokiInstantQueryResponse = await fetchPenLogs(
    kjoring.startet,
    kjoring.avsluttet,
    kjoring.correlationId,
  )

  const data = response.data as LokiInstantQueryData

  const result: LokiStream[] = response.status === 'success' && isStreams(data) ? (data.result as LokiStream[]) : []
  const traceId = result.length > 0 ? result[0].stream.trace_id : undefined

  return {
    response,
    behandling,
    aktivitet,
    kjoring,
    traceId: traceId,
    tempoUrl: traceId && tempoUrl(kjoring.startet, kjoring.avsluttet, traceId),
  }
}

export default function Behandling() {
  const { response, behandling, aktivitet, kjoring, traceId, tempoUrl } = useLoaderData<typeof loader>()

  const data = response.data as LokiInstantQueryData

  const result = data.result as LokiStream[]

  const showStackTrace = false

  return (
    <VStack gap="4">
      <Heading size={'small'}>Kjøring</Heading>

      <section aria-labelledby="overview-heading">
        <dl
          style={{
            display: 'grid',
            gridTemplateColumns: 'max-content 1fr',
            columnGap: '1rem',
            rowGap: '0.5rem',
            margin: 0,
            alignItems: 'center',
            gridAutoRows: '2rem',
          }}
        >
          <dt>
            <Label as="span">Behandling</Label>
          </dt>
          <dd>
            <Link as={ReactRouterLink} to={`/behandling/${kjoring.behandlingId}`}>
              {kjoring.behandlingId} - {decodeBehandling(behandling.type)}
            </Link>
          </dd>
          {aktivitet && (
            <>
              <dt>
                <Label as="span">Aktivitet</Label>
              </dt>
              <dd>
                <Link
                  as={ReactRouterLink}
                  to={`/behandling/${kjoring.behandlingId}/aktivitet/${aktivitet.aktivitetId}`}
                >
                  {aktivitet.aktivitetId} - {decodeAktivitet(aktivitet.type)}
                </Link>
              </dd>
            </>
          )}

          <dt>
            <Label as="span">Start</Label>
          </dt>
          <dd>
            <BodyShort>{formatIsoTimestamp(kjoring.startet, true)}</BodyShort>
          </dd>

          <dt>
            <Label as="span">Slutt</Label>
          </dt>
          <dd>
            <BodyShort>{formatIsoTimestamp(kjoring.avsluttet, true)}</BodyShort>
          </dd>

          <dt>
            <Label as="span">Tidsbruk</Label>
          </dt>
          <dd>
            <BodyShort>{tidsbruk(kjoring)}</BodyShort>
          </dd>

          <dt>
            <Label as="span">Korrelasjonsid</Label>
          </dt>
          <dd>
            <HStack gap="2" align="center">
              <BodyShort>{kjoring.correlationId}</BodyShort>
              <Tooltip content="Kopier korrelasjonsid">
                <CopyButton copyText={kjoring.correlationId} iconPosition="right" size="small" />
              </Tooltip>
            </HStack>
          </dd>

          {traceId && (
            <>
              <dt>
                <Label as="span">TraceId</Label>
              </dt>
              <dd>
                <HStack gap="2" align="center">
                  <BodyShort>{traceId}</BodyShort>
                  <Tooltip content="Kopier TraceId">
                    <CopyButton copyText={traceId} iconPosition="right" size="small" />
                  </Tooltip>
                </HStack>
              </dd>
            </>
          )}

          <dt>
            <Label as="span">Status</Label>
          </dt>
          <dd>
            <BodyShort>
              {kjoring.feilmelding ? (
                <Tag size="small" variant="error">
                  Feilet
                </Tag>
              ) : (
                <Tag size="small" variant="success">
                  OK
                </Tag>
              )}
            </BodyShort>
          </dd>

          {kjoring.feilmelding && (
            <>
              <dt>
                <Label as="span">Feilmelding</Label>
              </dt>
              <dd>
                <BodyShort>{kjoring.feilmelding}</BodyShort>
              </dd>
            </>
          )}
        </dl>
      </section>

      <HStack>
        {kjoring._links?.kibana && (
          <Button
            as={ReactRouterLink}
            to={(kjoring._links.kibana as HalLink).href}
            size="small"
            variant="tertiary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Se logger i Kibana
            <ExternalLinkIcon title={'Se logger i Kibana'} />
          </Button>
        )}
        {tempoUrl && (
          <Button
            as={ReactRouterLink}
            size="small"
            variant="tertiary"
            to={tempoUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Se trace i Tempo
            <ExternalLinkIcon title={'Se trace i Tempo'} />
          </Button>
        )}
      </HStack>

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell></Table.HeaderCell>
            <Table.HeaderCell>Tidspunkt</Table.HeaderCell>
            <Table.HeaderCell>Nivå</Table.HeaderCell>
            <Table.HeaderCell>Melding</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {result.map((s) => {
            return (
              <Table.ExpandableRow
                key={`logline|${s.stream._timestamp}`}
                content={
                  <VStack gap="16">
                    {showStackTrace && s.stream.stack_trace && <pre>{s.stream.stack_trace}</pre>}

                    <Table>
                      <Table.Body>
                        {Object.entries(s.stream)
                          .sort((a, b) => a[0].localeCompare(b[0], 'nb', { sensitivity: 'base' }))
                          .map(([key, value]) => {
                            return (
                              <Table.Row key={`details|${s.stream._timestamp}|${key}`}>
                                <Table.HeaderCell style={{ verticalAlign: 'top' }}>{key}</Table.HeaderCell>
                                <Table.DataCell>{value}</Table.DataCell>
                              </Table.Row>
                            )
                          })}
                      </Table.Body>
                    </Table>
                  </VStack>
                }
              >
                <Table.DataCell>{s.stream._timestamp}</Table.DataCell>
                <Table.DataCell>{s.stream.level}</Table.DataCell>
                <Table.DataCell>{s.stream.message}</Table.DataCell>
              </Table.ExpandableRow>
            )
          })}
        </Table.Body>
      </Table>
    </VStack>
  )
}
