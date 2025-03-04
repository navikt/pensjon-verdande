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
  Tabs,
  TextField,
  VStack,
} from '@navikt/ds-react'
import React, { useEffect, useState } from 'react'
import type {
  AggregertStatistikk,
  ArbeidstabellStatistikk,
  OrkestreringStatistikk,
  ReguleringDetaljer,
  ReguleringOrkestrering,
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
    interval: regulering.uttrekk?.status === Behandlingstatus.UNDER_BEHANDLING ? 500 : 1000,
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
      {reguleringSteg === 2 && <Orkestrering orkestreringer={regulering.orkestreringer} uttrekk={regulering.uttrekk} />}
      {reguleringSteg === 3 && <AdministrerTilknyttetdeBehandlinger />}
    </VStack>
  )
}


export function AdministrerTilknyttetdeBehandlinger() {


  return (
    <HStack>
      <Bar
        width={1000}
        height={500}
        id={'123'}
        data={{
          labels: ['Orkestrering', 'Familie', 'Iverksett vedtak'],
          datasets: [
            {
              label: 'Opprettet',
              data: [1123],
              borderWidth: 1,
            },
            {
              label: 'Under behandling',
              data: [11233],
              borderWidth: 1,
            },
            {
              label: 'Feilende',
              data: [11232],
              borderWidth: 1,
            },
            {
              label: 'Stoppet',
              data: [11231],
              borderWidth: 1,
            },
            {
              label: 'Fullført',
              data: [112311],
              borderWidth: 1,
            },

          ],
        }}
        options={{
          responsive: true,
        }}
      />
    </HStack>
  )
}

export function Orkestrering({ orkestreringer, uttrekk }: {
  orkestreringer: ReguleringOrkestrering[],
  uttrekk: ReguleringUttrekk | null
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
          <Button loading={fetcher.state === 'submitting'} onClick={startOrkestrering}>Start orkestrering</Button>
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
          <VStack gap="4">
            <Heading level="2" size="medium">Kjøring resultat</Heading>
            {orkestreringer.length === 0 ?
              <Alert variant="info" inline>Ingen kjøringer enda</Alert>
              : <ArbeidstabellStatistikk />}

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
  const orkestreringStatistikk = fetcher.data as DetaljertFremdriftDTO | undefined

  useEffect(() => {
    if (fetcher.state !== 'idle') return
    fetcher.load(`hentOrkestreringStatistikk/${behandlingId}`)
  }, [behandlingId, behandlingStatus, fetcher])


  if (orkestreringStatistikk === undefined) {
    return null
  }
  return (
    <BehandlingBatchDetaljertFremdriftBarChart detaljertFremdrift={orkestreringStatistikk} />
  )
}


export function ArbeidstabellStatistikk() {

  const fetcher = useFetcher()
  const aggregertStatistikk = fetcher.data as AggregertStatistikk | undefined

  useEffect(() => {
    if (fetcher.state !== 'idle') return
    fetcher.load(`hentArbeidstabellStatistikk`)
  }, [fetcher])

  if (aggregertStatistikk === undefined && fetcher.state === 'loading') {
    return <Loader size="small" />
  }

  if (aggregertStatistikk === undefined) {
    return null
  }

  const {
    arbeidstabellStatistikk,
  } = aggregertStatistikk

  const {
    antallOversendesOppdrag,
    antallFaktoromregnet,
    antallFaktoromregnetDirekte,
    antallReguleringsfeil,
  } = arbeidstabellStatistikk


  const {
    aggregerteFeilmeldinger,
  } = aggregertStatistikk

  const {
    faktoromregningerMedAarsak,
  } = aggregertStatistikk


  return (
    <VStack>
      <HStack style={{ marginLeft: 'auto' }} gap="3">
        <Button variant="secondary" size="small">Fortsett feilende familie reguleringer
          ({aggregertStatistikk.antallFeilendeFamiliebehandlinger})</Button>
        <Button variant="secondary" size="small">Fortsett feilende iverksett vedtak
          ({aggregertStatistikk.antallIFeilendeverksettVedtak})</Button>
        <Dropdown>
          <Button as={Dropdown.Toggle} size="small">Rune sin knapp</Button>
          <Dropdown.Menu>
            <Dropdown.Menu.List>
              <Dropdown.Menu.List.Item as={Button}>
                Prøv på nytt med nye avviksgrenser ({aggregertStatistikk.antallVenterPaaRune})
              </Dropdown.Menu.List.Item>
              <Dropdown.Menu.List.Item as={Button}>
                Kjør i faktoromregningsmodus ({aggregertStatistikk.antallVenterPaaRune})
              </Dropdown.Menu.List.Item>
              <Dropdown.Menu.List.Item as={Button}>
                Kjør i feilhåndteringsmodus
                ({aggregertStatistikk.antallFeilendeBeregnytelser})
              </Dropdown.Menu.List.Item>
            </Dropdown.Menu.List>
          </Dropdown.Menu>
        </Dropdown>

      </HStack>
      <Tabs defaultValue="arbeidstabell">
        <Tabs.List>
          <Tabs.Tab
            value="arbeidstabell"
            label="Arbeidstabell statistikk"
          />
          <Tabs.Tab
            value="feilmeldinger"
            label="Feilmeldinger"
          />
          <Tabs.Tab
            value="faktomregningArsak"
            label="Faktoromregninger Årsak"
          />
        </Tabs.List>
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
        <Tabs.Panel value="feilmeldinger">
          <Bar
            id={'123'}
            height={500}
            width={1000}
            data={{
              labels: aggregerteFeilmeldinger.map((f) => f.aktivitet),
              datasets: aggregerteFeilmeldinger.map((f) => ({
                labels: f.feilmeldinger.map(value => value.feilmelding), data: f.feilmeldinger.map(value => value.antall), borderWidth: 1,
              })),
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
      </Tabs>
      <HStack>

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
      <VStack>
        <ReadMore header="Vis kjøretid for aktiviteter">
          <VStack>
            {uttrekk?.kjoretidAktiviteter.map((aktivitet) => (
              <Alert variant="success" inline size="small"
                     key={aktivitet.aktivitet}>{aktivitet.minutter}min {aktivitet.sekunder}s
                - {aktivitet.aktivitet}</Alert>
            ))}
          </VStack>
        </ReadMore>


      </VStack>
      <HStack gap="5">
        <Entry labelText={'Satsdato'}>{formatIsoDate(uttrekk?.satsDato)}</Entry>
        <Entry labelText={'Populasjon'}>{uttrekk?.arbeidstabellSize}</Entry>
        <Entry labelText={'Antall familier'}>{uttrekk?.familierTabellSize}</Entry>
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
