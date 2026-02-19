import {
  CheckmarkCircleIcon,
  CogRotationIcon,
  ExclamationmarkTriangleIcon,
  XMarkOctagonIcon,
} from '@navikt/aksel-icons'
import {
  Alert,
  BodyLong,
  BodyShort,
  Box,
  Button,
  Checkbox,
  CopyButton,
  Detail,
  Dialog,
  Heading,
  HGrid,
  HStack,
  List,
  Loader,
  Table,
  Tooltip,
  VStack,
} from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { isRouteErrorResponse, Link, useFetcher } from 'react-router'
import { decodeBehandling } from '~/common/decodeBehandling'
import { Entry } from '~/components/entry/Entry'
import { apiPost } from '~/services/api.server'
import type {
  LaasOppBehandlingSummary,
  LaasOppResultat,
  SakOppsummeringLaasOpp,
  VedtakLaasOpp,
} from '~/vedlikehold/laas-opp.types'
import type { VedtakYtelsekomponenter } from '~/vedlikehold/laaste-vedtak.types'
import type { Route } from './+types/laas-opp-sak.$sakId'

export const loader = async ({ params: { sakId }, request }: Route.LoaderArgs) => ({
  sak: await apiPost<SakOppsummeringLaasOpp>('/api/behandling/laas-opp/hentSak', { sakId }, request),
})

export default function LaasOppSakSakIdPage({ loaderData }: Route.ComponentProps) {
  const { sak } = loaderData
  const [laasOppVedtak, setLaasOppVedtak] = useState<VedtakLaasOpp | null>(null)
  const [kravTilManuell, setKravTilManuell] = useState<string | null>(null)
  const [verifiserOppdragsmeldingManuelt, setVerifiserOppdragsmeldingManuelt] = useState<VedtakLaasOpp | null>(null)

  return (
    <>
      <HStack>
        {!!sak && (
          <VStack gap="space-20">
            <HStack gap="space-16" align="end" justify="start">
              <Entry labelText={'Saktype'}>{sak.sakType}</Entry>
              <Entry labelText={'Sakstatus'}>{sak.sakStatus}</Entry>
            </HStack>
            {sak.vedtak.length === 0 && sak.automatiskeKravUtenVedtak.length === 0 && (
              <HStack>
                <Alert variant="info">Ingenting å låse opp</Alert>
              </HStack>
            )}
            {sak.vedtak.length > 0 && (
              <>
                <Heading size="medium">Vedtak til behandling</Heading>
                <HStack>
                  <Table size="small" zebraStripes>
                    <BodyShort as="caption" visuallyHidden>
                      Vedtak til behandling
                    </BodyShort>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>Vedtak ID</Table.ColumnHeader>
                        <Table.ColumnHeader>Krav ID</Table.ColumnHeader>
                        <Table.ColumnHeader>Krav gjelder</Table.ColumnHeader>
                        <Table.ColumnHeader>Vedtakstype</Table.ColumnHeader>
                        <Table.ColumnHeader>Vedtakstatus</Table.ColumnHeader>
                        <Table.ColumnHeader>Behandlinger</Table.ColumnHeader>
                        <Table.ColumnHeader></Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {sak.vedtak.map((vedtak) => (
                        <Table.Row key={vedtak.vedtakId}>
                          <Table.DataCell>{vedtak.vedtakId}</Table.DataCell>
                          <Table.DataCell>{vedtak.kravId}</Table.DataCell>
                          <Table.DataCell>{vedtak.kravGjelder}</Table.DataCell>
                          <Table.DataCell>{vedtak.vedtaksType}</Table.DataCell>
                          <Table.DataCell>{vedtak.vedtakStatus}</Table.DataCell>
                          <Table.DataCell>
                            <Behandlinger kravid={vedtak.kravId} behandlinger={vedtak.behandlinger} />
                          </Table.DataCell>
                          <Table.DataCell>
                            <HStack gap="space-12">
                              {vedtak.opplaasVedtakInformasjon?.erAutomatisk && (
                                <Button
                                  onClick={() => setKravTilManuell(vedtak.kravId)}
                                  variant="secondary"
                                  size="small"
                                >
                                  Sett til manuell
                                </Button>
                              )}
                              {vedtak.isLaast && (
                                <Button onClick={() => setLaasOppVedtak(vedtak)} variant="secondary" size="small">
                                  Lås opp
                                </Button>
                              )}
                              {(vedtak.vedtakStatus === 'Samordnet' ||
                                vedtak.vedtaksType === 'Regulering av pensjon') && (
                                <Button
                                  onClick={() => setVerifiserOppdragsmeldingManuelt(vedtak)}
                                  variant="secondary"
                                  size="small"
                                >
                                  Bekreft oppdragsmelding
                                </Button>
                              )}
                            </HStack>
                          </Table.DataCell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </HStack>
              </>
            )}
            {sak.automatiskeKravUtenVedtak.length > 0 && (
              <>
                <Heading size="medium">Automatiske krav uten vedtak</Heading>
                <HStack>
                  <Table size="small" zebraStripes>
                    <BodyShort as="caption" visuallyHidden>
                      Automatiske krav uten vedtak
                    </BodyShort>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>Krav ID</Table.ColumnHeader>
                        <Table.ColumnHeader>Krav gjelder</Table.ColumnHeader>
                        <Table.ColumnHeader>Krav status</Table.ColumnHeader>
                        <Table.ColumnHeader>Behandlinger</Table.ColumnHeader>
                        <Table.ColumnHeader></Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {sak.automatiskeKravUtenVedtak.map((krav) => (
                        <Table.Row key={krav.kravId}>
                          <Table.DataCell>{krav.kravId}</Table.DataCell>
                          <Table.DataCell>{krav.kravGjelder}</Table.DataCell>
                          <Table.DataCell>{krav.kravStatus}</Table.DataCell>
                          <Table.DataCell>
                            <Behandlinger kravid={krav.kravId} behandlinger={krav.behandlinger} />
                          </Table.DataCell>
                          <Table.DataCell>
                            <Button onClick={() => setKravTilManuell(krav.kravId)} variant="secondary" size="small">
                              Sett til manuell
                            </Button>
                          </Table.DataCell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </HStack>
              </>
            )}
          </VStack>
        )}
      </HStack>
      {laasOppVedtak !== null && <LaasOppVedtakModal vedtak={laasOppVedtak} onClose={() => setLaasOppVedtak(null)} />}
      {kravTilManuell !== null && (
        <SettTilManuellModal kravId={kravTilManuell} onClose={() => setKravTilManuell(null)} />
      )}
      {verifiserOppdragsmeldingManuelt !== null && (
        <VerifiserOppdragsmeldingManueltModal
          vedtak={verifiserOppdragsmeldingManuelt}
          onClose={() => setVerifiserOppdragsmeldingManuelt(null)}
        />
      )}
    </>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let errorData: {
    title: string
    code?: number
    message?: string
    stack?: string
  } = {
    title: 'Ukjent feil',
  }

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      errorData = {
        title: 'Beklager, vi fant ikke saken',
        message: 'Vennligst sjekk at du har riktig saksnummer og prøv igjen.',
      }
    } else {
      errorData = {
        code: error.status,
        title: error.statusText,
        message:
          error.data?.message ??
          'En teknisk feil på våre servere gjør at siden er utilgjengelig. Dette skyldes ikke noe du gjorde.',
        stack: error.data?.trace,
      }
    }
  } else if (error instanceof Error) {
    errorData = {
      title: 'En feil oppstod',
      message: error.message,
      stack: error.stack,
    }
  }

  return (
    <Box paddingBlock="space-24 space-64">
      <HGrid columns="minmax(auto,600px)" gap="space-16">
        <div>
          {errorData.code && (
            <BodyShort textColor="subtle" size="small">
              Statuskode {errorData.code}
            </BodyShort>
          )}
          <Heading level="1" size="large">
            {errorData.title}
          </Heading>
        </div>
        {errorData.message && <BodyShort>{errorData.message}</BodyShort>}
        {errorData.stack && (
          <details>
            <summary>Stack trace</summary>
            <Box paddingBlock="space-16 space-0">
              <CopyButton data-color="accent" text="Kopier stack trace" copyText={errorData.stack} />
              <pre className="mt-2 overflow-auto">{errorData.stack}</pre>
            </Box>
          </details>
        )}
      </HGrid>
    </Box>
  )
}

function Behandlinger({ kravid, behandlinger }: { kravid: string; behandlinger: LaasOppBehandlingSummary[] }) {
  return (
    <VStack>
      {behandlinger.map((behandling) => (
        <HStack key={kravid + behandling.behandlingId} gap="space-4" align="center">
          <Link to={`/behandling/${behandling.behandlingId}`} target="_blank">
            {decodeBehandling(behandling.type)}
          </Link>
          {behandling.isUnderBehandling && (
            <Tooltip content="Under behandling">
              <CogRotationIcon />
            </Tooltip>
          )}
          {behandling.isFerdig && (
            <Tooltip content="Ferdig">
              <CheckmarkCircleIcon color="green" />
            </Tooltip>
          )}
          {behandling.isFeilet && (
            <Tooltip content="Feilet">
              <ExclamationmarkTriangleIcon color="orange" />
            </Tooltip>
          )}
          {behandling.isStoppet && (
            <Tooltip content="Stoppet manuelt. Krav må låses opp">
              <XMarkOctagonIcon color="red" />
            </Tooltip>
          )}
        </HStack>
      ))}
    </VStack>
  )
}

function SettTilManuellModal({ kravId, onClose }: { kravId: string; onClose: () => void }) {
  const fetcher = useFetcher()

  function settTilManuell() {
    fetcher.submit(
      {
        kravId: kravId,
      },
      {
        action: '../settTilManuell',
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
      location.reload()
    } else {
      alert('Kunne ikke låse opp, teknisk feil.')
    }
  }, [fetcher?.data, onClose])

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Popup>
        <Dialog.Header>
          <Dialog.Title>Sett til manuell</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <VStack gap="space-20">
            <BodyLong>
              Er du sikker på at du vil sette kravet til manuell? Dette fører til merarbeid for saksbehandler, sørg for
              at fag er innvolvert og at saksbehandler får nødvendig informasjon.
            </BodyLong>
            <Heading size="small">Dette vil skje:</Heading>
            <List as="ul">
              <List.Item title="Behandling">Behandlinger vil bli stoppet.</List.Item>
              <List.Item title="Endring av behandlingstype">Kravet vil bli endret til manuell behandling.</List.Item>
            </List>
          </VStack>
        </Dialog.Body>
        <Dialog.Footer>
          <Button
            data-color="danger"
            type="button"
            loading={fetcher.state === 'submitting'}
            variant="primary"
            onClick={settTilManuell}
          >
            Sett til manuell
          </Button>
          <Dialog.CloseTrigger>
            <Button type="button" variant="secondary">
              Avbryt
            </Button>
          </Dialog.CloseTrigger>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog>
  )
}

function LaasOppVedtakModal({ vedtak, onClose }: { vedtak: VedtakLaasOpp; onClose: () => void }) {
  const fetcher = useFetcher()

  function laasOppVedtak() {
    fetcher.submit(
      {
        vedtakId: vedtak.vedtakId,
      },
      {
        action: '../laasOpp',
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
      location.reload()
    } else {
      alert('Kunne ikke låse opp, teknisk feil.')
    }
  }, [fetcher.data, onClose])

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Popup>
        <Dialog.Header>
          <Dialog.Title>Lås opp vedtak</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <VStack gap="space-20">
            <BodyLong>
              Er du sikker på at du vil låse opp vedtaket? Dette fører til merarbeid for saksbehandler, sørg for at fag
              er innvolvert og at saksbehandler får nødvendig informasjon.
            </BodyLong>
            <Heading size="small">Dette vil skje:</Heading>
            <List as="ul">
              {vedtak.opplaasVedtakInformasjon?.sammenstotendeVedtak !== null && (
                <List.Item title="Sammenstøtende vedtak">
                  Vedtaket har sammenstøtende vedtak i sak {vedtak.opplaasVedtakInformasjon?.sammenstotendeVedtak.sakId}
                  . Dette vedtaket må også låses opp.
                </List.Item>
              )}
              {vedtak.opplaasVedtakInformasjon?.harBehandling && (
                <List.Item title="Behandling">Vedtaket har en pågående behandling. Denne vil bli stoppet.</List.Item>
              )}
              {vedtak.opplaasVedtakInformasjon?.erAutomatisk && (
                <List.Item title="Automatisk vedtak">
                  Kravet har behandlings type automatisk. Det vil endret til manuell, oppgave blir opprettet.
                </List.Item>
              )}
              <List.Item title="Endring av vedtakstatus">Vedtakstatus vil bli endret til "Til Attestering"</List.Item>
            </List>
            {vedtak.behandlinger.some((b) => b.isFeilet) && (
              <Alert variant="warning">
                Obs!!! Denne saken har en behandling som har feilet teknisk, og det er derfor ikke sikkert det er riktig
                løsning å låse opp saken! En utvikler bør se på saken før du låser opp.
              </Alert>
            )}
            {vedtak.behandlinger.some((b) => b.type === 'IverksettVedtakBehandling') && (
              <Alert variant="warning">
                Det er en Iverksett Vedtak behandling på dette vedtaket. Dersom du låser opp, så må kravet
                feilregistreres og nytt krav må opprettes.
              </Alert>
            )}
          </VStack>
        </Dialog.Body>
        <Dialog.Footer>
          <Button
            data-color="danger"
            type="button"
            loading={fetcher.state === 'submitting'}
            variant="primary"
            onClick={laasOppVedtak}
          >
            Lås opp
          </Button>
          <Dialog.CloseTrigger>
            <Button type="button" variant="secondary">
              Avbryt
            </Button>
          </Dialog.CloseTrigger>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog>
  )
}

function VerifiserOppdragsmeldingManueltModal({ vedtak, onClose }: { vedtak: VedtakLaasOpp; onClose: () => void }) {
  const submitFetcher = useFetcher()
  const [oppdragsmeldingOk, setOppdragsmeldingOk] = useState(false)

  function verifiserOppdragsmeldingManuelt() {
    submitFetcher.submit(
      {
        vedtakId: vedtak.vedtakId,
      },
      {
        action: '/laaste-vedtak/bekreftOppdragsmeldingManuelt',
        method: 'POST',
        encType: 'application/json',
      },
    )
  }

  const fetcher = useFetcher()
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data === undefined)
      fetcher.load(`/laaste-vedtak/hentVedtakIOppdrag/${vedtak.vedtakId}`)
  }, [fetcher, vedtak.vedtakId])

  useEffect(() => {
    if (submitFetcher.state === 'idle' && submitFetcher.data === true) {
      onClose()
      location.reload()
    }
  }, [onClose, submitFetcher])

  const vedtakIOppdrag = fetcher.data as VedtakYtelsekomponenter | undefined

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Popup>
        <Dialog.Header>
          <Dialog.Title>Verifiser oppdragsmelding manuelt</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <VStack gap="space-20">
            <BodyLong>
              Brukes dersom kvittering fra oppdrag ikke er mottatt og oppdrag er oppdatert. Må verifiseres manuelt.
            </BodyLong>

            {fetcher.state === 'loading' && (
              <HStack gap="space-8">
                <Loader size="small" title="Henter data…" /> <Detail>Henter ytelsekomponenter...</Detail>
              </HStack>
            )}

            {vedtakIOppdrag !== undefined && (
              <Table size="small" zebraStripes>
                <BodyShort as="caption" visuallyHidden>
                  Ytelsekomponenter
                </BodyShort>
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
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
          </VStack>
        </Dialog.Body>
        <Dialog.Footer>
          <Button
            type="button"
            loading={submitFetcher.state === 'submitting'}
            disabled={fetcher.state === 'loading' || !oppdragsmeldingOk}
            onClick={verifiserOppdragsmeldingManuelt}
          >
            Iverksett vedtak
          </Button>
          <Dialog.CloseTrigger>
            <Button type="button" variant="secondary">
              Avbryt
            </Button>
          </Dialog.CloseTrigger>
          <Checkbox
            value={oppdragsmeldingOk}
            onChange={() => setOppdragsmeldingOk(!oppdragsmeldingOk)}
            disabled={fetcher.state === 'loading'}
          >
            Oppdragsmelding er verifisert manuelt
          </Checkbox>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog>
  )
}
