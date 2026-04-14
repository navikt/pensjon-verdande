import 'chart.js/auto'
import {
  Alert,
  BodyLong,
  BodyShort,
  Button,
  DatePicker,
  Heading,
  HStack,
  Loader,
  Modal,
  ProgressBar,
  ReadMore,
  Table,
  VStack,
} from '@navikt/ds-react'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { Link, useFetcher, useOutletContext } from 'react-router'
import { formatIsoDate, formatIsoTimestamp } from '~/common/date'
import { useRevalidateOnInterval } from '~/common/useRevalidateOnInterval'
import { Entry } from '~/components/entry/Entry'
import type { ReguleringAktiveReferansebelop, ReguleringDetaljer } from '~/regulering/regulering.types'
import { Behandlingstatus } from '~/types'

export default function Uttrekk() {
  const { uttrekk } = useOutletContext<ReguleringDetaljer>()

  useRevalidateOnInterval({
    enabled: true,
    interval: uttrekk?.status === Behandlingstatus.UNDER_BEHANDLING ? 500 : 6000,
  })

  const [isStartUttrekkOpen, setIsStartUttrekkOpen] = useState(false)
  const [isOppdaterUttrekkOpen, setIsOppdaterUttrekkOpen] = useState(false)
  return (
    <>
      <HStack>
        {uttrekk !== null && uttrekk.behandlingId !== null && (
          <VStack gap="space-12">
            {uttrekk.status === Behandlingstatus.UNDER_BEHANDLING && (
              <Alert variant="info" inline>
                <VStack gap="space-8">
                  <HStack gap="space-8">
                    <div>Uttrekk er under behandling: {uttrekk.steg}</div>
                    <Loader title="Behandler uttrekk…" />
                  </HStack>
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
              <Alert variant="error" inline>
                Uttrekk er stoppet manuelt
              </Alert>
            )}
            {uttrekk.feilmelding !== null && (
              <Alert variant="warning" inline>
                {uttrekk.feilmelding}
              </Alert>
            )}
            {uttrekk.status === Behandlingstatus.FULLFORT && (
              <Alert variant="success" inline>
                <VStack gap="space-8">Uttrekk er fullført {formatIsoTimestamp(uttrekk.uttrekkDato)}</VStack>
              </Alert>
            )}
            <HStack gap="space-12">
              <ReadMore header="Vis kjøretid for aktiviteter">
                <VStack>
                  {uttrekk?.kjoretidAktiviteter.map((aktivitet) => (
                    <Alert variant="success" inline size="small" key={aktivitet.aktivitet}>
                      {aktivitet.minutter}min {aktivitet.sekunder}s - {aktivitet.aktivitet}
                    </Alert>
                  ))}
                </VStack>
              </ReadMore>
            </HStack>
            <HStack gap="space-20">
              <Entry labelText={'Satsdato'}>{formatIsoDate(uttrekk?.satsDato)}</Entry>
              <Entry labelText={'Populasjon'}>{uttrekk?.arbeidstabellSize}</Entry>
              <Entry labelText={'Antall familier'}>{uttrekk?.familierTabellSize}</Entry>

              <Entry labelText={'Behandling'}>
                <Link to={`/behandling/${uttrekk.behandlingId}`} target="_blank">
                  Gå til behandling
                </Link>
              </Entry>
            </HStack>
          </VStack>
        )}
      </HStack>
      <HStack gap="space-12" align="center">
        {(uttrekk === null ||
          uttrekk.behandlingId == null ||
          uttrekk.status === Behandlingstatus.FULLFORT ||
          uttrekk.status === Behandlingstatus.STOPPET) && (
          <Button onClick={() => setIsStartUttrekkOpen(true)}>Kjør uttrekk</Button>
        )}
        {(uttrekk === null ||
          uttrekk.behandlingId == null ||
          uttrekk.status === Behandlingstatus.FULLFORT ||
          uttrekk.status === Behandlingstatus.STOPPET) && (
          <Button onClick={() => setIsOppdaterUttrekkOpen(true)}>Oppdater uttrekk</Button>
        )}
        {uttrekk?.status === Behandlingstatus.FULLFORT && (
          <Link to="/batch/regulering/orkestrering">Gå til Orkestrering</Link>
        )}
      </HStack>
      <HStack>
        <VStack gap="space-20">
          <ReferansebelopTabell />
        </VStack>
      </HStack>
      <StartUttrekkModal isOpen={isStartUttrekkOpen} onClose={() => setIsStartUttrekkOpen(false)} />
      <OppdaterUttrekkModal isOpen={isOppdaterUttrekkOpen} onClose={() => setIsOppdaterUttrekkOpen(false)} />
    </>
  )
}

function StartUttrekkModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const year = new Date().getFullYear()
  const defaultSatsdato = new Date(`1 May ${year}`)
  const [satsDato, setSatsDato] = useState<Date | undefined>(defaultSatsdato)
  const fetcher = useFetcher()

  function startUttrekk() {
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
        <VStack gap="space-20">
          <BodyLong>Velg satsdato</BodyLong>
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
        <Button type="button" variant="secondary" onClick={() => onClose()}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

function OppdaterUttrekkModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const fetcher = useFetcher()

  function oppdaterUttrekk() {
    fetcher.submit(
      {
        initieltUttrekk: false,
      },
      {
        action: 'oppdaterUttrekk',
        method: 'POST',
        encType: 'application/json',
      },
    )
    onClose()
  }

  return (
    <Modal header={{ heading: 'Oppdater uttrekk' }} open={isOpen} onClose={() => onClose()}>
      <Modal.Body>
        <VStack gap="space-20">
          <BodyLong>Dette vil oppdatere arbeidstabellene med familiesammenstøt som nå er klare for regulering</BodyLong>
        </VStack>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={oppdaterUttrekk} loading={fetcher.state === 'submitting'}>
          Oppdater uttrekk
        </Button>
        <Button type="button" variant="secondary" onClick={() => onClose()}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export function ReferansebelopTabell() {
  const fetcher = useFetcher()

  // On Mount
  useEffect(() => {
    if (fetcher.data === undefined && fetcher.state === 'idle') {
      fetcher.load('hentAktiveReferansebelop')
    }
  }, [fetcher])

  const aktiveReferansebelopWrapper = fetcher.data as ReguleringAktiveReferansebelop | undefined

  if (aktiveReferansebelopWrapper === undefined && fetcher.state === 'loading') {
    return <Loader size="small" title="Laster referansebelop…" />
  }

  if (aktiveReferansebelopWrapper === undefined) {
    return null
  }

  const { referansebelop } = aktiveReferansebelopWrapper

  return (
    <VStack gap="space-20">
      <Heading level="2" size="medium">
        Referansebeløp
      </Heading>
      <HStack style={{ marginLeft: 'auto' }} gap="space-12">
        {referansebelop.length > 0 && (
          <Table size="small">
            <BodyShort as="caption" visuallyHidden>
              Referansebeløp
            </BodyShort>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Årskull</Table.HeaderCell>
                <Table.HeaderCell align="right">Beløp</Table.HeaderCell>
                <Table.HeaderCell>Fra-og-med</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {referansebelop.map((belop) => (
                <Table.Row key={belop.arskull + belop.referansebelop}>
                  <Table.DataCell>{belop.arskull}</Table.DataCell>
                  <Table.DataCell align="right">{belop.referansebelop}</Table.DataCell>
                  <Table.DataCell>{belop.fomDato}</Table.DataCell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
        {referansebelop.length === 0 && (
          <Alert variant="warning" inline>
            Ingen aktive referansebeløp funnet i Pen
          </Alert>
        )}
      </HStack>
    </VStack>
  )
}
