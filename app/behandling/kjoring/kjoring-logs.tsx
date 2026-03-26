import { ExternalLinkIcon, LinkIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, CopyButton, Heading, HStack, Label, Link, Tag, Tooltip, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import { Link as ReactRouterLink } from 'react-router'
import invariant from 'tiny-invariant'
import { formatIsoTimestamp } from '~/common/date'
import { decodeAktivitet, decodeBehandling } from '~/common/decodeBehandling'
import { tidsbruk } from '~/components/kjoringer-table/BehandlingKjoringerTable'
import { selectedColumns, selectedFilters } from '~/loki/LokiLogsTable'
import { LokiLogsTableLoader } from '~/loki/LokiLogsTableLoader'
import { fetchPenLogs, tempoConfiguration } from '~/loki/loki.server'
import { tempoUrl } from '~/loki/utils'
import { apiGet } from '~/services/api.server'
import { getAktivitet } from '~/services/behandling.server'
import { kibanaLinkForCorrelationIdAndTraceId } from '~/services/kibana.server'
import type { BehandlingDto, BehandlingKjoringDTO } from '~/types'
import type { Route } from './+types/kjoring-logs'

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const { behandlingId, kjoringId } = params

  invariant(behandlingId, 'Missing behandlingId param')
  invariant(kjoringId, 'Missing kjoringId param')

  const [behandling, kjoring] = await Promise.all([
    apiGet<BehandlingDto>(`/api/behandling/${behandlingId}`, request),
    apiGet<BehandlingKjoringDTO>(`/api/behandling/${behandlingId}/kjoringer/${kjoringId}`, request),
  ])

  const aktivitet = kjoring.aktivitetId
    ? await getAktivitet(request, behandlingId, kjoring.aktivitetId.toString())
    : undefined

  const response = fetchPenLogs(kjoring.startet, kjoring.avsluttet, {
    transaction: kjoring.correlationId,
    ...(kjoring.traceId ? { traceId: kjoring.traceId } : {}),
  })

  return {
    response,
    behandling,
    aktivitet,
    kibanaUrl: kibanaLinkForCorrelationIdAndTraceId(
      kjoring.startet,
      kjoring.avsluttet,
      kjoring.correlationId,
      kjoring.traceId,
    ),
    kjoring,
    tempoUrl: kjoring.traceId && tempoUrl(tempoConfiguration, kjoring.startet, kjoring.avsluttet, kjoring.traceId),
    selectedColumns: selectedColumns(request.url),
    selectedFilters: selectedFilters(request.url),
  }
}

export default function BehandlingKjoring({ loaderData }: Route.ComponentProps) {
  const { response, behandling, aktivitet, kjoring, kibanaUrl, tempoUrl, selectedColumns, selectedFilters } = loaderData

  const [shareUrl, setShareUrl] = useState('')

  return (
    <VStack gap="space-16">
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
            <HStack gap="space-8" align="center">
              <BodyShort>{kjoring.correlationId}</BodyShort>
              <Tooltip content="Kopier korrelasjonsid">
                <CopyButton copyText={kjoring.correlationId} iconPosition="right" size="small" />
              </Tooltip>
            </HStack>
          </dd>

          {kjoring.traceId && (
            <>
              <dt>
                <Label as="span">TraceId</Label>
              </dt>
              <dd>
                <HStack gap="space-8" align="center">
                  <BodyShort>{kjoring.traceId}</BodyShort>
                  <Tooltip content="Kopier TraceId">
                    <CopyButton copyText={kjoring.traceId} iconPosition="right" size="small" />
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
                <Tag data-color="danger" size="small" variant="outline">
                  Feilet
                </Tag>
              ) : (
                <Tag data-color="success" size="small" variant="outline">
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
        <Button
          as={ReactRouterLink}
          to={kibanaUrl}
          size="small"
          variant="tertiary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Se logger i Kibana
          <ExternalLinkIcon title={'Se logger i Kibana'} />
        </Button>
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
        {kjoring.stackTrace && (
          <CopyButton
            size="small"
            iconPosition="right"
            copyText={kjoring.stackTrace}
            text="Kopier stack trace"
            activeText="Kopiert stack trace"
          />
        )}
        <CopyButton
          size="small"
          iconPosition="right"
          copyText={shareUrl}
          text="Kopier lenke"
          activeText="Kopiert lenke"
          icon={<LinkIcon />}
        />
      </HStack>
      <LokiLogsTableLoader
        response={response}
        selectedFilters={selectedFilters}
        selectedColumns={selectedColumns}
        setShareUrl={setShareUrl}
        start={kjoring.startet}
        slutt={kjoring.avsluttet}
      />
    </VStack>
  )
}
