import type { ActionFunctionArgs } from '@remix-run/node'


import { requireAccessToken } from '~/services/auth.server'
import { env } from '~/services/env.server'
import { Link, useFetcher, useLoaderData, useSearchParams } from '@remix-run/react'
import {
  Alert,
  BodyLong,
  Button,
  Checkbox,
  CopyButton,
  Detail,
  Dropdown,
  Heading,
  HStack,
  List,
  Loader,
  Modal,
  Select,
  Switch,
  Table,
  Textarea,
  Tooltip,
  VStack,
} from '@navikt/ds-react'
import { formatIsoDate, formatIsoTimestamp } from '~/common/date'
import React, { useEffect, useState } from 'react'
import {
  CheckmarkCircleIcon,
  CogRotationIcon,
  ExclamationmarkTriangleIcon,
  HeadCloudIcon,
  MenuElipsisVerticalIcon,
  PersonSuitIcon,
  XMarkOctagonIcon,
} from '@navikt/aksel-icons'
import { decodeBehandling } from '~/common/decodeBehandling'
import { getEnumValueByKey } from '~/common/utils'
import { decodeTeam, Team } from '~/common/decodeTeam'
import {
  LaasteVedtakBehandlingSummary,
  LaasteVedtakRow,
  LaasteVedtakUttrekkStatus,
  LaasteVedtakUttrekkSummary, muligeAksjonspunkt,
  VedtakYtelsekomponenter,
} from '~/laaste-vedtak.types'
import { useSort } from '~/hooks/useSort'
import { LaasOppResultat } from '~/laas-opp.types'

export const loader = async ({ request }: ActionFunctionArgs) => {

  const { searchParams } = new URL(request.url)
  const team = searchParams.get('team')
  const aksjonspunkt = searchParams.get('aksjonspunkt')

  const accessToken = await requireAccessToken(request)
  const laasteVedtakSummary = await getLaasteVedtakSummary(
    accessToken,
    team,
    aksjonspunkt,
  )
  if (!laasteVedtakSummary) {
    throw new Response('Not Found', { status: 404 })
  }
  return laasteVedtakSummary
}

export default function LaasteVedtakPage() {
  const laasteVedtakSummary = useLoaderData() as LaasteVedtakUttrekkSummary
  const [uttrekkStatus, setUttrekkStatus] = useState<LaasteVedtakUttrekkStatus | null>(laasteVedtakSummary.uttrekkStatus)
  const [avansertVisning, setAvansertVisning] = useState(false)
  const [laasOppVedtak, setLaasOppVedtak] = useState<LaasteVedtakRow | null>(null)
  const [verifiserOppdragsmeldingManuelt, setVerifiserOppdragsmeldingManuelt] = useState<LaasteVedtakRow | null>(null)

  const { sortKey, onSort, sortFunc, sortDecending } =
    useSort<LaasteVedtakRow>('endretDato')
  const sortedLaasteVedtak: LaasteVedtakRow[] = React.useMemo(() => {
    return laasteVedtakSummary.laasteVedtak.sort(sortFunc)
  }, [laasteVedtakSummary.laasteVedtak, sortFunc])

  return (
    <div id="laaste_vedtak">
      <VStack gap="5">
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
              {uttrekkStatus?.isFerdig == false &&
                <Alert variant="info" size="small" inline>Kjører
                  aktivitet: {uttrekkStatus?.aktivitet ?? 'Behandling starter...'}</Alert>}
              <RunUttrekk
                isFerdig={laasteVedtakSummary.uttrekkStatus?.isFerdig === true || laasteVedtakSummary.uttrekkStatus?.isFeilet === true || laasteVedtakSummary.behandlingId === null} />
            </HStack>
          </div>
        </HStack>
        <HStack>
          {laasteVedtakSummary.uttrekkStatus?.isFerdig === true && (
            <VStack gap="5">
              <HStack gap="4" align="end" justify="start">
                <VelgTeam />
                <VelgAksjonspunkt />
                <Switch checked={avansertVisning} onChange={() => setAvansertVisning(!avansertVisning)}>Avansert
                  visning</Switch>
              </HStack>
              <HStack>
                <Table
                  size="small"
                  onSortChange={onSort}
                  sort={{
                    direction: sortDecending ? 'descending' : 'ascending',
                    orderBy: sortKey as string,
                  }}
                  zebraStripes>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader sortKey="datoRegistrert" sortable>Registrert</Table.ColumnHeader>
                      <Table.ColumnHeader sortKey="team" sortable>Team</Table.ColumnHeader>
                      <Table.ColumnHeader sortKey="sakId" sortable>Sak Id</Table.ColumnHeader>
                      {avansertVisning &&
                        <Table.ColumnHeader sortKey="vedtakId" sortable>Vedtak Id</Table.ColumnHeader>}
                      <Table.ColumnHeader sortKey="sakType" sortable>SakType</Table.ColumnHeader>
                      <Table.ColumnHeader>Behandlinger</Table.ColumnHeader>
                      <Table.ColumnHeader sortKey="vedtakStatus" sortable>Vedtaksstatus</Table.ColumnHeader>
                      {avansertVisning &&
                        <Table.ColumnHeader sortKey="vedtaksType" sortable>Vedtakstype</Table.ColumnHeader>}
                      {avansertVisning && <Table.ColumnHeader sortKey="virkFom" sortable>Virk FOM</Table.ColumnHeader>}
                      {avansertVisning &&
                        <Table.ColumnHeader sortKey="kravGjelder" sortable>Krav gjelder</Table.ColumnHeader>}
                      {avansertVisning &&
                        <Table.ColumnHeader sortKey="kravStatus" sortable>Kravstatus</Table.ColumnHeader>}
                      {avansertVisning &&
                        <Table.ColumnHeader sortKey="endretAv" sortable>Opprettet av/Endret av</Table.ColumnHeader>}
                      <Table.ColumnHeader sortKey="opprettetDato" sortable>Dato opprettet</Table.ColumnHeader>
                      <Table.ColumnHeader sortKey="endretDato" sortable>Dato endret</Table.ColumnHeader>
                      <Table.ColumnHeader>Kommentar</Table.ColumnHeader>
                      <Table.ColumnHeader sortKey="kanIverksettes" sortable>Kan iverksettes</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {sortedLaasteVedtak.map((vedtak, index) => (
                      <Table.Row key={vedtak.kravId}>
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
                          <Tooltip content="Automatisk krav"><HeadCloudIcon color="DeepSkyBlue"
                                                                            fontSize="16" /></Tooltip> :
                          <Tooltip content="Manuelt krav"><PersonSuitIcon
                            color="DarkSlateGray" /></Tooltip>}</HStack></Table.DataCell>
                        <Table.DataCell>{vedtak.behandlinger.length > 0 &&
                          <Behandlinger kravid={vedtak.kravId} behandlinger={vedtak.behandlinger} />}</Table.DataCell>
                        <Table.DataCell>{vedtak.vedtakStatus}</Table.DataCell>
                        {avansertVisning && <Table.DataCell>{vedtak.vedtaksType}</Table.DataCell>}
                        {avansertVisning && <Table.DataCell>{formatIsoDate(vedtak.virkFom)}</Table.DataCell>}
                        {avansertVisning && <Table.DataCell>{vedtak.kravGjelder}</Table.DataCell>}
                        {avansertVisning && <Table.DataCell>{vedtak.kravStatus}</Table.DataCell>}
                        {avansertVisning &&
                          <Table.DataCell>{vedtak.opprettetAv} {vedtak.endretAv && '/' + vedtak.endretAv}</Table.DataCell>}
                        <Table.DataCell>{formatIsoDate(vedtak.opprettetDato)}</Table.DataCell>
                        <Table.DataCell>{formatIsoDate(vedtak.endretDato)}</Table.DataCell>
                        <Table.DataCell>
                          <Kommentar behandlingId={laasteVedtakSummary.behandlingId!} vedtak={vedtak} />
                        </Table.DataCell>
                        <Table.DataCell>
                          <Aksjonspunkt behandlingId={laasteVedtakSummary.behandlingId!} vedtak={vedtak} />
                        </Table.DataCell>
                        <Table.DataCell>
                          {vedtak.opplaasVedtakInformasjon !== null &&
                            <VedtakDropdown vedtak={vedtak} onAapneLaasVedtak={() => setLaasOppVedtak(vedtak)}
                                            onAapneVerifiserOppdragsmeldingManuelt={() => setVerifiserOppdragsmeldingManuelt(vedtak)} />}
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
      {laasOppVedtak !== null && <LaasOppVedtakModal vedtak={laasOppVedtak} onClose={() => setLaasOppVedtak(null)} />}
      {verifiserOppdragsmeldingManuelt !== null &&
        <VerifiserOppdragsmeldingManueltModal vedtak={verifiserOppdragsmeldingManuelt}
                                              onClose={() => setVerifiserOppdragsmeldingManuelt(null)} />}
      <AutoReloadUttrekkStatus behandlingId={laasteVedtakSummary.behandlingId} uttrekkStatus={uttrekkStatus}
                               setUttrekkStatus={setUttrekkStatus}
                               shouldAutoReload={!laasteVedtakSummary?.uttrekkStatus?.isFerdig && !laasteVedtakSummary.uttrekkStatus?.isFeilet} />
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
        size="small"
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

function Aksjonspunkt({ behandlingId, vedtak }: { behandlingId: string, vedtak: LaasteVedtakRow }) {

  const fetcher = useFetcher()

  function oppdaterAksjonspunkt(nyttAksjonspunkt: string) {

    console.log('oppdater aksjonspunkt', nyttAksjonspunkt, behandlingId, vedtak)
    fetcher.submit(
      {
        behandlingId,
        kravId: vedtak.kravId,
        aksjonspunkt: nyttAksjonspunkt,
      },
      {
        action: 'oppdaterAksjonspunkt',
        method: 'POST',
        encType: 'application/json',
      },
    )
  }

  return (
    <HStack>
      <Select
        size="small"
        label="Velg aksjonspunkt team"
        hideLabel
        id="aksjonspunkt-select"
        value={vedtak.aksjonspunkt ?? ''}
        onChange={(e) => oppdaterAksjonspunkt(e.target.value)}
        disabled={fetcher.state === 'submitting'}
      >
        <option value="" disabled>
          Velg et alternativ
        </option>
        {muligeAksjonspunkt.map((aksjonspunkt: string) => (
          <option key={aksjonspunkt} value={aksjonspunkt}>
            {aksjonspunkt}
          </option>
        ))}
      </Select>
      {fetcher.state === 'submitting' && <Loader size="xsmall" />}
    </HStack>
  )
}


function VedtakDropdown({ vedtak, onAapneLaasVedtak, onAapneVerifiserOppdragsmeldingManuelt }: {
  vedtak: LaasteVedtakRow,
  onAapneLaasVedtak: () => void
  onAapneVerifiserOppdragsmeldingManuelt: () => void
}) {
  return (
    <Dropdown>
      <Button size="small" variant="tertiary" icon={<MenuElipsisVerticalIcon />} as={Dropdown.Toggle} />
      <Dropdown.Menu>
        <Dropdown.Menu.GroupedList>
          {vedtak.opplaasVedtakInformasjon !== null && (
            <Dropdown.Menu.GroupedList.Item onClick={onAapneLaasVedtak}>
              Lås opp
            </Dropdown.Menu.GroupedList.Item>
          )}
          {vedtak.vedtakStatus === 'Samordnet' && (
            <Dropdown.Menu.GroupedList.Item onClick={onAapneVerifiserOppdragsmeldingManuelt}>
              Verifiser oppdragsmelding manuelt
            </Dropdown.Menu.GroupedList.Item>)}
        </Dropdown.Menu.GroupedList>
      </Dropdown.Menu>
    </Dropdown>
  )
}

function LaasOppVedtakModal({ vedtak, onClose }: { vedtak: LaasteVedtakRow, onClose: () => void }) {
  const fetcher = useFetcher()

  function laasOppVedtak() {
    fetcher.submit(
      {
        vedtakId: vedtak.vedtakId,
      },
      {
        action: 'laasOpp',
        method: 'POST',
        encType: 'application/json',
      },
    )
  }

  useEffect(() => {
    const res = fetcher?.data as LaasOppResultat
    if (res === undefined) {
      return
    }
    if (res.success) {
      onClose()
    } else {
      alert('Kunne ikke låse opp, teknisk feil.')
    }
  }, [fetcher.data, onClose])

  return (
    <Modal header={{ heading: 'Lås opp vedtak' }} open={true} onClose={onClose}>
      <Modal.Body>
        <VStack gap="5">
          <BodyLong>
            Er du sikker på at du vil låse opp vedtaket? Dette fører til merarbeid for saksbehandler, sørg for at fag er
            innvolvert og at saksbehandler får nødvendig
            informasjon.
          </BodyLong>
          <BodyLong weight="semibold">
            Team {decodeTeam(vedtak.team)} må gjøre vurdering på hva som skal til for å unngå
            dette i fremtiden.
          </BodyLong>
          <Heading size="small">Dette vil skje:</Heading>
          <List as="ul">
            {vedtak.opplaasVedtakInformasjon?.sammenstotendeVedtak !== null && (
              <List.Item title="Sammenstøtende vedtak">
                Vedtaket har sammenstøtende vedtak i sak {vedtak.opplaasVedtakInformasjon?.sammenstotendeVedtak.sakId}.
                Dette vedtaket må også låses opp.
              </List.Item>
            )}
            {vedtak.opplaasVedtakInformasjon?.harBehandling && (
              <List.Item title="Behandling">
                Vedtaket har en pågående behandling. Denne vil bli stoppet.
              </List.Item>
            )}
            {vedtak.opplaasVedtakInformasjon?.erAutomatisk && (
              <List.Item title="Automatisk vedtak">
                Kravet har behandlings type automatisk. Det vil endret til manuell, oppgave blir opprettet.
              </List.Item>
            )}
            <List.Item title="Endring av vedtakstatus">
              Vedtakstatus vil bli endret til "Til Attestering"
            </List.Item>
          </List>
        </VStack>
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" loading={fetcher.state === 'submitting'} variant="danger" onClick={laasOppVedtak}>
          Lås opp
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
        >
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

function VerifiserOppdragsmeldingManueltModal({ vedtak, onClose }: { vedtak: LaasteVedtakRow, onClose: () => void }) {
  const submitFetcher = useFetcher()
  const [oppdragsmeldingOk, setOppdragsmeldingOk] = useState(false)

  function verifiserOppdragsmeldingManuelt() {
    submitFetcher.submit(
      {
        vedtakId: vedtak.vedtakId,
      },
      {
        action: 'bekreftOppdragsmeldingManuelt',
        method: 'POST',
        encType: 'application/json',
      },
    )
  }

  const fetcher = useFetcher()
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data === undefined) fetcher.load(`/laaste-vedtak/hentVedtakIOppdrag/${vedtak.vedtakId}`)
  }, [fetcher, vedtak.vedtakId])

  useEffect(() => {
    if (submitFetcher.state === 'idle' && submitFetcher.data === true) {
      onClose()
    }
  }, [onClose, submitFetcher])

  const vedtakIOppdrag = fetcher.data as VedtakYtelsekomponenter | undefined

  return (
    <Modal header={{ heading: 'Verifiser oppdragsmelding manuelt' }} open={true} onClose={onClose} width={1000}>
      <Modal.Body>
        <VStack gap="5">
          <BodyLong>
            Brukes dersom kvittering fra oppdrag ikke er mottatt og oppdrag er oppdatert. Må verifiseres manuelt.
          </BodyLong>

          {fetcher.state === 'loading' &&
            <HStack gap="2"><Loader size="small" /> <Detail>Henter ytelsekomponenter...</Detail></HStack>}

          {vedtakIOppdrag !== undefined && (
            <Table size="small" zebraStripes>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Ytelse type</Table.ColumnHeader>
                  <Table.ColumnHeader>Beløp i Pesys</Table.ColumnHeader>
                  <Table.ColumnHeader>YtelsekomponentId</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {vedtakIOppdrag?.ytelsekomponenterOversendtOppdrag.map((ytelse) => (
                  <Table.Row key={ytelse.ytelsekomponentId}>
                    <Table.DataCell>{ytelse.ytelseKomponentType}</Table.DataCell>
                    <Table.DataCell>{ytelse.belop}</Table.DataCell>
                    <Table.DataCell>{ytelse.ytelsekomponentId}</Table.DataCell>
                  </Table.Row>))}
              </Table.Body>
            </Table>
          )}

        </VStack>
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" loading={submitFetcher.state === 'submitting'}
                disabled={fetcher.state === 'loading' || !oppdragsmeldingOk}
                onClick={verifiserOppdragsmeldingManuelt}>
          Iverksett vedtak
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
        >
          Avbryt
        </Button>
        <Checkbox value={oppdragsmeldingOk} onChange={() => setOppdragsmeldingOk(!oppdragsmeldingOk)}
                  disabled={fetcher.state === 'loading'}>Oppdragsmelding er verifisert manuelt</Checkbox>
      </Modal.Footer>
    </Modal>
  )

}

function Kommentar({ behandlingId, vedtak }: { behandlingId: string, vedtak: LaasteVedtakRow }) {
  const fetcher = useFetcher()
  const [kommentar, setKommentar] = useState(vedtak.kommentar ?? '')
  const [expanded, setExpanded] = useState(false)

  function oppdaterKommentar() {
    setExpanded(false)
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
      <Textarea disabled={fetcher.state === 'submitting'} label="Kommentar til vedtak" size="small"
                maxRows={expanded ? 15 : 1}
                minRows={expanded ? 15 : 1}
                value={kommentar}
                onFocus={() => setExpanded(true)}
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
          {behandling.isUnderBehandling && <Tooltip content="Under behandling"><CogRotationIcon /></Tooltip>}
          {behandling.isFerdig && <Tooltip content="Ferdig"><CheckmarkCircleIcon color="green" /></Tooltip>}
          {behandling.isFeilet && <Tooltip content="Feilet"><ExclamationmarkTriangleIcon color="orange" /></Tooltip>}
          {behandling.isStoppet &&
            <Tooltip content="Stoppet manuelt. Krav må låses opp"><XMarkOctagonIcon color="red" /></Tooltip>}
        </HStack>
      ))}
    </VStack>
  )
}

function VelgTeam() {

  const [searchParams, setSearchParams] = useSearchParams()
  const team = searchParams.get('team') as Team | null

  return (
    <Select size="small" label="Velg team" defaultValue={team || undefined} onChange={(value) => {
      const nyttTeam = value.target.value
      if (nyttTeam === '') {
        searchParams.delete('team')
      } else {
        searchParams.set('team', nyttTeam)
      }

      setSearchParams(searchParams, {
        preventScrollReset: true,
      })
    }
    }>
      <option value="">Alle team</option>
      {Object.keys(Team).map((teamKey) => (
        <option key={teamKey} value={teamKey}>
          {getEnumValueByKey(Team, teamKey)}
        </option>
      ))}
    </Select>
  )
}

function VelgAksjonspunkt() {

  const [searchParams, setSearchParams] = useSearchParams()
  const team = searchParams.get('aksjonspunkt') as Team | null

  return (
    <Select size="small" label="Velg aksjonspunkt" defaultValue={team || undefined} onChange={(value) => {
      const nyttAksjonspunkt = value.target.value
      if (nyttAksjonspunkt === '') {
        searchParams.delete('aksjonspunkt')
      } else {
        searchParams.set('aksjonspunkt', nyttAksjonspunkt)
      }

      setSearchParams(searchParams, {
        preventScrollReset: true,
      })
    }
    }>
      <option value="">Alle aksjonspunkt</option>
      {muligeAksjonspunkt.map((aksjonspunkt) => (
        <option key={aksjonspunkt} value={aksjonspunkt}>
          {aksjonspunkt}
        </option>
      ))}
    </Select>
  )
}


function AutoReloadUttrekkStatus({ behandlingId, uttrekkStatus, setUttrekkStatus, shouldAutoReload }: {
  behandlingId: string | null,
  uttrekkStatus: LaasteVedtakUttrekkStatus | null,
  setUttrekkStatus: (status: LaasteVedtakUttrekkStatus) => void,
  shouldAutoReload: boolean
}) {
  const fetcher = useFetcher()

  useEffect(() => {
    if (fetcher.data !== null) {
      setUttrekkStatus(fetcher.data as LaasteVedtakUttrekkStatus)
    }
  }, [fetcher.data, setUttrekkStatus])

  useEffect(() => {
    if (behandlingId === null || !shouldAutoReload) {
      return
    }

    function oppdaterUttrekkStatus() {
      const uttrekkStatus = fetcher.data as LaasteVedtakUttrekkStatus | null

      if (uttrekkStatus?.isFerdig || uttrekkStatus?.isFeilet) {
        clearInterval(interval)
        location.reload()
      } else {
        if (fetcher.state === 'idle') fetcher.load(`/laaste-vedtak/uttrekkStatus?behandlingId=${behandlingId}`)
      }
    }

    const interval = setInterval(() => oppdaterUttrekkStatus(), 1000)

    return () => {
      clearInterval(interval)
    }
  }, [behandlingId, uttrekkStatus?.isFeilet, uttrekkStatus?.isFerdig, fetcher])

  return null
}

export async function getLaasteVedtakSummary(
  accessToken: string,
  team: string | null,
  aksjonspunkt: string | null,
): Promise<LaasteVedtakUttrekkSummary> {

  const url = new URL(`${env.penUrl}/api/behandling/laaste-vedtak`)
  if (team !== null) {
    url.searchParams.append('team', team)
  }
  if (aksjonspunkt !== null) {
    url.searchParams.append('aksjonspunkt', aksjonspunkt)
  }
  const response = await fetch(
    url.toString(),
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




