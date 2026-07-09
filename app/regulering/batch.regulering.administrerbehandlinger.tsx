import 'chart.js/auto'
import { ChevronDownIcon, PlayFillIcon } from '@navikt/aksel-icons'
import {
  ActionMenu,
  BodyShort,
  Button,
  HStack,
  InlineMessage,
  Loader,
  Table,
  Tabs,
  TextField,
  VStack,
} from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { Link, useFetcher, useOutletContext } from 'react-router'
import { BehandlingBatchDetaljertFremdriftBarChart } from '~/components/behandling-batch-fremdrift/BehandlingBatchDetaljertFremdriftBarChart'
import { ConfirmationModal } from '~/components/confirmation-modal/ConfirmationModal'
import { Entry } from '~/components/entry/Entry'
import type {
  ArbeidstabellStatistikk,
  AvviksGrense,
  BeregningsavvikStatistikk,
  FaktoromregningMedAarsak,
  ReguleringDetaljer,
  ReguleringStatistikk,
} from '~/regulering/regulering.types'
import type { DetaljertFremdriftDTO } from '~/types'

type OpenConfirmationModalType =
  | 'endrePrioritetTilBatch'
  | 'endrePrioritetTilOnline'
  | 'fortsettFeilendeFamiliereguleringer'
  | 'fortsettFamilieReguleringerTilBehandling'
  | 'fortsettFeilendeIverksettVedtak'
  | 'fortsettNyAvviksgrenser'
  | 'fortsettFaktoromregningsmodus'
  | 'fortsettFeilhandteringmodus'

export default function AdministrerTilknyttetdeBehandlinger() {
  const { uttrekk, avviksgrenser } = useOutletContext<ReguleringDetaljer>()

  const uttrekkBehandlingId = uttrekk?.behandlingId

  const fetcher = useFetcher()
  const fetcherEndrePrioritetTilBatch = useFetcher()
  const fetcherEndrePrioritetTilOnline = useFetcher()
  const fetcherFortsettFeilendeFamilieReguleringer = useFetcher()
  const fetcherFortsettFamilieReguleringerTilBehandling = useFetcher()
  const fetcherFortsettFeilendeIverksettVedtak = useFetcher()
  const fetcherNyAvviksgrenser = useFetcher()
  const fetcherFaktoromregningsmodus = useFetcher()
  const fetcherFeilhandteringmodus = useFetcher()

  // On Mount
  useEffect(() => {
    if (fetcher.data === undefined && fetcher.state === 'idle') {
      fetcher.load(`hentStatistikk`)
    }
  }, [fetcher])

  //Interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (fetcher.state === 'idle') {
        fetcher.load(`hentStatistikk`)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [fetcher])

  const reguleringStatistikk = fetcher.data as ReguleringStatistikk | undefined

  const arbeidstabellStatistikk = reguleringStatistikk?.arbeidstabellStatistikk
  const faktoromregningerMedAarsak = reguleringStatistikk?.faktoromregningerMedAarsak

  const beregningsavvikStatistikk = reguleringStatistikk?.beregningsavvikStatistikk
  const antallVenterPaaRune = reguleringStatistikk?.antallVenterPaaRune
  const antallFeilendeBeregnytelser = reguleringStatistikk?.antallFeilendeBeregnytelser
  const antallFeilendeFamiliebehandlinger = reguleringStatistikk?.antallFeilendeFamiliebehandlinger
  const antallFeilendeverksettVedtak = reguleringStatistikk?.antallFeilendeIverksettVedtak

  const [openConfirmationModal, setOpenConfirmationModal] = useState<OpenConfirmationModalType | null>(null)

  function fortsettFeilendeFamilieReguleringer() {
    setOpenConfirmationModal(null)
    fetcherFortsettFeilendeFamilieReguleringer.submit(
      {},
      {
        action: 'fortsettFeilendeFamilieReguleringer',
        method: 'POST',
        encType: 'application/json',
      },
    )
  }

  function fortsettFamilieReguleringerTilBehandling() {
    setOpenConfirmationModal(null)
    fetcherFortsettFamilieReguleringerTilBehandling.submit(
      {},
      {
        action: 'fortsettFamilieReguleringerTilBehandling',
        method: 'POST',
        encType: 'application/json',
      },
    )
  }

  function fortsettFeilendeIverksettVedtak() {
    setOpenConfirmationModal(null)
    fetcherFortsettFeilendeIverksettVedtak.submit(
      {},
      {
        action: 'fortsettFeilendeIverksettVedtak',
        method: 'POST',
        encType: 'application/json',
      },
    )
  }

  function fortsettNyAvviksgrenser() {
    setOpenConfirmationModal(null)
    fetcherNyAvviksgrenser.submit(
      {},
      {
        action: 'fortsettNyAvviksgrenser',
        method: 'POST',
        encType: 'application/json',
      },
    )
  }

  function fortsettFaktoromregningsmodus() {
    setOpenConfirmationModal(null)
    fetcherFaktoromregningsmodus.submit(
      {},
      {
        action: 'fortsettFaktoromregningsmodus',
        method: 'POST',
        encType: 'application/json',
      },
    )
  }

  function fortsettFeilhandteringmodus() {
    setOpenConfirmationModal(null)
    fetcherFeilhandteringmodus.submit(
      {},
      {
        action: 'fortsettFeilhandteringmodus',
        method: 'POST',
        encType: 'application/json',
      },
    )
  }

  function endrePrioritetTilOnline() {
    setOpenConfirmationModal(null)
    fetcherEndrePrioritetTilOnline.submit(
      {},
      {
        action: 'endrePrioritetOnline',
        method: 'PUT',
        encType: 'application/json',
      },
    )
  }

  function endrePrioritetTilBatch() {
    setOpenConfirmationModal(null)
    fetcherEndrePrioritetTilBatch.submit(
      {},
      {
        action: 'endrePrioritetBatch',
        method: 'PUT',
        encType: 'application/json',
      },
    )
  }

  return (
    <VStack gap="space-20">
      <HStack gap="space-12">
        <ActionMenu>
          <ActionMenu.Trigger>
            <Button
              icon={<PlayFillIcon />}
              size="small"
              loading={
                fetcherFortsettFeilendeFamilieReguleringer.state === 'submitting' ||
                fetcherFortsettFamilieReguleringerTilBehandling.state === 'submitting'
              }
            >
              Fortsett familie reguleringer ({antallFeilendeFamiliebehandlinger})
            </Button>
          </ActionMenu.Trigger>
          <ActionMenu.Content>
            <ActionMenu.Item onClick={() => setOpenConfirmationModal('fortsettFeilendeFamiliereguleringer')}>
              Fortsett feilende behandlinger ({antallFeilendeFamiliebehandlinger})
            </ActionMenu.Item>
            <ActionMenu.Item onClick={() => setOpenConfirmationModal('fortsettFamilieReguleringerTilBehandling')}>
              Fortsett utsatte behandlinger
            </ActionMenu.Item>
          </ActionMenu.Content>
        </ActionMenu>
        <Button
          icon={<PlayFillIcon />}
          size="small"
          onClick={() => setOpenConfirmationModal('fortsettFeilendeIverksettVedtak')}
          loading={fetcherFortsettFeilendeIverksettVedtak.state === 'submitting'}
        >
          Fortsett feilende iverksett vedtak ({antallFeilendeverksettVedtak})
        </Button>
        <ActionMenu>
          <ActionMenu.Trigger>
            <Button
              icon={<ChevronDownIcon />}
              iconPosition="right"
              variant="secondary"
              size="small"
              loading={
                fetcherFeilhandteringmodus.state === 'submitting' ||
                fetcherFaktoromregningsmodus.state === 'submitting' ||
                fetcherNyAvviksgrenser.state === 'submitting'
              }
            >
              Rune sin knapp
            </Button>
          </ActionMenu.Trigger>
          <ActionMenu.Content>
            <ActionMenu.Item onClick={() => setOpenConfirmationModal('fortsettNyAvviksgrenser')}>
              Prøv på nytt med nye avviksgrenser ({antallVenterPaaRune})
            </ActionMenu.Item>
            <ActionMenu.Item onClick={() => setOpenConfirmationModal('fortsettFaktoromregningsmodus')}>
              Kjør i faktoromregningsmodus ({antallVenterPaaRune})
            </ActionMenu.Item>
            <ActionMenu.Item onClick={() => setOpenConfirmationModal('fortsettFeilhandteringmodus')}>
              Kjør i feilhåndteringsmodus ({antallFeilendeBeregnytelser})
            </ActionMenu.Item>
          </ActionMenu.Content>
        </ActionMenu>
        <ActionMenu>
          <ActionMenu.Trigger>
            <Button
              icon={<ChevronDownIcon />}
              iconPosition="right"
              variant="secondary"
              size="small"
              loading={
                fetcherEndrePrioritetTilOnline.state === 'submitting' ||
                fetcherEndrePrioritetTilBatch.state === 'submitting'
              }
            >
              Endre prioritet
            </Button>
          </ActionMenu.Trigger>
          <ActionMenu.Content>
            <ActionMenu.Item onClick={() => setOpenConfirmationModal('endrePrioritetTilOnline')}>
              Endre til ONLINE
            </ActionMenu.Item>
            <ActionMenu.Item onClick={() => setOpenConfirmationModal('endrePrioritetTilBatch')}>
              Endre til BATCH
            </ActionMenu.Item>
          </ActionMenu.Content>
        </ActionMenu>
      </HStack>
      <HStack>
        <Tabs defaultValue="totaloversiktbehandlinger">
          <Tabs.List>
            <Tabs.Tab value="totaloversiktbehandlinger" label="Totaloversikt Behandlinger" />
            <Tabs.Tab value="arbeidstabell" label="Arbeidstabell statistikk" />

            <Tabs.Tab value="faktomregningArsak" label="Faktoromregninger Årsak" />
            <Tabs.Tab value="beregningsavvik" label="Beregningsavvik" />
            <Tabs.Tab value="avviksgrenser" label="Avviksgrenser" />
          </Tabs.List>
          <Tabs.Panel value="totaloversiktbehandlinger" style={{ paddingTop: '2em' }}>
            {uttrekkBehandlingId !== undefined ? (
              <VStack gap="space-20">
                <TotaloversiktBehandlinger behandlingId={uttrekkBehandlingId} />
                <Entry labelText={'Behandling'}>
                  <Link to={`/behandling/${uttrekkBehandlingId}`} target="_blank">
                    Gå til behandling
                  </Link>
                </Entry>
              </VStack>
            ) : (
              <InlineMessage status="info">Uttrekk ikke kjørt enda</InlineMessage>
            )}
          </Tabs.Panel>
          <Tabs.Panel value="arbeidstabell" style={{ paddingTop: '2em' }}>
            {arbeidstabellStatistikk !== undefined ? (
              <ArbeidstabellStatistikkTable arbeidstabellStatistikk={arbeidstabellStatistikk} />
            ) : (
              <Loader title="Laster arbeidstabell…" />
            )}
          </Tabs.Panel>
          <Tabs.Panel value="faktomregningArsak" style={{ paddingTop: '2em' }}>
            {faktoromregningerMedAarsak !== undefined ? (
              <FaktoromregningArsakTable faktoromregningerMedAarsak={faktoromregningerMedAarsak} />
            ) : (
              <Loader title="Laster faktoromregninger…" />
            )}
          </Tabs.Panel>
          <Tabs.Panel value="beregningsavvik" style={{ paddingTop: '2em' }}>
            {beregningsavvikStatistikk !== undefined ? (
              <BeregningsavvikStatistikkTable beregningsavvikStatistikk={beregningsavvikStatistikk} />
            ) : (
              <Loader title="Laster beregningsavvik…" />
            )}
          </Tabs.Panel>
          <Tabs.Panel value="avviksgrenser" style={{ paddingTop: '2em' }}>
            <EndreAvviksgrenser avviksgrenser={avviksgrenser} />
          </Tabs.Panel>
        </Tabs>
      </HStack>
      <ConfirmationModal
        text="Er du sikker på at du vil fortsette familiebehandlinger som er utsatt? Dette vil nullstille utsattTil-tidspunkt for alle ikke-feilende familiebehandlinger."
        open={openConfirmationModal === 'fortsettFamilieReguleringerTilBehandling'}
        onOk={() => {
          fortsettFamilieReguleringerTilBehandling()
        }}
        onCancel={() => setOpenConfirmationModal(null)}
      />
      <ConfirmationModal
        text="Er du sikker på at du vil fortsette feilende familiebehandlinger? Dette vil nullstille utsattTil-tidspunkt for alle feilende familiebehandlinger."
        open={openConfirmationModal === 'fortsettFeilendeFamiliereguleringer'}
        onOk={() => {
          fortsettFeilendeFamilieReguleringer()
        }}
        onCancel={() => setOpenConfirmationModal(null)}
      />
      <ConfirmationModal
        text="Er du sikker på at du vil fortsette feilende iverksett-vedtak-behandlinger? Dette vil nullstille utsattTil-tidspunkt for alle feilende iverksett-vedtak-behandlinger."
        open={openConfirmationModal === 'fortsettFeilendeIverksettVedtak'}
        onOk={() => {
          fortsettFeilendeIverksettVedtak()
        }}
        onCancel={() => setOpenConfirmationModal(null)}
      />
      <ConfirmationModal
        text="Er du sikker på at du vil gjenoppta kjøring med nye avviksgrenser? Familiebehandlinger som har gått ut på avviksgrenser vil kjøre fra BeregnYtelser-aktiviteten på nytt og hente opp nåværende avviksgrenser."
        open={openConfirmationModal === 'fortsettNyAvviksgrenser'}
        onOk={() => {
          fortsettNyAvviksgrenser()
        }}
        onCancel={() => setOpenConfirmationModal(null)}
      />
      <ConfirmationModal
        text="Er du sikker på at du vil kjøre i faktoromregningsmodus? Dette gjør at faktoromregning tillates for familiebehandlinger som har gått ut med beregningsavvik."
        open={openConfirmationModal === 'fortsettFaktoromregningsmodus'}
        onOk={() => {
          fortsettFaktoromregningsmodus()
        }}
        onCancel={() => setOpenConfirmationModal(null)}
      />
      <ConfirmationModal
        text="Er du sikker på at du vil kjøre i feilhåndteringsmodus? Dette gjør at forenklet beregning og faktoromregning gjøres for familiebehandlinger som har feilet i BeregnYtelser-aktiviteten."
        open={openConfirmationModal === 'fortsettFeilhandteringmodus'}
        onOk={() => {
          fortsettFeilhandteringmodus()
        }}
        onCancel={() => setOpenConfirmationModal(null)}
      />
      <ConfirmationModal
        text="Er du sikker på at du endre prioritet til ONLINE? Dette vil endre på prioriteten til alle familiebehandlinger som ikke er fullført, og medføre at resterende vedtak blir iverksatt på ONLINE-kø hos Oppdrag."
        open={openConfirmationModal === 'endrePrioritetTilOnline'}
        onOk={() => {
          endrePrioritetTilOnline()
        }}
        onCancel={() => setOpenConfirmationModal(null)}
      />
      <ConfirmationModal
        text="Er du sikker på at du endre prioritet til BATCH? Dette vil endre på prioriteten til alle familiebehandlinger som ikke er fullført, og medføre at resterende vedtak blir iverksatt på BATCH-kø hos Oppdrag (HPEN)."
        open={openConfirmationModal === 'endrePrioritetTilBatch'}
        onOk={() => {
          endrePrioritetTilBatch()
        }}
        onCancel={() => setOpenConfirmationModal(null)}
      />
    </VStack>
  )
}

function ArbeidstabellStatistikkTable({
  arbeidstabellStatistikk,
}: {
  arbeidstabellStatistikk: ArbeidstabellStatistikk
}) {
  const { antallOversendesOppdrag, antallFaktoromregnet, antallFaktoromregnetDirekte } = arbeidstabellStatistikk

  return (
    <Table zebraStripes>
      <BodyShort as="caption" visuallyHidden>
        Arbeidstabell
      </BodyShort>
      <Table.Row>
        <Table.HeaderCell>Antall</Table.HeaderCell>
        <Table.HeaderCell align="right">Antall</Table.HeaderCell>
      </Table.Row>
      <Table.Row>
        <Table.DataCell>Antall oversendes oppdrag</Table.DataCell>
        <Table.DataCell align="right">{antallOversendesOppdrag}</Table.DataCell>
      </Table.Row>
      <Table.Row>
        <Table.DataCell>Antall faktoromregnet</Table.DataCell>
        <Table.DataCell align="right">{antallFaktoromregnet}</Table.DataCell>
      </Table.Row>
      <Table.Row>
        <Table.DataCell>Antall faktoromregnet direkte</Table.DataCell>
        <Table.DataCell align="right">{antallFaktoromregnetDirekte}</Table.DataCell>
      </Table.Row>
    </Table>
  )
}

function FaktoromregningArsakTable({
  faktoromregningerMedAarsak,
}: {
  faktoromregningerMedAarsak: FaktoromregningMedAarsak[]
}) {
  return (
    <Table zebraStripes>
      <Table.Row>
        <Table.HeaderCell>Årsak</Table.HeaderCell>
        <Table.HeaderCell align="right">Antall</Table.HeaderCell>
      </Table.Row>
      {faktoromregningerMedAarsak.map((f) => (
        <Table.Row key={f.aarsak}>
          <Table.DataCell>{f.aarsak}</Table.DataCell>
          <Table.DataCell align="right">{f.antall}</Table.DataCell>
        </Table.Row>
      ))}
    </Table>
  )
}

function BeregningsavvikStatistikkTable({
  beregningsavvikStatistikk,
}: {
  beregningsavvikStatistikk: BeregningsavvikStatistikk[]
}) {
  return (
    <Table zebraStripes>
      <Table.Row>
        <Table.HeaderCell>Sakstype </Table.HeaderCell>
        <Table.HeaderCell>Antall</Table.HeaderCell>
        <Table.HeaderCell>Avvik</Table.HeaderCell>
      </Table.Row>
      {beregningsavvikStatistikk.map((avvik) => (
        <Table.Row key={avvik.typeAvvik + avvik.sakType}>
          <Table.DataCell>{avvik.sakType}</Table.DataCell>
          <Table.DataCell>{avvik.antall}</Table.DataCell>
          <Table.DataCell>{avvik.typeAvvik}</Table.DataCell>
        </Table.Row>
      ))}
    </Table>
  )
}

function EndreAvviksgrenser({ avviksgrenser }: { avviksgrenser: AvviksGrense[] }) {
  const fetcher = useFetcher()
  const response = fetcher.data as { success: boolean } | undefined

  const [newAvviksgrenser, setAvviksgrenser] = useState(avviksgrenser)

  function onAvviksgrenseChange(avvikParamId: number, key: string, value: string) {
    if (Number.isNaN(Number(value))) {
      return
    }
    const newAvviksgrenserCopy = newAvviksgrenser.map((avviksgrense) => {
      if (avviksgrense.avvikParamId === avvikParamId) {
        return {
          ...avviksgrense,
          [key]: value,
        }
      }
      return avviksgrense
    })
    setAvviksgrenser(newAvviksgrenserCopy)
  }

  function updateAvviksgrenser() {
    fetcher.submit(
      {
        newAvviksgrenser,
      },
      {
        action: 'oppdaterAvviksgrenser',
        method: 'POST',
        encType: 'application/json',
      },
    )
  }

  const [toggleEndreAvviksgrenser, setToggleEndreAvviksgrenser] = useState(false)
  return (
    <VStack gap="space-20">
      {response?.success === true && <InlineMessage status="success">Avviksgrenser oppdatert</InlineMessage>}
      <Table zebraStripes>
        <Table.Row>
          <Table.HeaderCell>Sakstype</Table.HeaderCell>
          <Table.HeaderCell align="right">Positiv lav prosent</Table.HeaderCell>
          <Table.HeaderCell align="right">Negativ lav prosent</Table.HeaderCell>
          <Table.HeaderCell align="right">Positiv høy prosent</Table.HeaderCell>
          <Table.HeaderCell align="right">Negativ høy prosent</Table.HeaderCell>
          <Table.HeaderCell align="right">Positiv beløp</Table.HeaderCell>
          <Table.HeaderCell align="right">Negativ beløp</Table.HeaderCell>
          <Table.HeaderCell align="right">Underkategori</Table.HeaderCell>
        </Table.Row>
        {newAvviksgrenser.map((avviksgrense) => (
          <Table.Row key={avviksgrense.avvikParamId}>
            <Table.DataCell>{avviksgrense.sakType}</Table.DataCell>
            <Table.DataCell align={'right'}>
              {toggleEndreAvviksgrenser ? (
                <TextField
                  size="small"
                  label="Positiv lav prosent"
                  hideLabel
                  value={avviksgrense.positivLavProsent}
                  onChange={(event) =>
                    onAvviksgrenseChange(avviksgrense.avvikParamId, 'positivLavProsent', event.target.value)
                  }
                />
              ) : (
                avviksgrense.positivLavProsent
              )}
            </Table.DataCell>
            <Table.DataCell align={'right'}>
              {toggleEndreAvviksgrenser ? (
                <TextField
                  size="small"
                  label="Negativ lav prosent"
                  hideLabel
                  value={avviksgrense.negativLavProsent}
                  onChange={(event) =>
                    onAvviksgrenseChange(avviksgrense.avvikParamId, 'negativLavProsent', event.target.value)
                  }
                />
              ) : (
                avviksgrense.negativLavProsent
              )}
            </Table.DataCell>
            <Table.DataCell align={'right'}>
              {toggleEndreAvviksgrenser ? (
                <TextField
                  size="small"
                  label="Positiv høy prosent"
                  hideLabel
                  value={avviksgrense.positivHoyProsent}
                  onChange={(event) =>
                    onAvviksgrenseChange(avviksgrense.avvikParamId, 'positivHoyProsent', event.target.value)
                  }
                />
              ) : (
                avviksgrense.positivHoyProsent
              )}
            </Table.DataCell>
            <Table.DataCell align={'right'}>
              {toggleEndreAvviksgrenser ? (
                <TextField
                  size="small"
                  label="Negativ høy prosent"
                  hideLabel
                  value={avviksgrense.negativHoyProsent}
                  onChange={(event) =>
                    onAvviksgrenseChange(avviksgrense.avvikParamId, 'negativHoyProsent', event.target.value)
                  }
                />
              ) : (
                avviksgrense.negativHoyProsent
              )}
            </Table.DataCell>
            <Table.DataCell align={'right'}>
              {toggleEndreAvviksgrenser ? (
                <TextField
                  size="small"
                  label="Positiv beløp"
                  hideLabel
                  value={avviksgrense.positivBelop}
                  onChange={(event) =>
                    onAvviksgrenseChange(avviksgrense.avvikParamId, 'positivBelop', event.target.value)
                  }
                />
              ) : (
                avviksgrense.positivBelop
              )}
            </Table.DataCell>
            <Table.DataCell align={'right'}>
              {toggleEndreAvviksgrenser ? (
                <TextField
                  size="small"
                  label="Negativ beløp"
                  hideLabel
                  value={avviksgrense.negativBelop}
                  onChange={(event) =>
                    onAvviksgrenseChange(avviksgrense.avvikParamId, 'negativBelop', event.target.value)
                  }
                />
              ) : (
                avviksgrense.negativBelop
              )}
            </Table.DataCell>
            <Table.DataCell align={'right'}>{avviksgrense.underkategori}</Table.DataCell>
          </Table.Row>
        ))}
      </Table>
      <div>
        {toggleEndreAvviksgrenser ? (
          <HStack gap="space-12">
            <Button variant="secondary" onClick={() => setToggleEndreAvviksgrenser(false)}>
              Avbryt
            </Button>
            <Button onClick={() => updateAvviksgrenser()} loading={fetcher.state === 'submitting'}>
              Oppdater avviksgrenser
            </Button>
          </HStack>
        ) : (
          <Button variant="secondary" onClick={() => setToggleEndreAvviksgrenser(true)}>
            Endre avviksgrenser
          </Button>
        )}
      </div>
    </VStack>
  )
}

export function TotaloversiktBehandlinger({ behandlingId }: { behandlingId: string }) {
  const fetcher = useFetcher()

  // On Mount
  useEffect(() => {
    if (fetcher.data === undefined && fetcher.state === 'idle') {
      fetcher.load(`hentTotaloversiktBehandlinger/${behandlingId}`)
    }
  }, [fetcher, behandlingId])

  //Interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (fetcher.state === 'idle') {
        fetcher.load(`hentTotaloversiktBehandlinger/${behandlingId}`)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [fetcher, behandlingId])

  const orkestreringStatistikk = fetcher.data as DetaljertFremdriftDTO | undefined

  if (orkestreringStatistikk === undefined) {
    return null
  }
  return <BehandlingBatchDetaljertFremdriftBarChart detaljertFremdrift={orkestreringStatistikk} />
}
