import type { ActionFunctionArgs } from '@remix-run/node'


import { requireAccessToken } from '~/services/auth.server'
import { env } from '~/services/env.server'
import { Link, useFetcher, useLoaderData } from '@remix-run/react'
import {
  Alert,
  Button,
  CopyButton,
  Detail,
  Heading,
  HStack,
  Loader,
  Select,
  Switch,
  Table,
  Textarea,
  VStack,
} from '@navikt/ds-react'
import { formatIsoDate, formatIsoTimestamp } from '~/common/date'
import React, { useEffect, useState } from 'react'
import {
  ArrowCirclepathIcon,
  CheckmarkCircleIcon,
  CogRotationIcon,
  PersonSuitIcon,
  XMarkOctagonIcon,
} from '@navikt/aksel-icons'
import { decodeBehandling } from '~/common/decodeBehandling'
import { getEnumValueByKey } from '~/common/utils'
import { Team } from '~/common/decodeTeam'
import type {
  LaasteVedtakBehandlingSummary,
  LaasteVedtakRow,
  LaasteVedtakUttrekkStatus,
  LaasteVedtakUttrekkSummary,
} from '~/laaste-vedtak.types'

export const loader = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const laasteVedtakSummary = await getLaasteVedtakSummary(
    accessToken,
  )
  if (!laasteVedtakSummary) {
    throw new Response('Not Found', { status: 404 })
  }
  return laasteVedtakSummary
}

export default function LaasteVedtakPage() {
  const laasteVedtakSummary  = useLoaderData() as LaasteVedtakUttrekkSummary
  const uttrekkStatusFetcher = useFetcher()
  const [avansertVisning, setAvansertVisning] = useState(false)


  // Reload page when uttrekk is finished
  useEffect(() => {
    if (laasteVedtakSummary.behandlingId === null || laasteVedtakSummary.uttrekkStatus?.isFerdig || laasteVedtakSummary.uttrekkStatus?.isFeilet || laasteVedtakSummary.uttrekkStatus?.isFerdig === false) {
      return
    }

    function oppdaterUttrekkStatus() {
      const uttrekkStatus = uttrekkStatusFetcher.data as LaasteVedtakUttrekkStatus | null

      if (uttrekkStatus?.isFerdig || uttrekkStatus?.isFeilet) {
        clearInterval(interval)
        location.reload()
      } else {
        if (uttrekkStatusFetcher.state === 'idle') uttrekkStatusFetcher.load(`/laaste-vedtak/uttrekkStatus?behandlingId=${laasteVedtakSummary.behandlingId}`)
      }
    }

    const interval = setInterval(() => oppdaterUttrekkStatus(), 1000)

    return () => {
      clearInterval(interval)
    }
  }, [laasteVedtakSummary.behandlingId, laasteVedtakSummary.uttrekkStatus?.isFeilet, laasteVedtakSummary.uttrekkStatus?.isFerdig, uttrekkStatusFetcher])

  return (
    <div id="laaste_vedtak">
      <VStack>
        <HStack align="center" justify="center" gap="2">
          <Heading size="large">Låste vedtak</Heading>
          {laasteVedtakSummary.uttrekkStatus?.isFerdig &&
            <Detail>Antall låst: {laasteVedtakSummary.laasteVedtak.length}</Detail>}

          <div style={{ marginLeft: 'auto' }}>
            <HStack gap="4" align="center">
              {laasteVedtakSummary.uttrekkStatus?.isFerdig && <Alert variant="success" size="small" inline>Sist
                kjørt: {formatIsoTimestamp(laasteVedtakSummary.sistKjoert)}</Alert>
              }
              {laasteVedtakSummary.uttrekkStatus?.isFeilet &&
                <Alert variant="error" size="small" inline>Uttrekk feilet. Sist
                  forsøkt: {formatIsoTimestamp(laasteVedtakSummary.sistKjoert)} </Alert>}
              {(uttrekkStatusFetcher?.data as LaasteVedtakUttrekkStatus | null)?.isFerdig == false &&
                <Alert variant="info" size="small" inline>Kjører
                  aktivitet: {(uttrekkStatusFetcher?.data as LaasteVedtakUttrekkStatus | null)?.aktivitet ?? 'Behandling starter...'}</Alert>}
              <RunUttrekk
                isFerdig={laasteVedtakSummary.uttrekkStatus?.isFerdig === true || laasteVedtakSummary.uttrekkStatus?.isFeilet === true || laasteVedtakSummary.behandlingId === null} />
            </HStack>
          </div>
        </HStack>
        <HStack>
          {laasteVedtakSummary.uttrekkStatus?.isFerdig === true && (
            <VStack>
              <HStack>
                <Switch checked={avansertVisning} onChange={() => setAvansertVisning(!avansertVisning)}>Avansert
                  visning</Switch>
              </HStack>
              <HStack>
                <Table zebraStripes>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Registrert</Table.HeaderCell>
                      <Table.HeaderCell>Team</Table.HeaderCell>
                      <Table.HeaderCell>Sak Id</Table.HeaderCell>
                      {avansertVisning && <Table.HeaderCell>Vedtak Id</Table.HeaderCell>}
                      <Table.HeaderCell>SakType</Table.HeaderCell>
                      <Table.HeaderCell>Behandlinger</Table.HeaderCell>
                      {avansertVisning && <Table.HeaderCell>Vedtakstype</Table.HeaderCell>}
                      {avansertVisning && <Table.HeaderCell>Vedtaksstatus</Table.HeaderCell>}
                      {avansertVisning && <Table.HeaderCell>Virk FOM</Table.HeaderCell>}
                      {avansertVisning && <Table.HeaderCell>Krav gjelder</Table.HeaderCell>}
                      {avansertVisning && <Table.HeaderCell>Kravstatus</Table.HeaderCell>}
                      {avansertVisning && <Table.HeaderCell>Opprettet av/Endret av</Table.HeaderCell>}
                      <Table.HeaderCell>Kommentar</Table.HeaderCell>
                      <Table.HeaderCell>Kan iverksettes</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {laasteVedtakSummary.laasteVedtak.map((vedtak, index) => (
                      <Table.Row key={index}>
                        <Table.DataCell>{formatIsoDate(vedtak.datoRegistrert)}</Table.DataCell>
                        <Table.DataCell>
                          <AnsvarligTeam behandlingId={laasteVedtakSummary.behandlingId!} vedtak={vedtak} />
                        </Table.DataCell>
                        <Table.DataCell><CopyButton copyText={vedtak.sakId} text={vedtak.sakId}
                                                    size="small" /></Table.DataCell>
                        {avansertVisning && <Table.DataCell>{vedtak.vedtakId !== null &&
                          <CopyButton copyText={vedtak.vedtakId} text={vedtak.vedtakId}
                                      size="small" />}</Table.DataCell>}
                        <Table.DataCell><HStack align="center" gap="1">{vedtak.sakType} {vedtak.isAutomatisk ?
                          <CogRotationIcon color="DeepSkyBlue" fontSize="16" /> :
                          <PersonSuitIcon color="DarkSlateGray" />}</HStack></Table.DataCell>
                        <Table.DataCell>{vedtak.behandlinger.length > 0 &&
                          <Behandlinger kravid={vedtak.kravId} behandlinger={vedtak.behandlinger} />}</Table.DataCell>
                        {avansertVisning && <Table.DataCell>{vedtak.vedtaksType}</Table.DataCell>}
                        {avansertVisning && <Table.DataCell>{vedtak.vedtakStatus}</Table.DataCell>}
                        {avansertVisning && <Table.DataCell>{formatIsoDate(vedtak.virkFom)}</Table.DataCell>}
                        {avansertVisning && <Table.DataCell>{vedtak.kravGjelder}</Table.DataCell>}
                        {avansertVisning && <Table.DataCell>{vedtak.kravStatus}</Table.DataCell>}
                        {avansertVisning &&
                          <Table.DataCell>{vedtak.opprettetAv} {vedtak.endretAv && '/' + vedtak.endretAv}</Table.DataCell>}
                        <Table.DataCell>
                          <Kommentar behandlingId={laasteVedtakSummary.behandlingId!} vedtak={vedtak} />
                        </Table.DataCell>
                        <Table.DataCell>
                          <KanIverksettes behandlingId={laasteVedtakSummary.behandlingId!} vedtak={vedtak} />
                        </Table.DataCell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </HStack>
            </VStack>
          )}
          {laasteVedtakSummary.uttrekkStatus?.isFeilet === true &&
            <VStack><Heading size="medium">{laasteVedtakSummary.uttrekkStatus?.feilmelding}</Heading>
              <Detail>{laasteVedtakSummary.uttrekkStatus?.stackTrace}</Detail>
            </VStack>}
        </HStack>

      </VStack>
    </div>
  )
}


function RunUttrekk({ isFerdig }: { isFerdig: boolean, }) {

  const fetcher = useFetcher()

  return (
    <fetcher.Form method="POST" action="runUttrekk">
      <Button type="submit" loading={!isFerdig}>Kjør uttrekk</Button>
    </fetcher.Form>
  )
}

function AnsvarligTeam({ behandlingId, vedtak }: { behandlingId: string, vedtak: LaasteVedtakRow }) {

  const fetcher = useFetcher()

  function oppdaterTeam(nyttTeam: string) {

    console.log('oppdater team', nyttTeam, behandlingId, vedtak)
    fetcher.submit(
      {
        behandlingId,
        kravId: vedtak.kravId,
        team: nyttTeam,
      },
      {
        action: 'oppdaterTeam',
        method: 'POST',
        encType: 'application/json',
      },
    )
  }

  return (
    <HStack>
      <Select
        label="Velg ansvarlig team"
        hideLabel
        id="team-select"
        value={vedtak.team}
        onChange={(e) => oppdaterTeam(e.target.value)}
        disabled={fetcher.state === 'submitting'}
      >
        <option value="" disabled>
          Velg et alternativ
        </option>
        {Object.keys(Team).map((teamKey: string) => (
          <option key={teamKey} value={teamKey}>
            {getEnumValueByKey(Team, teamKey)}
          </option>
        ))}
      </Select>
      {fetcher.state === 'submitting' && <Loader size="xsmall" />}
    </HStack>
  )
}

function KanIverksettes({ behandlingId, vedtak }: { behandlingId: string, vedtak: LaasteVedtakRow }) {

  const fetcher = useFetcher()

  function oppdaterKanIverksettes(kanIverksettes: boolean) {

    console.log('oppdater kanIverksettes', kanIverksettes, behandlingId, vedtak)
    fetcher.submit(
      {
        behandlingId,
        kravId: vedtak.kravId,
        kanIverksettes,
      },
      {
        action: 'oppdaterKanIverksettes',
        method: 'POST',
        encType: 'application/json',
      },
    )
  }

  return (
    <HStack>
      <Switch checked={vedtak.kanIverksettes} loading={fetcher.state === 'submitting'}
              onChange={() => oppdaterKanIverksettes(!vedtak.kanIverksettes)}>
        {null}
      </Switch>
    </HStack>
  )
}

function Kommentar({ behandlingId, vedtak }: { behandlingId: string, vedtak: LaasteVedtakRow }) {
  const fetcher = useFetcher()
  const [kommentar, setKommentar] = useState(vedtak.kommentar ?? '')

  function oppdaterKommentar() {

    if (kommentar === vedtak.kommentar) {
      return
    }
    console.log('oppdater kommentar', kommentar, behandlingId, vedtak)
    fetcher.submit(
      {
        behandlingId,
        kravId: vedtak.kravId,
        kommentar: kommentar === '' ? ' ' : kommentar,
      },
      {
        action: 'oppdaterKommentar',
        method: 'POST',
        encType: 'application/json',
      },
    )
  }

  return (
    <HStack>
      <Textarea disabled={fetcher.state === 'submitting'} label="Kommentar til vedtak" size="small" minRows={2}
                value={kommentar}
                onChange={(e) => setKommentar(e.target.value)} onBlur={() => oppdaterKommentar()} hideLabel resize />
      {fetcher.state === 'submitting' && <Loader size="xsmall" />}
    </HStack>
  )
}

function Behandlinger({ kravid, behandlinger }: { kravid: string, behandlinger: LaasteVedtakBehandlingSummary[] }) {
  return (
    <VStack>
      {behandlinger.map((behandling) => (
        <HStack key={kravid + behandling.behandlingId} gap="1" align="center">
          <Link to={`/behandling/${behandling.behandlingId}`} target="_blank">{decodeBehandling(behandling.type)}</Link>
          {behandling.isFeilet ? <XMarkOctagonIcon color="red" /> : behandling.isFerdig ?
            <CheckmarkCircleIcon color="green" /> :
            <ArrowCirclepathIcon />}
        </HStack>
      ))}
    </VStack>
  )
}


export async function getLaasteVedtakSummary(
  accessToken: string,
): Promise<LaasteVedtakUttrekkSummary> {

  const response = await fetch(
    `${env.penUrl}/api/behandling/laaste-vedtak`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return (await response.json()) as LaasteVedtakUttrekkSummary
  } else {
    let body = await response.json()
    console.log(`Feil ved kall til pen ${response.status}`, body)
    throw new Error()
  }
}




