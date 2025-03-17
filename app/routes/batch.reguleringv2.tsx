import type { ActionFunctionArgs } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import { Link, useFetcher, useLoaderData, useRevalidator } from '@remix-run/react'
import {
  Alert,
  BodyLong,
  Button,
  DatePicker,
  Dropdown,
  Heading,
  HStack,
  Loader,
  Modal,
  ProgressBar,
  ReadMore,
  Stepper,
  Table,
  Tabs,
  TextField,
  VStack,
} from '@navikt/ds-react'
import React, { useEffect, useState } from 'react'
import {
  AggregerteFeilmeldinger,
  AvviksGrense,
  ReguleringDetaljer,
  ReguleringOrkestrering,
  ReguleringStatistikk,
  ReguleringUttrekk,
} from '~/regulering.types'
import { Behandlingstatus, DetaljertFremdriftDTO } from '~/types'
import { Bar } from 'react-chartjs-2'
import 'chart.js/auto'
import { env } from '~/services/env.server'
import { format, formatISO } from 'date-fns'
import { formatIsoDate, formatIsoTimestamp } from '~/common/date'
import { Entry } from '~/components/entry/Entry'
import {
  BehandlingBatchDetaljertFremdriftBarChart,
} from '~/components/behandling-batch-fremdrift/BehandlingBatchDetaljertFremdriftBarChart'
import { ChevronDownIcon, PlayFillIcon } from '@navikt/aksel-icons'


export const loader = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const regulering = await getReguleringDetaljer(accessToken)
  return { regulering }
}

export default function OpprettReguleringBatchRoute() {
  const { regulering } =
    useLoaderData<typeof loader>()

  useRevalidateOnInterval({
    enabled: true,
    interval: regulering.uttrekk?.status === Behandlingstatus.UNDER_BEHANDLING ? 500 : 1500,
  })

  console.log(regulering)

  const [reguleringSteg, setReguleringSteg] = useState(regulering.steg)

  return (
    <VStack gap="5">
      <Heading level="1" size="medium">Regulering</Heading>
      <HStack>
        <Stepper
          aria-labelledby="stepper-heading"
          activeStep={reguleringSteg}
          onStepChange={setReguleringSteg}
          orientation="horizontal"
        >
          <Stepper.Step href="#"
                        completed={regulering.uttrekk?.status === Behandlingstatus.FULLFORT}>Uttrekk</Stepper.Step>
          <Stepper.Step href="#" completed={regulering.uttrekk?.antallUbehandlende === 0}>Orkestrering</Stepper.Step>
          <Stepper.Step href="#">Administrer tilknyttede behandlinger</Stepper.Step>
        </Stepper>
      </HStack>
      {reguleringSteg === 1 &&
        <Uttrekk uttrekk={regulering.uttrekk} goToOrkestrering={() => setReguleringSteg(2)}></Uttrekk>}
      {reguleringSteg === 2 && <Orkestrering orkestreringer={regulering.orkestreringer} uttrekk={regulering.uttrekk}
                                             goToAdministrerBehandlinger={() => setReguleringSteg(3)} />}
      {reguleringSteg === 3 &&
        <AdministrerTilknyttetdeBehandlinger avviksgrenser={regulering.avviksgrenser}
                                             uttrekkBehandlingId={regulering.uttrekk?.behandlingId ?? null} />}
    </VStack>
  )
}

export function AdministrerTilknyttetdeBehandlinger({ uttrekkBehandlingId, avviksgrenser }: {
  uttrekkBehandlingId: string | null,
  avviksgrenser: AvviksGrense[]
}) {

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

  if (reguleringStatistikk === undefined) {
    return null
  }

  const {
    arbeidstabellStatistikk,
    faktoromregningerMedAarsak,
    beregningsavvikStatistikk,
    antallVenterPaaRune,
    antallFeilendeBeregnytelser,
    antallFeilendeFamiliebehandlinger,
    antallIFeilendeverksettVedtak,
  } = reguleringStatistikk

  const {
    antallOversendesOppdrag,
    antallFaktoromregnet,
    antallFaktoromregnetDirekte,
    antallReguleringsfeil,
  } = arbeidstabellStatistikk


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
          ({antallIFeilendeverksettVedtak})</Button>
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
          <Tabs.Panel value="totaloversiktbehandlinger">
            {uttrekkBehandlingId !== null ? <VStack gap="5">
                <TotaloversiktBehandlinger behandlingId={uttrekkBehandlingId} />
                <Entry labelText={'Behandling'}>
                  <Link to={`/behandling/${uttrekkBehandlingId}`} target="_blank">Gå til
                    behandling</Link>
                </Entry>
              </VStack> :
              <Alert variant="info" inline>Uttrekk ikke kjørt enda</Alert>}

          </Tabs.Panel>
          <Tabs.Panel value="arbeidstabell">
            <Bar
              id={'123'}
              height={500}
              width={1000}
              data={{
                labels: ['Antall oversendes', 'Antall faktoromregnet', 'Antall fakoromregnet direkte', 'Antall reguleringsfeil'],
                datasets: [
                  {
                    label: 'Arbeidstabell',
                    data: [antallOversendesOppdrag, antallFaktoromregnet, antallFaktoromregnetDirekte, antallReguleringsfeil],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
              }}
            />
          </Tabs.Panel>
          <Tabs.Panel value="faktomregningArsak">
            <Bar
              id={'123'}
              height={500}
              width={1000}
              data={{
                labels: faktoromregningerMedAarsak.map((f) => f.aarsak),
                datasets: [
                  {
                    label: 'Årsak faktoromregning',
                    data: faktoromregningerMedAarsak.map((f) => f.antall),
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
              }}
            />
          </Tabs.Panel>
          <Tabs.Panel value="beregningsavvik">
            <Table>
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
          </Tabs.Panel>
          <Tabs.Panel value="avviksgrenser">
            <EndreAvviksgrenser avviksgrenser={avviksgrenser} />
          </Tabs.Panel>
        </Tabs>
      </HStack>
    </VStack>
  )
}

function EndreAvviksgrenser({ avviksgrenser }: { avviksgrenser: AvviksGrense[] }) {

  const fetcher = useFetcher()
  const response = fetcher.data as {success: boolean} | undefined

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
      newAvviksgrenser
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
    <VStack gap="5" paddingBlock="5">
      {response?.success === true && <Alert variant="success" inline>Avviksgrenser oppdatert</Alert>}
      <Table>
        <Table.Row>
          <Table.HeaderCell>Sakstype</Table.HeaderCell>
          <Table.HeaderCell align={'right'}>Positiv lav prosent</Table.HeaderCell>
          <Table.HeaderCell>Negativ lav prosent</Table.HeaderCell>
          <Table.HeaderCell>Positiv høy prosent</Table.HeaderCell>
          <Table.HeaderCell>Negativ høy prosent</Table.HeaderCell>
          <Table.HeaderCell>Positiv beløp</Table.HeaderCell>
          <Table.HeaderCell>Negativ beløp</Table.HeaderCell>
          <Table.HeaderCell>Underkategori</Table.HeaderCell>
        </Table.Row>
        {newAvviksgrenser.map((avviksgrense) => (
          <Table.Row key={avviksgrense.avvikParamId}>
            <Table.DataCell>{avviksgrense.sakType}</Table.DataCell>
            <Table.DataCell align={'right'}>{toggleEndreAvviksgrenser ?
              <TextField size="small" label="Positiv lav prosent" hideLabel value={avviksgrense.positivLavProsent}
                         onChange={(event) => onAvviksgrenseChange(avviksgrense.avvikParamId, 'positivLavProsent', event.target.value)} /> :
              avviksgrense.positivLavProsent
            }</Table.DataCell>
            <Table.DataCell>{toggleEndreAvviksgrenser ?
              <TextField size="small" label="Negativ lav prosent" hideLabel value={avviksgrense.negativLavProsent}
                         onChange={(event) => onAvviksgrenseChange(avviksgrense.avvikParamId, 'negativLavProsent', event.target.value)} /> :
              avviksgrense.negativLavProsent
            }</Table.DataCell>
            <Table.DataCell>{toggleEndreAvviksgrenser ?
              <TextField size="small" label="Positiv høy prosent" hideLabel value={avviksgrense.positivHoyProsent}
                         onChange={(event) => onAvviksgrenseChange(avviksgrense.avvikParamId, 'positivHoyProsent', event.target.value)} /> :
              avviksgrense.positivHoyProsent
            }</Table.DataCell>
            <Table.DataCell>{toggleEndreAvviksgrenser ?
              <TextField size="small" label="Negativ høy prosent" hideLabel value={avviksgrense.negativHoyProsent}
                         onChange={(event) => onAvviksgrenseChange(avviksgrense.avvikParamId, 'negativHoyProsent', event.target.value)} /> :
              avviksgrense.negativHoyProsent
            }</Table.DataCell>
            <Table.DataCell>{toggleEndreAvviksgrenser ?
              <TextField size="small" label="Positiv beløp" hideLabel value={avviksgrense.positivBelop}
                         onChange={(event) => onAvviksgrenseChange(avviksgrense.avvikParamId, 'positivBelop', event.target.value)} /> :
              avviksgrense.positivBelop
            }</Table.DataCell>
            <Table.DataCell>{toggleEndreAvviksgrenser ?
              <TextField size="small" label="Negativ beløp" hideLabel value={avviksgrense.negativBelop}
                         onChange={(event) => onAvviksgrenseChange(avviksgrense.avvikParamId, 'negativBelop', event.target.value)} /> :
              avviksgrense.negativBelop
            }</Table.DataCell>
            <Table.DataCell>{avviksgrense.underkategori}</Table.DataCell>
          </Table.Row>
        ))}
      </Table>
      <div>
        {toggleEndreAvviksgrenser ?
          <HStack gap="3"><Button variant="secondary" onClick={() => setToggleEndreAvviksgrenser(false)}>Avbryt</Button>
            <Button onClick={() => updateAvviksgrenser()} loading={fetcher.state === "submitting"}>Oppdater avviksgrenser</Button></HStack> :
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
      fetcher.load(`hentOrkestreringStatistikk/${behandlingId}`)
    }
  }, [fetcher, behandlingId])

  //Interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (fetcher.state === 'idle') {
        fetcher.load(`hentOrkestreringStatistikk/${behandlingId}`)
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


export function Orkestrering({ orkestreringer, uttrekk, goToAdministrerBehandlinger }: {
  orkestreringer: ReguleringOrkestrering[],
  uttrekk: ReguleringUttrekk | null
  goToAdministrerBehandlinger: () => void
}) {
  const [antallFamilier, setAntallFamilier] = useState('100000')
  const [error, setError] = useState<string | undefined>(undefined)
  const fetcher = useFetcher()

  function startOrkestrering() {
    setError(undefined)
    //Check if antallFamilier is a number
    if (isNaN(Number(antallFamilier)) || Number(antallFamilier) < 0 || antallFamilier.trim() === '') {
      setError('Oppgi antall familier')
      return
    }

    fetcher.submit(
      antallFamilier === '' ? {} : { antallFamilier }
      ,
      {
        action: 'startOrkestrering',
        method: 'POST',
        encType: 'application/json',
      },
    )

    console.log(antallFamilier)
  }

  if (uttrekk === null) {
    return <>
      <Alert variant="info" inline>Uttrekk ikke kjørt enda.</Alert>
    </>
  }

  return (
    <>
      <HStack gap="5">
        <VStack gap="5">
          <Heading level="2" size="medium">Start orkestrering</Heading>
          <Entry labelText="Antall ubehandlende familier">
            {uttrekk.antallUbehandlende}
          </Entry>
          <TextField label="Antall familier" error={error} onChange={(e) => setAntallFamilier(e.target.value)}
                     value={antallFamilier} />
          <HStack gap="3">
            <Button loading={fetcher.state === 'submitting'} onClick={startOrkestrering}>Start orkestrering</Button>
            {orkestreringer.length > 0 &&
              <Button variant="secondary" onClick={goToAdministrerBehandlinger}>Administrer behandlinger</Button>
            }
          </HStack>
        </VStack>
      </HStack>
      <VStack gap="5">
        <HStack gap="10">
          <VStack gap="4" style={{ paddingRight: '5rem' }}>
            <Heading level="2" size="medium">Orkestreringer</Heading>
            {orkestreringer.length === 0 &&
              <Alert variant="info" inline>Ingen kjøringer enda</Alert>
            }
            {orkestreringer.map((orkestrering, idx) => (
              <OrkestreringDetaljer key={orkestrering.behandlingId} visStatistikk={idx === 0}
                                    orkestrering={orkestrering} />
            ))}
          </VStack>
          <VStack gap="5">
            {orkestreringer.length === 0 ?
              <Alert variant="info" inline>Ingen kjøringer enda</Alert>
              : <AggregerteFeilmeldingerTabell />}

          </VStack>
        </HStack>
      </VStack>

    </>
  )
}

export function OrkestreringDetaljer({ orkestrering, visStatistikk }: {
  orkestrering: ReguleringOrkestrering,
  visStatistikk: boolean
}) {
  return (
    <VStack gap="5">
      <HStack gap="5">
        <Entry labelText="Status">
          {orkestrering.status === Behandlingstatus.OPPRETTET &&
            <Alert variant="info" size="small" inline>Opprettet</Alert>}
          {orkestrering.status === Behandlingstatus.UNDER_BEHANDLING &&
            <Alert variant="info" size="small" inline><HStack gap="2">Under behandling <Loader size="small" /></HStack></Alert>}
          {orkestrering.status === Behandlingstatus.FULLFORT &&
            <Alert variant="success" size="small" inline>Fullført</Alert>}
          {orkestrering.status === Behandlingstatus.STOPPET &&
            <Alert variant="error" size="small" inline>Stoppet</Alert>}
          {orkestrering.status === Behandlingstatus.DEBUG &&
            <Alert variant="error" size="small" inline>Debug</Alert>}
        </Entry>
        <Entry labelText="Kjøringstidspunkt">
          {formatIsoTimestamp(orkestrering.kjoringsdato)}
        </Entry>
        <Entry labelText="Antall familier">
          {orkestrering.opprettAntallFamilier === -1 ? 'Alle' : orkestrering.opprettAntallFamilier}
        </Entry>
        <Entry labelText="Behandling">
          <Link to={`/behandling/${orkestrering.behandlingId}`} target="_blank">Gå til behandling</Link>
        </Entry>
      </HStack>
      <HStack>
        {visStatistikk &&
          <OrkestreringStatistikk behandlingId={orkestrering.behandlingId} behandlingStatus={orkestrering.status} />}
      </HStack>
    </VStack>
  )
}

export function OrkestreringStatistikk({ behandlingId, behandlingStatus }: {
  behandlingId: string,
  behandlingStatus: Behandlingstatus
}) {

  const fetcher = useFetcher()

  // On Mount
  useEffect(() => {
    if (fetcher.data === undefined && fetcher.state === 'idle') {
      fetcher.load(`hentOrkestreringStatistikk/${behandlingId}`)
    }
  }, [fetcher, behandlingId])

  //Interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (fetcher.state === 'idle') {
        fetcher.load(`hentOrkestreringStatistikk/${behandlingId}`)
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


export function AggregerteFeilmeldingerTabell() {

  const fetcher = useFetcher()

  // On Mount
  useEffect(() => {
    if (fetcher.data === undefined && fetcher.state === 'idle') {
      fetcher.load('hentAggregerteFeilmeldinger')
    }
  }, [fetcher])

  //Interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (fetcher.state === 'idle') {
        fetcher.load('hentAggregerteFeilmeldinger')
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [fetcher])

  const aggregerteFeilmeldingerWrapper = fetcher.data as AggregerteFeilmeldinger | undefined

  if (aggregerteFeilmeldingerWrapper === undefined && fetcher.state === 'loading') {
    return <Loader size="small" />
  }

  if (aggregerteFeilmeldingerWrapper === undefined) {
    return null
  }

  const {
    aggregerteFeilmeldinger,
  } = aggregerteFeilmeldingerWrapper

  if (aggregerteFeilmeldinger.length === 0) {
    return <Alert variant="success" inline>Ingen feilmeldinger enda</Alert>
  }

  return (
    <VStack gap="5">
      <Heading level="2" size="medium">
        Feilmeldinger
      </Heading>
      <HStack style={{ marginLeft: 'auto' }} gap="3">
        <Table>
          <Table.Row>
            <Table.HeaderCell>Antall</Table.HeaderCell>
            <Table.HeaderCell>Feilmelding</Table.HeaderCell>
            <Table.HeaderCell>Aktivitet</Table.HeaderCell>
          </Table.Row>
          {aggregerteFeilmeldinger.map((feilmelding) => (
            <Table.Row key={feilmelding.aktivitet + feilmelding.feilmelding}>
              <Table.DataCell>{feilmelding.antall}</Table.DataCell>
              <Table.DataCell>{feilmelding.feilmelding}</Table.DataCell>
              <Table.DataCell>{feilmelding.aktivitet}</Table.DataCell>
            </Table.Row>
          ))}
        </Table>
      </HStack>
      <HStack>
        <Entry labelText="Antall venter på Rune">
          {aggregerteFeilmeldingerWrapper.antallVenterPaaRune}
        </Entry>
      </HStack>
    </VStack>
  )
}


export function Uttrekk({ uttrekk, goToOrkestrering }: {
  uttrekk: ReguleringUttrekk | null,
  goToOrkestrering: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <HStack>
        {uttrekk !== null &&
          <>
            {uttrekk.status === Behandlingstatus.UNDER_BEHANDLING && (
              <Alert variant="info" inline>
                <VStack gap="2">
                  <HStack gap="2">
                    <div>Uttrekk er under behandling: {uttrekk.steg}</div>
                    <Loader /></HStack>
                  <ProgressBar
                    title={uttrekk.steg}
                    value={uttrekk.progresjon}
                    valueMax={8}
                    size="small"
                    aria-labelledby="progress-bar-label-small"
                  />
                </VStack>
              </Alert>
            )}
            {uttrekk.status === Behandlingstatus.STOPPET && (
              <Alert variant="error" inline>Uttrekk er stoppet manuelt</Alert>
            )}
            {uttrekk.feilmelding !== null && (
              <Alert variant="warning" inline>{uttrekk.feilmelding}</Alert>
            )}
            {uttrekk.status === Behandlingstatus.FULLFORT && (
              <Alert variant="success" inline><VStack gap="2">Uttrekk er
                fullført {formatIsoTimestamp(uttrekk.uttrekkDato)}</VStack></Alert>
            )}
          </>
        }
      </HStack>
      <HStack gap="3">
        <ReadMore header="Vis kjøretid for aktiviteter">
          <VStack>
            {uttrekk?.kjoretidAktiviteter.map((aktivitet) => (
              <Alert variant="success" inline size="small"
                     key={aktivitet.aktivitet}>{aktivitet.minutter}min {aktivitet.sekunder}s
                - {aktivitet.aktivitet}</Alert>
            ))}
          </VStack>
        </ReadMore>
      </HStack>
      <HStack gap="5">
        <Entry labelText={'Satsdato'}>{formatIsoDate(uttrekk?.satsDato)}</Entry>
        <Entry labelText={'Populasjon'}>{uttrekk?.arbeidstabellSize}</Entry>
        <Entry labelText={'Antall familier'}>{uttrekk?.familierTabellSize}</Entry>
        {uttrekk !== null &&
          <Entry labelText={'Behandling'}>
            <Link to={`/behandling/${uttrekk.behandlingId}`} target="_blank">Gå til
              behandling</Link>
          </Entry>}
      </HStack>
      <HStack gap="3">
        {(uttrekk === null || (uttrekk.status === Behandlingstatus.FULLFORT || uttrekk.status === Behandlingstatus.STOPPET))
          && <Button variant="secondary" onClick={() => setIsOpen(true)}>Kjør uttrekk</Button>
        }
        {uttrekk?.status === Behandlingstatus.FULLFORT &&
          <Button onClick={goToOrkestrering}>Gå til Orkestrering</Button>
        }
      </HStack>
      <StartUttrekkModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )

}

export function StartUttrekkModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {

  const year = new Date().getFullYear()
  const defaultSatsdato = new Date(`1 May ${year}`)
  const [satsDato, setSatsDato] = useState<Date | undefined>(defaultSatsdato)
  const fetcher = useFetcher()

  function startUttrekk() {
    console.log(formatISO(satsDato ?? defaultSatsdato))
    fetcher.submit(
      {
        satsDato: format(satsDato ?? defaultSatsdato, 'yyyy-MM-dd'),
      },
      {
        action: 'startUttrekk',
        method: 'POST',
        encType: 'application/json',
      },
    )
    onClose()
  }

  return (
    <Modal header={{ heading: 'Start uttrekk' }} open={isOpen} onClose={() => onClose()}>
      <Modal.Body>
        <VStack gap="5">
          <BodyLong>
            Velg satsdato
          </BodyLong>
          <DatePicker.Standalone
            selected={satsDato}
            today={defaultSatsdato}
            onSelect={setSatsDato}
            fromDate={new Date(`1 May ${year - 2}`)}
            toDate={new Date(`1 May ${year + 2}`)}
            dropdownCaption
          />
        </VStack>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={startUttrekk} loading={fetcher.state === 'submitting'}>
          Start uttrekk
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => onClose()}
        >
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>)
}

function useRevalidateOnInterval({ enabled = false, interval = 1000 }: { enabled?: boolean; interval?: number }) {
  let revalidate = useRevalidator()
  useEffect(function revalidateOnInterval() {
    if (!enabled) return
    let intervalId = setInterval(revalidate.revalidate, interval)
    return () => clearInterval(intervalId)
  }, [enabled, interval, revalidate])
}

export async function getReguleringDetaljer(
  accessToken: string,
): Promise<ReguleringDetaljer> {

  const url = new URL(`${env.penUrl}/api/vedtak/regulering/detaljer`)
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
    return (await response.json()) as ReguleringDetaljer
  } else {
    let body = await response.json()
    console.log(`Feil ved kall til pen ${response.status}`, body)
    throw new Error()
  }
}
