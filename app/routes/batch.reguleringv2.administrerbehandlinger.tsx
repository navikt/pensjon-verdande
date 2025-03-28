import 'chart.js/auto'
import type {
  AvviksGrense,
  BeregningsavvikStatistikk,
  FaktoromregningMedAarsak,
  ReguleringDetaljer,
  ReguleringStatistikk,
} from '~/regulering.types'
import { ArbeidstabellStatistikk } from '~/regulering.types'
import React, { useEffect, useState } from 'react'
import { Link, useFetcher, useOutletContext } from '@remix-run/react'
import { Alert, Button, Dropdown, HStack, Loader, Table, Tabs, TextField, VStack } from '@navikt/ds-react'
import { Entry } from '~/components/entry/Entry'
import { DetaljertFremdriftDTO } from '~/types'
import {
  BehandlingBatchDetaljertFremdriftBarChart,
} from '~/components/behandling-batch-fremdrift/BehandlingBatchDetaljertFremdriftBarChart'
import { ChevronDownIcon, PlayFillIcon } from '@navikt/aksel-icons'


export default function AdministrerTilknyttetdeBehandlinger() {

  const { uttrekk, avviksgrenser } = useOutletContext<ReguleringDetaljer>()

  const uttrekkBehandlingId = uttrekk?.behandlingId


  const fetcher = useFetcher()
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


  function fortsettFeilendeFamilieReguleringer() {
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
    fetcherFeilhandteringmodus.submit(
      {},
      {
        action: 'fortsettFeilhandteringmodus',
        method: 'POST',
        encType: 'application/json',
      },
    )
  }


  return (
    <VStack gap="5">
      <HStack gap="3">
        <Dropdown>
          <Button icon={<PlayFillIcon />} as={Dropdown.Toggle} size="small"
                  loading={fetcherFortsettFeilendeFamilieReguleringer.state === 'submitting' || fetcherFortsettFamilieReguleringerTilBehandling.state === 'submitting'}>Fortsett
            familie
            reguleringer
            ({antallFeilendeFamiliebehandlinger})</Button>
          <Dropdown.Menu>
            <Dropdown.Menu.List>
              <Dropdown.Menu.List.Item as={Button} onClick={() => fortsettFeilendeFamilieReguleringer()}>
                Fortsett feilende behandlinger ({antallFeilendeFamiliebehandlinger})
              </Dropdown.Menu.List.Item>
              <Dropdown.Menu.List.Item as={Button} onClick={() => fortsettFamilieReguleringerTilBehandling()}>
                Fortsett utsatte behandlinger
              </Dropdown.Menu.List.Item>
            </Dropdown.Menu.List>
          </Dropdown.Menu>
        </Dropdown>
        <Button icon={<PlayFillIcon />} size="small"
                onClick={() => fortsettFeilendeIverksettVedtak()}
                loading={fetcherFortsettFeilendeIverksettVedtak.state === 'submitting'}>Fortsett feilende iverksett
          vedtak
          ({antallFeilendeverksettVedtak})</Button>
        <Dropdown>
          <Button icon={<ChevronDownIcon />} iconPosition="right" as={Dropdown.Toggle} variant="secondary" size="small"
                  loading={fetcherFeilhandteringmodus.state === 'submitting'
                    || fetcherFaktoromregningsmodus.state === 'submitting'
                    || fetcherNyAvviksgrenser.state === 'submitting'}>Rune sin knapp</Button>
          <Dropdown.Menu>
            <Dropdown.Menu.List>
              <Dropdown.Menu.List.Item as={Button} onClick={() => fortsettNyAvviksgrenser()}>
                Prøv på nytt med nye avviksgrenser ({antallVenterPaaRune})
              </Dropdown.Menu.List.Item>
              <Dropdown.Menu.List.Item as={Button} onClick={() => fortsettFaktoromregningsmodus()}>
                Kjør i faktoromregningsmodus ({antallVenterPaaRune})
              </Dropdown.Menu.List.Item>
              <Dropdown.Menu.List.Item as={Button} onClick={() => fortsettFeilhandteringmodus()}>
                Kjør i feilhåndteringsmodus
                ({antallFeilendeBeregnytelser})
              </Dropdown.Menu.List.Item>
            </Dropdown.Menu.List>
          </Dropdown.Menu>
        </Dropdown>
      </HStack>
      <HStack>
        <Tabs defaultValue="totaloversiktbehandlinger">
          <Tabs.List>
            <Tabs.Tab value="totaloversiktbehandlinger" label="Totaloversikt Behandlinger" />
            <Tabs.Tab
              value="arbeidstabell"
              label="Arbeidstabell statistikk"
            />

            <Tabs.Tab
              value="faktomregningArsak"
              label="Faktoromregninger Årsak"
            />
            <Tabs.Tab
              value="beregningsavvik"
              label="Beregningsavvik"
            />
            <Tabs.Tab
              value="avviksgrenser"
              label="Avviksgrenser"
            />
          </Tabs.List>
          <Tabs.Panel value="totaloversiktbehandlinger" style={{ paddingTop: '2em' }}>
            {uttrekkBehandlingId !== undefined ? <VStack gap="5">
                <TotaloversiktBehandlinger behandlingId={uttrekkBehandlingId!} />
                <Entry labelText={'Behandling'}>
                  <Link to={`/behandling/${uttrekkBehandlingId}`} target="_blank">Gå til
                    behandling</Link>
                </Entry>
              </VStack> :
              <Alert variant="info" inline>Uttrekk ikke kjørt enda</Alert>}

          </Tabs.Panel>
          <Tabs.Panel value="arbeidstabell" style={{ paddingTop: '2em' }}>
            {arbeidstabellStatistikk !== undefined ?
              <ArbeidstabellStatistikkTable arbeidstabellStatistikk={arbeidstabellStatistikk} /> : <Loader />}
          </Tabs.Panel>
          <Tabs.Panel value="faktomregningArsak" style={{ paddingTop: '2em' }}>
            {faktoromregningerMedAarsak !== undefined ?
              <FaktoromregningArsakTable faktoromregningerMedAarsak={faktoromregningerMedAarsak} /> : <Loader />}
          </Tabs.Panel>
          <Tabs.Panel value="beregningsavvik" style={{ paddingTop: '2em' }}>
            {beregningsavvikStatistikk !== undefined ?
              <BeregningsavvikStatistikkTable beregningsavvikStatistikk={beregningsavvikStatistikk} /> : <Loader />
            }

          </Tabs.Panel>
          <Tabs.Panel value="avviksgrenser" style={{ paddingTop: '2em' }}>
            <EndreAvviksgrenser avviksgrenser={avviksgrenser} />
          </Tabs.Panel>
        </Tabs>
      </HStack>
    </VStack>
  )
}

function ArbeidstabellStatistikkTable({ arbeidstabellStatistikk }: {
  arbeidstabellStatistikk: ArbeidstabellStatistikk
}) {
  const {
    antallOversendesOppdrag,
    antallFaktoromregnet,
    antallFaktoromregnetDirekte,
  } = arbeidstabellStatistikk

  return (<Table zebraStripes>
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
  </Table>)
}

function FaktoromregningArsakTable({ faktoromregningerMedAarsak }: {
  faktoromregningerMedAarsak: FaktoromregningMedAarsak[]
}) {
  return (<Table zebraStripes>
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
  </Table>)
}

function BeregningsavvikStatistikkTable({ beregningsavvikStatistikk }: {
  beregningsavvikStatistikk: BeregningsavvikStatistikk[]
}) {
  return (<Table zebraStripes>
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
  </Table>)
}


function EndreAvviksgrenser({ avviksgrenser }: { avviksgrenser: AvviksGrense[] }) {

  const fetcher = useFetcher()
  const response = fetcher.data as { success: boolean } | undefined

  const [newAvviksgrenser, setAvviksgrenser] = useState(avviksgrenser)

  function onAvviksgrenseChange(avvikParamId: number, key: string, value: string) {

    if (isNaN(Number(value))) {
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
    <VStack gap="5">
      {response?.success === true && <Alert variant="success" inline>Avviksgrenser oppdatert</Alert>}
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
            <Table.DataCell align={'right'}>{toggleEndreAvviksgrenser ?
              <TextField size="small" label="Positiv lav prosent" hideLabel value={avviksgrense.positivLavProsent}
                         onChange={(event) => onAvviksgrenseChange(avviksgrense.avvikParamId, 'positivLavProsent', event.target.value)} /> :
              avviksgrense.positivLavProsent
            }</Table.DataCell>
            <Table.DataCell align={'right'}>{toggleEndreAvviksgrenser ?
              <TextField size="small" label="Negativ lav prosent" hideLabel value={avviksgrense.negativLavProsent}
                         onChange={(event) => onAvviksgrenseChange(avviksgrense.avvikParamId, 'negativLavProsent', event.target.value)} /> :
              avviksgrense.negativLavProsent
            }</Table.DataCell>
            <Table.DataCell align={'right'}>{toggleEndreAvviksgrenser ?
              <TextField size="small" label="Positiv høy prosent" hideLabel value={avviksgrense.positivHoyProsent}
                         onChange={(event) => onAvviksgrenseChange(avviksgrense.avvikParamId, 'positivHoyProsent', event.target.value)} /> :
              avviksgrense.positivHoyProsent
            }</Table.DataCell>
            <Table.DataCell align={'right'}>{toggleEndreAvviksgrenser ?
              <TextField size="small" label="Negativ høy prosent" hideLabel value={avviksgrense.negativHoyProsent}
                         onChange={(event) => onAvviksgrenseChange(avviksgrense.avvikParamId, 'negativHoyProsent', event.target.value)} /> :
              avviksgrense.negativHoyProsent
            }</Table.DataCell>
            <Table.DataCell align={'right'}>{toggleEndreAvviksgrenser ?
              <TextField size="small" label="Positiv beløp" hideLabel value={avviksgrense.positivBelop}
                         onChange={(event) => onAvviksgrenseChange(avviksgrense.avvikParamId, 'positivBelop', event.target.value)} /> :
              avviksgrense.positivBelop
            }</Table.DataCell>
            <Table.DataCell align={'right'}>{toggleEndreAvviksgrenser ?
              <TextField size="small" label="Negativ beløp" hideLabel value={avviksgrense.negativBelop}
                         onChange={(event) => onAvviksgrenseChange(avviksgrense.avvikParamId, 'negativBelop', event.target.value)} /> :
              avviksgrense.negativBelop
            }</Table.DataCell>
            <Table.DataCell align={'right'}>{avviksgrense.underkategori}</Table.DataCell>
          </Table.Row>
        ))}
      </Table>
      <div>
        {toggleEndreAvviksgrenser ?
          <HStack gap="3"><Button variant="secondary" onClick={() => setToggleEndreAvviksgrenser(false)}>Avbryt</Button>
            <Button onClick={() => updateAvviksgrenser()} loading={fetcher.state === 'submitting'}>Oppdater
              avviksgrenser</Button></HStack> :
          <Button variant="secondary" onClick={() => setToggleEndreAvviksgrenser(true)}>Endre
            avviksgrenser</Button>
        }
      </div>
    </VStack>
  )
}

export function TotaloversiktBehandlinger({ behandlingId }: {
  behandlingId: string,
}) {

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
  return (
    <BehandlingBatchDetaljertFremdriftBarChart detaljertFremdrift={orkestreringStatistikk} />
  )
}

