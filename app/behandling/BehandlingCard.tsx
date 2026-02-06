import {
  BankNoteIcon,
  ClockDashedIcon,
  CogFillIcon,
  CogIcon,
  ExternalLinkIcon,
  InboxDownIcon,
  PersonIcon,
  PlayIcon,
  PrinterSmallIcon,
  ReceiptIcon,
  SandboxIcon,
  TasklistIcon,
  XMarkOctagonIcon,
} from '@navikt/aksel-icons'
import {
  BodyLong,
  Box,
  Button,
  CopyButton,
  DatePicker,
  Detail,
  Heading,
  HGrid,
  HStack,
  Link,
  Loader,
  Modal,
  Page,
  ProgressBar,
  Select,
  Tabs,
  Tooltip,
  VStack,
} from '@navikt/ds-react'
import { Suspense, useMemo, useRef, useState } from 'react'
import { Await, NavLink, Outlet, useFetcher, useLocation, useNavigate } from 'react-router'
import { OPERATION } from '~/behandling/behandling.$behandlingId'
import type { MeResponse } from '~/brukere/brukere'
import { formatIsoTimestamp } from '~/common/date'
import { decodeBehandlingStatus } from '~/common/decode'
import { decodeBehandling } from '~/common/decodeBehandling'
import type { Team } from '~/common/decodeTeam'
import { replaceTemplates } from '~/common/replace-templates'
import AnsvarligTeamSelector from '~/components/behandling/AnsvarligTeamSelector'
import SendTilManuellMedKontrollpunktModal from '~/components/behandling/SendTilManuellMedKontrollpunktModal'
import { BehandlingBatchDetaljertFremdriftBarChart } from '~/components/behandling-batch-fremdrift/BehandlingBatchDetaljertFremdriftBarChart'
import { Entry } from '~/components/entry/Entry'
import { harRolle } from '~/components/venstre-meny/VenstreMeny'
import type { BehandlingDto, DetaljertFremdriftDTO } from '~/types'

export interface Props {
  aldeBehandlingUrlTemplate?: string
  behandling: BehandlingDto
  detaljertFremdrift?: Promise<DetaljertFremdriftDTO | undefined | null> | null
  me: MeResponse
  psakSakUrlTemplate: string
}

export default function BehandlingCard(props: Props) {
  const fetcher = useFetcher()
  const location = useLocation()
  const navigate = useNavigate()

  const stopModal = useRef<HTMLDialogElement>(null)
  const fortsettModal = useRef<HTMLDialogElement>(null)
  const sendTilManuellMedKontrollpunktModal = useRef<HTMLDialogElement>(null)
  const sendTilOppdragPaNyttModal = useRef<HTMLDialogElement>(null)

  function beregnFremdriftProsent(ferdig: number, totalt: number): string {
    if (ferdig === totalt) {
      return '100'
    } else {
      const prosent = ((ferdig / totalt) * 100).toFixed(2)
      if (prosent === '100.00') {
        return '99.99'
      } else {
        return prosent
      }
    }
  }

  function oppdaterAnsvarligTeam(team: Team) {
    fetcher.submit(
      {
        ansvarligTeam: team,
        operation: OPERATION.oppdaterAnsvarligTeam,
      },
      {
        method: 'POST',
      },
    )
  }

  function stopp() {
    fetcher.submit(
      {
        operation: OPERATION.stopp,
      },
      {
        method: 'POST',
      },
    )

    stopModal.current?.close()
  }

  function sendTilManuellMedKontrollpunkt(kontrollpunkt: string) {
    fetcher.submit(
      {
        kontrollpunkt: kontrollpunkt,
        operation: OPERATION.sendTilManuellMedKontrollpunkt,
      },
      {
        method: 'POST',
      },
    )

    sendTilManuellMedKontrollpunktModal.current?.close()
  }

  function sendTilOppdragPaNytt() {
    fetcher.submit(
      {
        operation: OPERATION.sendTilOppdragPaNytt,
      },
      {
        method: 'POST',
      },
    )

    sendTilOppdragPaNyttModal.current?.close()
  }

  function hasLink(rel: string) {
    return props.behandling._links?.[rel]
  }

  function debugButton() {
    if (hasLink('fjernFraDebug')) {
      return (
        <Tooltip content="Avslutt debugging slik at behandlingen forsetter automatisk">
          <fetcher.Form method="post">
            <Button
              variant={'secondary'}
              icon={<SandboxIcon aria-hidden />}
              name="operation"
              value={OPERATION.fjernFraDebug}
            >
              Fjern fra debug
            </Button>
          </fetcher.Form>
        </Tooltip>
      )
    } else if (hasLink('taTilDebug')) {
      return (
        <Tooltip content="Pause automatisk behandling slik at behandlingen kan kjøres i debugger lokalt">
          <fetcher.Form method="post">
            <Button
              variant={'secondary'}
              icon={<SandboxIcon aria-hidden />}
              name="operation"
              value={OPERATION.taTilDebug}
            >
              Ta til debug
            </Button>
          </fetcher.Form>
        </Tooltip>
      )
    }
  }

  function sendTilOppdragPaNyttButton() {
    if (hasLink('sendOppdragsmeldingPaNytt')) {
      return (
        <>
          <Tooltip content="Sender melding til oppdrag på nytt">
            <Button
              variant="secondary"
              icon={<BankNoteIcon aria-hidden />}
              onClick={() => sendTilOppdragPaNyttModal.current?.showModal()}
            >
              Send melding til oppdrag på nytt
            </Button>
          </Tooltip>
          <Modal ref={sendTilOppdragPaNyttModal} header={{ heading: 'Send melding til oppdrag på nytt' }}>
            <Modal.Body>
              <BodyLong>
                Ønsker du virkerlig å sende melding til oppdrag på nytt? Dette skal kun gjøres når man har bekreftet med
                #utbetaling at meldingen fra Pen til Oppdragssystemet er borte
              </BodyLong>
            </Modal.Body>
            <Modal.Footer>
              <fetcher.Form method="post">
                <Button type="button" variant="danger" onClick={sendTilOppdragPaNytt}>
                  Send til oppdrag på nytt
                </Button>
              </fetcher.Form>
              <Button type="button" variant="secondary" onClick={() => sendTilOppdragPaNyttModal.current?.close()}>
                Avbryt
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )
    }
  }

  function fortsettBehandling(planlagtStartet: string | null) {
    if (hasLink('fortsett')) {
      return (
        <>
          {planlagtStartet ? (
            <>
              <Tooltip content="Fjerner utsatt tidspunkt og planlagt startet tidspunkt slik at behandling kan kjøres umiddelbart">
                <Button
                  variant={'secondary'}
                  icon={<PlayIcon aria-hidden />}
                  onClick={() => fortsettModal.current?.showModal()}
                >
                  Fortsett
                </Button>
              </Tooltip>
              <Modal ref={fortsettModal} header={{ heading: 'Fortsett behandling' }}>
                <Modal.Body>
                  <BodyLong>
                    Dette er en behandling planlagt kjørt <strong>{formatIsoTimestamp(planlagtStartet)}</strong>. Vil du
                    kjøre den nå med en gang? Denne handlingen kan ikke angres.
                  </BodyLong>
                </Modal.Body>
                <Modal.Footer>
                  <fetcher.Form method="post">
                    <input hidden readOnly name="operation" value={OPERATION.fortsett} />

                    <input type="hidden" name="nullstillPlanlagtStartet" value="true" />
                    <Button variant={'primary'} icon={<PlayIcon aria-hidden />} name={'fortsett'}>
                      Kjør planlagt startet behandling nå
                    </Button>
                  </fetcher.Form>
                  <Button type="button" variant="secondary" onClick={() => fortsettModal.current?.close()}>
                    Avbryt
                  </Button>
                </Modal.Footer>
              </Modal>
            </>
          ) : (
            <Tooltip content="Fjerner utsatt tidspunkt slik at behandling kan kjøres umiddelbart">
              <fetcher.Form method="post">
                <Button
                  variant={'secondary'}
                  icon={<PlayIcon aria-hidden />}
                  name="operation"
                  value={OPERATION.fortsett}
                >
                  Fortsett
                </Button>
              </fetcher.Form>
            </Tooltip>
          )}
        </>
      )
    }
  }

  function godkjennOpprettelse() {
    if (hasLink('godkjennOpprettelse')) {
      return (
        <Tooltip content="Godkjenner opprettelse av behandlingen slik at prosessering starter">
          <fetcher.Form method="post">
            <Button
              variant={'secondary'}
              icon={<PlayIcon aria-hidden />}
              name="operation"
              value={OPERATION.godkjennOpprettelse}
            >
              Godkjenn opprettelse
            </Button>
          </fetcher.Form>
        </Tooltip>
      )
    }
  }

  function fortsettAvhengigeBehandlinger() {
    if (hasLink('fortsettAvhengigeBehandlinger')) {
      return (
        <Tooltip content="Fjerner utsatt tidspunkt på de avhengige behandlingene slik at de kan kjøres umiddelbart">
          <fetcher.Form method="post">
            <Button
              variant={'secondary'}
              icon={<PlayIcon aria-hidden />}
              name="operation"
              value={OPERATION.fortsettAvhengigeBehandlinger}
            >
              Fortsett avhengige behandlinger
            </Button>
          </fetcher.Form>
        </Tooltip>
      )
    }
  }

  function runButton() {
    if (hasLink('runBehandling')) {
      return (
        <Tooltip content="Kjører behandlingen lokalt">
          <fetcher.Form method="post">
            <Button
              variant={'secondary'}
              icon={<CogFillIcon aria-hidden />}
              name="operation"
              value={OPERATION.runBehandling}
            >
              Kjør lokalt
            </Button>
          </fetcher.Form>
        </Tooltip>
      )
    }
  }

  function stoppButton() {
    if (hasLink('stopp')) {
      return (
        <>
          <Tooltip content="Stopper behandlingen, skal kun gjøres om feil ikke kan løses på annen måte">
            <Button
              variant={'danger'}
              icon={<XMarkOctagonIcon aria-hidden />}
              onClick={() => stopModal.current?.showModal()}
            >
              Stopp behandling
            </Button>
          </Tooltip>

          <Modal ref={stopModal} header={{ heading: 'Stopp behandling' }}>
            <Modal.Body>
              <BodyLong>
                Ønsker du virkerlig å stoppe denne behandlingen. Saken, kravet, vedtaket eller liknende, som
                behandlinger er knyttet til må mest sannsynlig rapporteres til linja. Stopping av en behandling skal kun
                gjøres om feil ikke kan løses på annen måte. Denne handlingen kan ikke angres
              </BodyLong>
            </Modal.Body>
            <Modal.Footer>
              <fetcher.Form method="post" action="taTilDebug">
                <Button type="button" variant="danger" onClick={stopp}>
                  Stopp behandling
                </Button>
              </fetcher.Form>
              <Button type="button" variant="secondary" onClick={() => stopModal.current?.close()}>
                Avbryt
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )
    }
  }

  function copyPasteEntry(name: string, value: string | number | null) {
    if (value) {
      return (
        <Entry labelText={`${name}`}>
          <HStack align="start">
            {value}
            <Tooltip content={`Kopier ${name}`}>
              <CopyButton copyText={value.toString()} size={'xsmall'} />
            </Tooltip>
          </HStack>
        </Entry>
      )
    }
  }

  const getCurrentChild = () => {
    const childPath = location.pathname.split('/').slice(-1)[0]
    if (childPath === '' || !Number.isNaN(+childPath)) {
      return 'kjoringer'
    } else {
      return childPath
    }
  }

  function toBehandlingDiscriminator(type: string) {
    switch (type) {
      case 'PersonAjourholdBehandling':
        return 'PersonAjourhold'
      case 'AvsluttSakerBehandling':
        return 'AvsluttSaker'
      case 'KontrollerOppgaverBehandling':
        return 'KontrollerOppgaver'
      case 'FodselsdatoAjourholdBehandling':
        return 'FodselsdatoAjourhold'
      case 'IdentAjourholdBehandling':
        return 'IdentAjourhold'
      case 'DagligAvstemmingBehandling':
        return 'DagligAvstemming'
      case 'ManedligAvstemmingBehandling':
        return 'ManedligAvstemming'
      case 'E500FilleveringBatchBehandling':
        return 'E500Fillevering'
      default:
        return type
    }
  }

  return (
    <Page>
      <Heading size={'large'}>
        {decodeBehandling(props.behandling.type)}
        <Detail>{props.behandling.type}</Detail>
      </Heading>
      <VStack gap={'4'}>
        <HGrid
          gap={props.detaljertFremdrift !== null ? 'space-24' : undefined}
          columns={{ xl: 1, '2xl': props.detaljertFremdrift !== null ? 2 : 1 }}
        >
          <Box.New
            background={'raised'}
            borderRadius={'xlarge'}
            borderWidth={'1'}
            borderColor={'neutral-subtleA'}
            padding={'4'}
          >
            <HGrid columns={{ md: 2, lg: 3, xl: props.detaljertFremdrift ? 3 : 4 }} gap="space-24">
              {copyPasteEntry('BehandlingId', props.behandling.behandlingId)}
              {props.behandling.forrigeBehandlingId && (
                <Entry labelText={'Opprettet av behandling'}>
                  <Link as={NavLink} to={`/behandling/${props.behandling.forrigeBehandlingId}`}>
                    {props.behandling.forrigeBehandlingId}
                  </Link>
                </Entry>
              )}
              <Entry labelText={'Status'}>{decodeBehandlingStatus(props.behandling.status)}</Entry>
              <Await resolve={props.detaljertFremdrift}>
                {(detaljertFremdrift) =>
                  detaljertFremdrift && (
                    <Entry labelText={'Fremdrift'}>
                      <Tooltip
                        content={`${beregnFremdriftProsent(detaljertFremdrift.ferdig, detaljertFremdrift.totalt)} % ferdig`}
                      >
                        <ProgressBar
                          value={+beregnFremdriftProsent(detaljertFremdrift.ferdig, detaljertFremdrift.totalt)}
                          valueMax={100}
                          size={'large'}
                          aria-labelledby="progress-bar-fremdrift"
                        ></ProgressBar>
                      </Tooltip>
                    </Entry>
                  )
                }
              </Await>

              <Entry labelText={'Ansvarlig team'}>
                <AnsvarligTeamSelector
                  ansvarligTeam={props.behandling.ansvarligTeam}
                  onAnsvarligTeamChange={oppdaterAnsvarligTeam}
                />
              </Entry>
              <Entry labelText={'Funksjonell identifikator'}>{props.behandling.funksjonellIdentifikator}</Entry>

              {props.behandling.stoppet && (
                <Entry labelText={'Stoppet'}>{formatIsoTimestamp(props.behandling.stoppet)}</Entry>
              )}
              <Entry labelText={'Prioritet'}>{props.behandling.prioritet}</Entry>

              <Entry labelText={'Opprettet'}>{formatIsoTimestamp(props.behandling.opprettet)}</Entry>
              {props.behandling.opprettetAv && <Entry labelText={'Opprettet av'}>{props.behandling.opprettetAv}</Entry>}
              <Entry labelText={'Siste kjøring'}>{formatIsoTimestamp(props.behandling.sisteKjoring)}</Entry>
              {props.behandling.ferdig ? (
                <Entry labelText={'Ferdig'}>{formatIsoTimestamp(props.behandling.ferdig)}</Entry>
              ) : (
                <Entry labelText={'Utsatt til'}>{formatIsoTimestamp(props.behandling.utsattTil)}</Entry>
              )}
              {props.behandling.slettes && (
                <Entry labelText={'Slettes'}>{formatIsoTimestamp(props.behandling.slettes)}</Entry>
              )}
              {props.behandling.planlagtStartet && (
                <Entry labelText={'Planlagt kjøring frem i tid'}>
                  {formatIsoTimestamp(props.behandling.planlagtStartet)}
                </Entry>
              )}

              {copyPasteEntry('Fødselsnummer', props.behandling.fnr)}
              {copyPasteEntry('SakId', props.behandling.sakId)}
              {copyPasteEntry('KravId', props.behandling.kravId)}
              {copyPasteEntry('VedtakId', props.behandling.vedtakId)}
              {copyPasteEntry('JournalpostId', props.behandling.journalpostId)}

              {props.behandling.parametere &&
                Object.entries(props.behandling.parametere).map(([key, value]) => {
                  return (
                    <Entry key={key} labelText={`${key}`}>
                      {value as string}
                    </Entry>
                  )
                })}
            </HGrid>
          </Box.New>
          <HStack gap="space-16">
            {props.detaljertFremdrift && (
              <Page.Block>
                <Box.New
                  background={'raised'}
                  borderRadius={'xlarge'}
                  borderWidth={'1'}
                  borderColor={'neutral-subtleA'}
                  padding={'4'}
                >
                  <Suspense fallback={<Loader size="3xlarge" title="Venter..." />}>
                    <Await resolve={props.detaljertFremdrift}>
                      {(detaljertFremdrift) =>
                        detaljertFremdrift && (
                          <BehandlingBatchDetaljertFremdriftBarChart detaljertFremdrift={detaljertFremdrift} />
                        )
                      }
                    </Await>
                  </Suspense>
                </Box.New>
              </Page.Block>
            )}
          </HStack>
        </HGrid>
        <HStack gap="space-16">
          <Button size="small" variant="tertiary">
            <Link href={props.behandling.kibanaUrl} target="_blank" rel="noopener noreferrer">
              Se logger i Kibana
              <ExternalLinkIcon title={'Se logger i Kibana'} />
            </Link>
          </Button>
          {props.behandling.sakId && (
            <Button size="small" variant="tertiary">
              <Link
                href={replaceTemplates(props.psakSakUrlTemplate, { sakId: props.behandling.sakId })}
                target="_blank"
                rel="noopener noreferrer"
              >
                Åpne i Psak
                <ExternalLinkIcon title={'Åpne i Psak'} />
              </Link>
            </Button>
          )}
          {props.aldeBehandlingUrlTemplate !== undefined && props.behandling.erAldeBehandling === true && (
            <Button size="small" variant="tertiary">
              <Link
                href={replaceTemplates(props.aldeBehandlingUrlTemplate, {
                  behandlingId: props.behandling.behandlingId,
                })}
                target="_blank"
                rel="noopener noreferrer"
              >
                Åpne i Alde
                <ExternalLinkIcon title={'Åpne i Alde'} />
              </Link>
            </Button>
          )}
        </HStack>

        <HStack gap="space-16">
          {fortsettBehandling(props.behandling.planlagtStartet)}

          {godkjennOpprettelse()}

          {fortsettAvhengigeBehandlinger()}

          {props.behandling.behandlingKjoringer.length === 0 && (
            <EndrePlanlagtStartetButton planlagtStartet={props.behandling.planlagtStartet} />
          )}

          {debugButton()}

          {sendTilOppdragPaNyttButton()}

          {stoppButton()}

          {props.behandling.behandlingSerieId !== null && (
            <Button
              variant="tertiary"
              icon={<ExternalLinkIcon aria-hidden />}
              onClick={() =>
                navigate(`/behandlingserie?behandlingType=${toBehandlingDiscriminator(props.behandling.type)}`)
              }
            >
              Gå til behandlingserie
            </Button>
          )}

          {hasLink('sendTilManuellMedKontrollpunkt') && (
            <SendTilManuellMedKontrollpunktModal
              sendTilManuellMedKontrollpunkt={sendTilManuellMedKontrollpunkt}
              modalRef={sendTilManuellMedKontrollpunktModal}
              behandling={props.behandling}
            ></SendTilManuellMedKontrollpunktModal>
          )}

          {runButton()}
        </HStack>
      </VStack>

      <Box.New
        background={'raised'}
        style={{ padding: '6px', marginTop: '12px' }}
        borderColor={'neutral-subtle'}
        borderWidth={'1'}
        borderRadius={'medium'}
        shadow={'dialog'}
      >
        <Tabs
          value={getCurrentChild()}
          onChange={(value) => {
            const prefix = `/behandling/${props.behandling.behandlingId}`
            if (value === 'kjoringer') {
              navigate(prefix)
            } else {
              navigate(`${prefix}/${encodeURIComponent(value)}`)
            }
          }}
        >
          <Tabs.List>
            <Tabs.Tab value="kjoringer" label="Kjøringer" icon={<CogIcon />} />
            <Tabs.Tab value="aktiviteter" label="Aktiviteter" icon={<TasklistIcon />} />
            {props.behandling._links?.avhengigeBehandlinger && (
              <Tabs.Tab value="avhengigeBehandlinger" label="Avhengige behandlinger" icon={<ClockDashedIcon />} />
            )}
            <Tabs.Tab value="ikkeFullforteAktiviteter" label="Uferdige aktiviteter" icon={<TasklistIcon />} />
            {props.behandling._links?.input && <Tabs.Tab value="input" label="Input" icon={<InboxDownIcon />} />}
            {props.behandling._links?.output && <Tabs.Tab value="output" label="Output" icon={<TasklistIcon />} />}
            {props.behandling._links?.uttrekk && (
              <Tabs.Tab value="uttrekk" label="Uttrekk" icon={<PrinterSmallIcon />} />
            )}
            {props.behandling.gruppeId && (
              <Tabs.Tab
                value="relaterteFamiliebehandlinger"
                label="Relaterte Familiebehandlinger"
                icon={<TasklistIcon />}
              />
            )}
            {props.behandling._links?.oppdragsmelding && (
              <Tabs.Tab value="oppdragsmelding" label="Oppdragsmelding" icon={<TasklistIcon />} />
            )}
            {props.behandling._links?.oppdragskvittering && (
              <Tabs.Tab value="oppdragskvittering" label="Oppdragskvittering" icon={<TasklistIcon />} />
            )}
            <Tabs.Tab value="manuelleOppgaver" label="Manuelle oppgaver" icon={<PersonIcon />} />
            <Tabs.Tab value="behandlingManuellOpptelling" label="Oppgaveoppsummering" icon={<TasklistIcon />} />
            {props.detaljertFremdrift && (
              <Tabs.Tab value="detaljertFremdrift" label="Detaljert fremdrift" icon={<TasklistIcon />} />
            )}
            <Tabs.Tab value="logs" label="Applikasjonslogg" icon={<ReceiptIcon />} />
            {harRolle(props.me, 'VERDANDE_ADMIN') && (
              <Tabs.Tab value="audit" label="Revisjonslogg" icon={<ReceiptIcon />} />
            )}
          </Tabs.List>
          <Outlet />
        </Tabs>
      </Box.New>
    </Page>
  )
}

export function EndrePlanlagtStartetButton({ planlagtStartet }: { planlagtStartet?: string | null }) {
  const pad = (n: number) => String(n).padStart(2, '0')
  const formatDDMMYYYY = (d?: Date) => (d ? `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}` : '')

  const parseDDMMYYYY = (s: string): Date | null => {
    const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s)
    if (!m) return null
    const d = parseInt(m[1], 10)
    const mo = parseInt(m[2], 10)
    const y = parseInt(m[3], 10)
    const dt = new Date(y, mo - 1, d)
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null
    return dt
  }

  const toIsoLocal = (date: Date, timeHHmm?: string) => {
    let hh = '00',
      mm = '00'
    if (timeHHmm && /^\d{2}:\d{2}$/.test(timeHHmm)) {
      ;[hh, mm] = timeHHmm.split(':')
    }
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${hh}:${mm}:00`
  }

  const initialDate = useMemo(() => {
    if (!planlagtStartet) return undefined
    const [ymd] = planlagtStartet.split('T')
    const [y, m, d] = (ymd ?? '').split('-').map(Number)
    if (!y || !m || !d) return undefined
    return new Date(y, m - 1, d) // lokal dato uten TZ-krøll
  }, [planlagtStartet])

  const initialTime = useMemo(() => {
    const t = planlagtStartet?.split('T')[1]?.slice(0, 5) // "HH:mm"
    return t && /^\d{2}:\d{2}$/.test(t) ? t : ''
  }, [planlagtStartet])

  const timer = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  const kvarter = ['00', '15', '30', '45']

  const [open, setOpen] = useState(false)
  const [dato, setDato] = useState<Date | undefined>(initialDate)
  const [tid, setTid] = useState<string>(initialTime)
  const [inputValue, setInputValue] = useState<string>(formatDDMMYYYY(initialDate))
  const [inputError, setInputError] = useState<string | undefined>(undefined)
  const fetcher = useFetcher()

  const handleSelect = (d?: Date) => {
    setDato(d ?? undefined)
    setInputValue(formatDDMMYYYY(d ?? initialDate))
    setInputError(undefined)
  }

  const handleInputChange = (v: string) => {
    setInputValue(v)
    if (v.length === 10) {
      const parsed = parseDDMMYYYY(v)
      if (parsed) {
        setDato(parsed)
        setInputError(undefined)
      } else {
        setInputError('Ugyldig dato')
      }
    } else {
      setInputError(undefined)
    }
  }

  const handleLagre = () => {
    if (!dato) return
    const fd = new FormData()
    fd.set('operation', OPERATION.endrePlanlagtStartet)
    fd.set('nyPlanlagtStartet', toIsoLocal(dato, tid))
    fetcher.submit(fd, { method: 'post' })
    setOpen(false)
  }

  return (
    <>
      <Tooltip content="Endrer planlagt startet dato på behandlingen">
        <Button
          type="button"
          variant="secondary"
          icon={<PlayIcon aria-hidden />}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setOpen(true)
            setInputValue(formatDDMMYYYY(dato ?? initialDate))
            setInputError(undefined)
          }}
        >
          Endre planlagt startet
        </Button>
      </Tooltip>
      <Modal
        open={open}
        header={{ heading: 'Endre planlagt startet' }}
        onClose={() => {
          setOpen(false)
          setDato(initialDate)
          setTid(initialTime)
          setInputValue(formatDDMMYYYY(initialDate))
          setInputError(undefined)
        }}
      >
        <Modal.Body>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <DatePicker
              mode="single"
              selected={dato}
              defaultSelected={initialDate}
              defaultMonth={dato ?? initialDate}
              onSelect={handleSelect}
            >
              <DatePicker.Input
                label="Ny planlagt startdato"
                placeholder="dd.mm.åååå"
                value={inputValue}
                error={inputError}
                onChange={(e) => handleInputChange(e.target.value)}
              />
            </DatePicker>

            <HStack gap="4">
              <Select
                label="Time"
                value={tid.split(':')[0] ?? ''}
                onChange={(e) => setTid(`${e.target.value}:${tid.split(':')[1] || '00'}`)}
              >
                <option value="">Velg time</option>
                {timer.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>

              <Select
                label="Minutt"
                value={tid.split(':')[1] ?? ''}
                onChange={(e) => setTid(`${tid.split(':')[0] || '00'}:${e.target.value}`)}
              >
                <option value="">Velg minutt</option>
                {kvarter.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </Select>
            </HStack>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="button"
            variant="primary"
            onClick={handleLagre}
            disabled={!dato || !!inputError || fetcher.state !== 'idle'}
          >
            {fetcher.state === 'idle' ? 'Lagre' : 'Lagrer...'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setOpen(false)
              setDato(initialDate)
              setTid(initialTime)
              setInputValue(formatDDMMYYYY(initialDate))
              setInputError(undefined)
            }}
          >
            Avbryt
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
