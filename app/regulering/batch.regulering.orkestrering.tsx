import 'chart.js/auto'
import { PauseIcon, PlayIcon } from '@navikt/aksel-icons'
import {
  Alert,
  Button,
  Checkbox,
  CheckboxGroup,
  Heading,
  HStack,
  Loader,
  Table,
  TextField,
  VStack,
} from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { Form, Link, useFetcher, useNavigation, useOutletContext } from 'react-router'
import { formatIsoTimestamp } from '~/common/date'
import { useRevalidateOnInterval } from '~/common/useRevalidateOnInterval'
import { BehandlingBatchDetaljertFremdriftBarChart } from '~/components/behandling-batch-fremdrift/BehandlingBatchDetaljertFremdriftBarChart'
import { Entry } from '~/components/entry/Entry'
import { startOrkestrering } from '~/regulering/regulering.server'
import type { AggregerteFeilmeldinger, ReguleringDetaljer, ReguleringOrkestrering } from '~/regulering/regulering.types'
import { Behandlingstatus, type DetaljertFremdriftDTO } from '~/types'
import type { Route } from './+types/batch.regulering.orkestrering'

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const antallFamilier = formData.get('antallFamilier') as string
  const kjorOnline = (formData.get('kjorOnline') as string) === 'true'
  const brukKjoreplan = (formData.get('brukKjoreplan') as string) === 'true'
  const skalSamordne = (formData.get('skalSamordne') as string) === 'true'
  return await startOrkestrering(request, antallFamilier, kjorOnline, brukKjoreplan, skalSamordne)
}

export default function Orkestrering() {
  const { uttrekk, orkestreringer } = useOutletContext<ReguleringDetaljer>()
  const [antallFamilier, setAntallFamilier] = useState('100000')
  const navigation = useNavigation()

  useRevalidateOnInterval({
    enabled: true,
    interval: 1500,
  })

  if (uttrekk === null) {
    return (
      <Alert variant="info" inline>
        Uttrekk ikke kjørt enda.
      </Alert>
    )
  }

  return (
    <>
      <HStack gap="space-20">
        <VStack gap="space-20">
          <Heading level="2" size="medium">
            Start orkestrering
          </Heading>
          <Entry labelText="Antall ubehandlede familier">{uttrekk.antallUbehandlede}</Entry>
          <Entry labelText="Antall ekskluderte saker">{uttrekk.antallEkskluderteSaker}</Entry>
          <Form method="post">
            <VStack gap="space-12">
              <TextField
                label="Antall familier"
                name="antallFamilier"
                onChange={(e) => setAntallFamilier(e.target.value)}
                value={antallFamilier}
              />
              <CheckboxGroup legend="Kjøreparametre" hideLegend={true}>
                <Checkbox name={'kjorOnline'} value={'true'}>
                  Kjør online kø mot oppdrag
                </Checkbox>
                <Checkbox name={'brukKjoreplan'} value={'true'}>
                  Bruk kjøreplan
                </Checkbox>
                <Checkbox name={'skalSamordne'} value={'true'}>
                  Send til samordning
                </Checkbox>
              </CheckboxGroup>
              <HStack gap="space-12" align="center">
                <div>
                  <Button loading={navigation.state === 'submitting'} type="submit">
                    Start orkestrering
                  </Button>
                </div>
                {orkestreringer.length > 0 && (
                  <Link to="/batch/regulering/administrerbehandlinger">Administrer tilknyttede behandlinger</Link>
                )}
              </HStack>
            </VStack>
          </Form>
        </VStack>
      </HStack>
      <VStack gap="space-20">
        <HStack gap="space-40">
          <VStack gap="space-16" style={{ paddingRight: '5rem' }}>
            <Heading level="2" size="medium">
              Orkestreringer
            </Heading>
            {orkestreringer.length === 0 && (
              <Alert variant="info" inline>
                Ingen kjøringer enda
              </Alert>
            )}
            {orkestreringer.map((orkestrering, idx) => (
              <OrkestreringDetaljer
                key={orkestrering.behandlingId}
                visStatistikk={idx === 0}
                orkestrering={orkestrering}
              />
            ))}
          </VStack>
          <VStack gap="space-20">{orkestreringer.length !== 0 && <AggregerteFeilmeldingerTabell />}</VStack>
        </HStack>
      </VStack>
    </>
  )
}

export function OrkestreringDetaljer({
  orkestrering,
  visStatistikk,
}: {
  orkestrering: ReguleringOrkestrering
  visStatistikk: boolean
}) {
  const fetcher = useFetcher()

  function pauseOrkestrering() {
    fetcher.submit(
      { behandlingId: orkestrering.behandlingId },
      {
        method: 'post',
        action: `pause/${orkestrering.behandlingId}`,
      },
    )
  }

  function fortsettOrkestrering() {
    fetcher.submit(
      { behandlingId: orkestrering.behandlingId },
      {
        method: 'post',
        action: `fortsett/${orkestrering.behandlingId}`,
      },
    )
  }

  return (
    <VStack gap="space-20">
      <HStack gap="space-20" align="end">
        <Entry labelText="Status">
          {orkestrering.status === Behandlingstatus.OPPRETTET && (
            <Alert variant="info" size="small" inline>
              Opprettet
            </Alert>
          )}
          {orkestrering.status === Behandlingstatus.UNDER_BEHANDLING && (
            <Alert variant="info" size="small" inline>
              <HStack gap="space-8">
                Under behandling <Loader size="small" title="Under behandling…" />
              </HStack>
            </Alert>
          )}
          {orkestrering.status === Behandlingstatus.FULLFORT && (
            <Alert variant="success" size="small" inline>
              Fullført
            </Alert>
          )}
          {orkestrering.status === Behandlingstatus.STOPPET && (
            <Alert variant="error" size="small" inline>
              Stoppet
            </Alert>
          )}
          {orkestrering.status === Behandlingstatus.DEBUG && (
            <Alert variant="error" size="small" inline>
              Debug
            </Alert>
          )}
        </Entry>
        <Entry labelText="Kjøringstidspunkt">{formatIsoTimestamp(orkestrering.kjoringsdato)}</Entry>
        <Entry labelText="Antall familier">
          {orkestrering.opprettAntallFamilier === -1 ? 'Alle' : orkestrering.opprettAntallFamilier}
        </Entry>
        <Entry labelText="Behandling">
          <Link to={`/behandling/${orkestrering.behandlingId}`} target="_blank">
            Gå til behandling
          </Link>
        </Entry>
        {orkestrering.status === Behandlingstatus.UNDER_BEHANDLING && (
          <div>
            <Button
              data-color="neutral"
              size="xsmall"
              variant="secondary"
              loading={fetcher.state === 'submitting'}
              icon={<PauseIcon />}
              onClick={() => pauseOrkestrering()}
            >
              Pause
            </Button>
          </div>
        )}
        {orkestrering.status === Behandlingstatus.DEBUG && (
          <Button size="xsmall" variant="secondary" icon={<PlayIcon />} onClick={() => fortsettOrkestrering()}>
            Fortsett
          </Button>
        )}
      </HStack>
      <HStack>
        {visStatistikk && (
          <OrkestreringStatistikk behandlingId={orkestrering.behandlingId} behandlingStatus={orkestrering.status} />
        )}
      </HStack>
    </VStack>
  )
}

export function OrkestreringStatistikk({ behandlingId }: { behandlingId: string; behandlingStatus: Behandlingstatus }) {
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
    }, 6000)

    return () => clearInterval(interval)
  }, [fetcher, behandlingId])

  const orkestreringStatistikk = fetcher.data as DetaljertFremdriftDTO | undefined

  if (orkestreringStatistikk === undefined) {
    return null
  }
  return <BehandlingBatchDetaljertFremdriftBarChart detaljertFremdrift={orkestreringStatistikk} />
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
    }, 6000)

    return () => clearInterval(interval)
  }, [fetcher])

  const aggregerteFeilmeldingerWrapper = fetcher.data as AggregerteFeilmeldinger | undefined

  if (aggregerteFeilmeldingerWrapper === undefined && fetcher.state === 'loading') {
    return <Loader size="small" title="Laster feilmeldinger…" />
  }

  if (aggregerteFeilmeldingerWrapper === undefined) {
    return null
  }

  const { aggregerteFeilmeldinger } = aggregerteFeilmeldingerWrapper

  return (
    <VStack gap="space-20">
      <Heading level="2" size="medium">
        Feilmeldinger
      </Heading>
      <HStack style={{ marginLeft: 'auto' }} gap="space-12">
        {aggregerteFeilmeldinger.length > 0 && (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Antall</Table.HeaderCell>
                <Table.HeaderCell>Feilmelding</Table.HeaderCell>
                <Table.HeaderCell>Aktivitet</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {aggregerteFeilmeldinger.map((feilmelding) => (
                <Table.Row key={feilmelding.aktivitet + feilmelding.feilmelding}>
                  <Table.DataCell>{feilmelding.antall}</Table.DataCell>
                  <Table.DataCell>{feilmelding.feilmelding}</Table.DataCell>
                  <Table.DataCell>{feilmelding.aktivitet}</Table.DataCell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
        {aggregerteFeilmeldinger.length === 0 && (
          <Alert variant="success" inline>
            Ingen feilmeldinger enda
          </Alert>
        )}
      </HStack>
      <HStack>
        <Entry labelText="Antall venter på Rune">{aggregerteFeilmeldingerWrapper.antallVenterPaaRune}</Entry>
      </HStack>
    </VStack>
  )
}
