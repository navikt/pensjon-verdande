import 'chart.js/auto'
import type { ReguleringDetaljer } from '~/regulering/regulering.types'
import { useState } from 'react'
import {
  Alert,
  BodyLong,
  Button,
  DatePicker,
  HStack,
  Loader,
  Modal,
  ProgressBar,
  ReadMore,
  VStack,
} from '@navikt/ds-react'
import { Behandlingstatus } from '~/types'
import { formatIsoDate, formatIsoTimestamp } from '~/common/date'
import { Entry } from '~/components/entry/Entry'
import { Link, useFetcher, useOutletContext } from 'react-router';
import { format, formatISO } from 'date-fns'
import { useRevalidateOnInterval } from '~/common/useRevalidateOnInterval'

export default function Uttrekk() {

  const { uttrekk } = useOutletContext<ReguleringDetaljer>()

  useRevalidateOnInterval({
    enabled: true,
    interval: uttrekk?.status === Behandlingstatus.UNDER_BEHANDLING ? 500 : 1500,
  })

  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <HStack>
        {uttrekk !== null && uttrekk.behandlingId !== null &&
          <VStack gap="3">
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

                <Entry labelText={'Behandling'}>
                  <Link to={`/behandling/${uttrekk.behandlingId}`} target="_blank">Gå til
                    behandling</Link>
                </Entry>
            </HStack>
          </VStack>
        }
      </HStack>
      <HStack gap="3" align="center">
        {(uttrekk === null || uttrekk.behandlingId == null || (uttrekk.status === Behandlingstatus.FULLFORT || uttrekk.status === Behandlingstatus.STOPPET))
          && <Button onClick={() => setIsOpen(true)}>Kjør uttrekk</Button>
        }
        {uttrekk?.status === Behandlingstatus.FULLFORT &&
          <Link to="/batch/reguleringv2/orkestrering">Gå til Orkestrering</Link>
        }
      </HStack>
      <StartUttrekkModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )

}

function StartUttrekkModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {

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








