import { Link, useFetcher, useRevalidator, useSearchParams } from '@remix-run/react'
import {
  Alert,
  BodyLong,
  Button,
  Heading,
  HStack,
  List,
  Modal,
  Table,
  TextField,
  Tooltip,
  VStack,
} from '@navikt/ds-react'
import React, { useEffect, useState } from 'react'
import type {
  AutomatiskKravUtenVedtak,
  LaasOppBehandlingSummary,
  LaasOppResultat,
  SakOppsummeringLaasOpp,
  VedtakLaasOpp,
} from '~/laas-opp.types'
import { Entry } from '~/components/entry/Entry'
import { decodeBehandling } from '~/common/decodeBehandling'
import {
  CheckmarkCircleIcon,
  CogRotationIcon,
  ExclamationmarkTriangleIcon,
  XMarkOctagonIcon,
} from '@navikt/aksel-icons'


export default function LaasteVedtakPage() {

  const [sak, setSak] = useState<SakOppsummeringLaasOpp | undefined | null>(undefined)
  const [laasOppVedtak, setLaasOppVedtak] = useState<VedtakLaasOpp | null>(null)
  const [kravTilManuell, setKravTilManuell] = useState<AutomatiskKravUtenVedtak | null>(null)

  return (
    <div id="laaste_vedtak">
      <VStack gap="5">
        <HStack>
          <Heading size="large">Lås opp sak</Heading>
        </HStack>
        <HStack>
          <HentSakInput onLoad={setSak} />
        </HStack>
        <HStack>
          {sak != undefined && (
            <VStack gap="5">
              <HStack gap="4" align="end" justify="start">
                <Entry labelText={'Saktype'}>
                  {sak.sakType}
                </Entry>
                <Entry labelText={'Sakstatus'}>
                  {sak.sakStatus}
                </Entry>
              </HStack>
              {sak.vedtak.length === 0 && sak.automatiskeKravUtenVedtak.length === 0 && <HStack>
                <Alert variant="info">Ingenting å låse opp</Alert>
              </HStack>}
              {sak.vedtak.length > 0 && (<>
                <Heading size="medium">Vedtak til behandling</Heading>
                <HStack>
                  <Table
                    size="small"
                    zebraStripes>
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
                          <Table.DataCell>
                            {vedtak.vedtakId}
                          </Table.DataCell>
                          <Table.DataCell>
                            {vedtak.kravId}
                          </Table.DataCell>
                          <Table.DataCell>
                            {vedtak.kravGjelder}
                          </Table.DataCell>
                          <Table.DataCell>
                            {vedtak.vedtaksType}
                          </Table.DataCell>
                          <Table.DataCell>
                            {vedtak.vedtakStatus}
                          </Table.DataCell>
                          <Table.DataCell>
                            <Behandlinger kravid={vedtak.kravId} behandlinger={vedtak.behandlinger} />
                          </Table.DataCell>
                          <Table.DataCell>
                            {vedtak.isLaast &&
                              <Button onClick={() => setLaasOppVedtak(vedtak)} variant="secondary" size="small">Lås
                                opp</Button>}
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
                  <Table
                    size="small"
                    zebraStripes>
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
                          <Table.DataCell>
                            {krav.kravId}
                          </Table.DataCell>
                          <Table.DataCell>
                            {krav.kravGjelder}
                          </Table.DataCell>
                          <Table.DataCell>
                            {krav.kravStatus}
                          </Table.DataCell>
                          <Table.DataCell>
                            <Behandlinger kravid={krav.kravId} behandlinger={krav.behandlinger} />
                          </Table.DataCell>
                          <Table.DataCell>
                              <Button onClick={() => setKravTilManuell(krav)} variant="secondary" size="small">Sett til manuell</Button>
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
      {kravTilManuell !== null && <SettTilManuellModal krav={kravTilManuell} onClose={() => setKravTilManuell(null)} />}
    </div>
  )
}

function HentSakInput({ onLoad }: { onLoad: (sak: SakOppsummeringLaasOpp | null | undefined) => void }) {

  const [searchParams, setSearchParams] = useSearchParams();
  const sakIdParam = searchParams.get('sakId')
  const [sakId, setSakId] = useState<string>(sakIdParam ?? '')
  const fetcher = useFetcher()

  useEffect(() => {
    if(sakIdParam !== null && fetcher.data === undefined && fetcher.state === 'idle') {
    hentSak()
    }
  }, [fetcher.data, fetcher.state, hentSak, sakIdParam])

  useEffect(() => {
    onLoad(fetcher.data as SakOppsummeringLaasOpp | null | undefined)
  }, [fetcher.data, onLoad])

  function hentSak() {
    setSearchParams({sakId: sakId})
    fetcher.submit(
      {
        sakId,
      },
      {
        action: 'hentSak',
        method: 'POST',
        encType: 'application/json',
      },
    )
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
    }}>
      <HStack gap="2" align="end">

        <TextField error={fetcher.data === null ? 'Fant ikke sak' : undefined} label="Sak ID" value={sakId}
                   onChange={(e) => setSakId(e.target.value)} />
        <div><Button loading={fetcher.state === 'submitting'} onClick={hentSak}>Hent sak</Button></div>

      </HStack>
    </form>
  )
}

function Behandlinger({ kravid, behandlinger }: { kravid: string, behandlinger: LaasOppBehandlingSummary[] }) {
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


function SettTilManuellModal({ krav, onClose }: { krav: AutomatiskKravUtenVedtak, onClose: () => void }) {

  const fetcher = useFetcher()
  const revalidator = useRevalidator()

  function settTilManuell() {
    fetcher.submit(
      {
        kravId: krav.kravId,
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
  }, [fetcher?.data, onClose, revalidator])

 return ( <Modal header={{ heading: 'Sett til manuell' }} open={true} onClose={onClose}>
    <Modal.Body>
      <VStack gap="5">
        <BodyLong>
          Er du sikker på at du vil sette kravet til manuell? Dette fører til merarbeid for saksbehandler, sørg for at fag er
          innvolvert og at saksbehandler får nødvendig
          informasjon.
        </BodyLong>
        <Heading size="small">Dette vil skje:</Heading>
        <List as="ul">
         <List.Item title="Behandling">
              Behandlinger vil bli stoppet.
            </List.Item>
          <List.Item title="Endring av behandlingstype">
            Kravet vil bli endret til manuell behandling.
          </List.Item>
        </List>
      </VStack>
    </Modal.Body>
    <Modal.Footer>
      <Button type="button" loading={fetcher.state === 'submitting'} variant="danger" onClick={settTilManuell}>
        Sett til manuell
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={onClose}
      >
        Avbryt
      </Button>
    </Modal.Footer>
  </Modal>)
}

function LaasOppVedtakModal({ vedtak, onClose }: { vedtak: VedtakLaasOpp, onClose: () => void }) {
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
            innvolvert og at saksbehandler får nødvendig
            informasjon.
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






