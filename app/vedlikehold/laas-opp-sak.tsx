import {
  CheckmarkCircleIcon,
  CogRotationIcon,
  ExclamationmarkTriangleIcon,
  XMarkOctagonIcon,
} from '@navikt/aksel-icons'
import {
  Alert,
  BodyLong,
  Button,
  Checkbox,
  Detail,
  Heading,
  HStack,
  List,
  Loader,
  Modal,
  Table,
  TextField,
  Tooltip,
  VStack,
} from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import type { LoaderFunctionArgs } from 'react-router'
import { Form, Link, useFetcher, useLoaderData, useNavigation, useSearchParams } from 'react-router'
import { decodeBehandling } from '~/common/decodeBehandling'
import { toNormalizedError } from '~/common/error'
import { Entry } from '~/components/entry/Entry'
import { requireAccessToken } from '~/services/auth.server'
import { logger } from '~/services/logger.server'
import type { LaasOppBehandlingSummary, LaasOppResultat, VedtakLaasOpp } from '~/vedlikehold/laas-opp.types'
import type { VedtakYtelsekomponenter } from '~/vedlikehold/laaste-vedtak.types'
import { hentSak } from '~/vedlikehold/vedlikehold.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const sakId = url.searchParams.get('sakId')

  if (!sakId) {
    return {}
  }

  const accessToken = await requireAccessToken(request)

  try {
    const sak = await hentSak(accessToken, sakId)
    return { sak }
  } catch (err) {
    const normalizedError = toNormalizedError(err)

    if (normalizedError?.status === 404) {
      return { error: 'Fant ikke sak' }
    }

    logger.error(normalizedError, `Feil ved henting av sak: ${sakId}`)
    return {
      error: `${normalizedError?.status}: ${normalizedError?.message ?? normalizedError?.title ?? 'Ukjent feil'}`,
    }
  }
}

export default function LaasteVedtakPage() {
  const { sak, error } = useLoaderData<typeof loader>()
  const [laasOppVedtak, setLaasOppVedtak] = useState<VedtakLaasOpp | null>(null)
  const [kravTilManuell, setKravTilManuell] = useState<string | null>(null)
  const [verifiserOppdragsmeldingManuelt, setVerifiserOppdragsmeldingManuelt] = useState<VedtakLaasOpp | null>(null)

  return (
    <div>
      <VStack gap="5">
        <HStack>
          <Heading size="large">Lås opp sak</Heading>
        </HStack>
        <VStack gap="4">
          <HentSakInput />
          {error && (
            <Alert variant="error" size="small">
              {error}
            </Alert>
          )}
        </VStack>
        <HStack>
          {sak !== undefined && sak !== null && (
            <VStack gap="5">
              <HStack gap="4" align="end" justify="start">
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
                              <HStack gap="3">
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
              {sak !== null && sak.automatiskeKravUtenVedtak.length > 0 && (
                <>
                  <Heading size="medium">Automatiske krav uten vedtak</Heading>
                  <HStack>
                    <Table size="small" zebraStripes>
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
      </VStack>
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
    </div>
  )
}

function HentSakInput() {
  const navigation = useNavigation()
  const [searchParams] = useSearchParams()
  const sakIdParam = searchParams.get('sakId')
  const [sakId, setSakId] = useState<string>(sakIdParam ?? '')

  useEffect(() => {
    setSakId(sakIdParam ?? '')
  }, [sakIdParam])

  return (
    <Form method="get">
      <HStack gap="2" align="end">
        <TextField name="sakId" label="Sak ID" value={sakId} onChange={(e) => setSakId(e.target.value)} />
        <Button loading={navigation.state !== 'idle' && navigation.formMethod === 'GET'} type="submit">
          Hent sak
        </Button>
      </HStack>
    </Form>
  )
}

function Behandlinger({ kravid, behandlinger }: { kravid: string; behandlinger: LaasOppBehandlingSummary[] }) {
  return (
    <VStack>
      {behandlinger.map((behandling) => (
        <HStack key={kravid + behandling.behandlingId} gap="1" align="center">
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
        action: 'settTilManuell',
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
    <Modal header={{ heading: 'Sett til manuell' }} open={true} onClose={onClose}>
      <Modal.Body>
        <VStack gap="5">
          <BodyLong>
            Er du sikker på at du vil sette kravet til manuell? Dette fører til merarbeid for saksbehandler, sørg for at
            fag er innvolvert og at saksbehandler får nødvendig informasjon.
          </BodyLong>
          <Heading size="small">Dette vil skje:</Heading>
          <List as="ul">
            <List.Item title="Behandling">Behandlinger vil bli stoppet.</List.Item>
            <List.Item title="Endring av behandlingstype">Kravet vil bli endret til manuell behandling.</List.Item>
          </List>
        </VStack>
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" loading={fetcher.state === 'submitting'} variant="danger" onClick={settTilManuell}>
          Sett til manuell
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
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
      location.reload()
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
            innvolvert og at saksbehandler får nødvendig informasjon.
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
              Det er en Iverksett Vedtak behandling på dette vedtaket. Dersom du låser opp, så må kravet feilregistreres
              og nytt krav må opprettes.
            </Alert>
          )}
        </VStack>
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" loading={fetcher.state === 'submitting'} variant="danger" onClick={laasOppVedtak}>
          Lås opp
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
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
    <Modal header={{ heading: 'Verifiser oppdragsmelding manuelt' }} open={true} onClose={onClose} width={1000}>
      <Modal.Body>
        <VStack gap="5">
          <BodyLong>
            Brukes dersom kvittering fra oppdrag ikke er mottatt og oppdrag er oppdatert. Må verifiseres manuelt.
          </BodyLong>

          {fetcher.state === 'loading' && (
            <HStack gap="2">
              <Loader size="small" /> <Detail>Henter ytelsekomponenter...</Detail>
            </HStack>
          )}

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
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </VStack>
      </Modal.Body>
      <Modal.Footer>
        <Button
          type="button"
          loading={submitFetcher.state === 'submitting'}
          disabled={fetcher.state === 'loading' || !oppdragsmeldingOk}
          onClick={verifiserOppdragsmeldingManuelt}
        >
          Iverksett vedtak
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>
          Avbryt
        </Button>
        <Checkbox
          value={oppdragsmeldingOk}
          onChange={() => setOppdragsmeldingOk(!oppdragsmeldingOk)}
          disabled={fetcher.state === 'loading'}
        >
          Oppdragsmelding er verifisert manuelt
        </Checkbox>
      </Modal.Footer>
    </Modal>
  )
}
