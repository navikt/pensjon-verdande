import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons'
import { Box, Button, Heading, HStack, Spacer } from '@navikt/ds-react'
import { addDays, eachWeekOfInterval, startOfISOWeek, startOfMonth } from 'date-fns'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { erHelgedag, isSameDay } from '~/common/date'
import Dag from '~/components/kalender/Dag'
import type { KalenderHendelser } from '~/components/kalender/types'

const weekdays = ['man.', 'tir.', 'ons.', 'tor.', 'fre.', 'lør.', 'søn.']
const antallUker = 6

/**
 * Returnerer første og siste dag som vises og hentes for kalenderen for en gitt dato
 */
export function forsteOgSisteDatoForKalender(dato: Date): { forsteDato: Date; sisteDato: Date } {
  const forsteDato = startOfISOWeek(startOfMonth(dato))

  return {
    forsteDato,
    sisteDato: addDays(forsteDato, antallUker * 7 - 1),
  }
}

export type Props = {
  kalenderHendelser: KalenderHendelser
  maksAntallPerDag: number
  startDato: Date
  visKlokkeSlett: boolean
  serverIDag?: string
}

function backgroundColorForDato(kalenderHendelser: KalenderHendelser, dato: Date): string {
  if (erHelgedag(dato) || kalenderHendelser.offentligeFridager.find((it) => isSameDay(it.dato, dato)) !== undefined) {
    return 'var(--ax-bg-neutral-soft)'
  } else {
    return 'transparent'
  }
}

export default function Kalender(props: Props) {
  const valgtDato = props.startDato
  const [, setSearchParams] = useSearchParams()
  const { forsteDato, sisteDato } = forsteOgSisteDatoForKalender(valgtDato)
  const uker = eachWeekOfInterval({ start: forsteDato, end: sisteDato }, { weekStartsOn: 1 })

  // Parse YYYY-MM-DD som lokal midnatt (ikke UTC) for konsistent datosammenligning
  function parseLokalDato(isoStr: string): Date {
    const [y, m, d] = isoStr.split('-').map(Number)
    return new Date(y, m - 1, d)
  }

  // Bruk server-datoen som initial verdi for å unngå hydreringsfeil,
  // og oppdater ved midnatt slik at sirkelen flyttes til riktig dag.
  const [iDagDato, setIDagDato] = useState(() => (props.serverIDag ? parseLokalDato(props.serverIDag) : new Date()))

  useEffect(() => {
    let timerRef: ReturnType<typeof setTimeout>

    function planleggMidnattOppdatering() {
      const naa = new Date()
      const nesteMidnatt = new Date(naa.getFullYear(), naa.getMonth(), naa.getDate() + 1)
      const msTilMidnatt = nesteMidnatt.getTime() - naa.getTime() + 100 // +100ms margin

      timerRef = setTimeout(() => {
        setIDagDato(new Date())
        planleggMidnattOppdatering()
      }, msTilMidnatt)
    }

    // Synk med klient-tid etter hydring
    setIDagDato(new Date())
    planleggMidnattOppdatering()

    return () => clearTimeout(timerRef)
  }, [])

  function setValgtDato(dato: Date) {
    setSearchParams({ dato: dato.toISOString().slice(0, 10) })
  }

  function iDag() {
    setValgtDato(new Date())
  }

  function forrigeMaaned() {
    const prevMonth = new Date(valgtDato)
    prevMonth.setMonth(prevMonth.getMonth() - 1)
    setValgtDato(prevMonth)
  }

  function nesteMaaned() {
    const nextMonth = new Date(valgtDato)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    setValgtDato(nextMonth)
  }

  function dag(dato: Date) {
    return (
      <td
        key={dato.getTime()}
        style={{
          border: '1px solid #ddd',
          width: 'calc(100% / 7)',
          maxWidth: 'calc(100% / 7)',
          backgroundColor: backgroundColorForDato(props.kalenderHendelser, dato),
        }}
      >
        <Dag
          dato={dato}
          iDag={iDagDato}
          highlightMaaned={valgtDato}
          kalenderHendelser={props.kalenderHendelser}
          maksAntallPerDag={props.maksAntallPerDag}
          visKlokkeSlett={props.visKlokkeSlett}
        ></Dag>
      </td>
    )
  }

  return (
    <Box background={'raised'} borderRadius="4" shadow="dialog" style={{ padding: '6px' }}>
      <Heading size={'xlarge'} level="1" spacing>
        <HStack align="center" padding="space-4">
          <span>
            <strong>{valgtDato.toLocaleDateString('no-NO', { month: 'long' })}</strong> {valgtDato.getFullYear()}
          </span>
          <Spacer></Spacer>
          <HStack gap="space-4" style={{ height: '10px' }}>
            <Button
              data-color="neutral"
              icon={<ChevronLeftIcon title="Forrige måned" />}
              variant="primary"
              size="xsmall"
              onClick={forrigeMaaned}
            ></Button>
            <Button data-color="neutral" variant="primary" size="xsmall" onClick={iDag}>
              I dag
            </Button>
            <Button
              data-color="neutral"
              icon={<ChevronRightIcon title="Neste måned" />}
              variant="primary"
              size="xsmall"
              onClick={nesteMaaned}
            ></Button>
          </HStack>
        </HStack>
      </Heading>
      <table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}>
        <thead>
          <tr>
            {weekdays.map((day) => (
              <th key={day} style={{ textAlign: 'right', width: 'calc(100% / 7)', maxWidth: 'calc(100% / 7)' }}>
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {uker.map((ukeStart) => (
            <tr key={ukeStart.getTime()} style={{ height: '8em', verticalAlign: 'top' }}>
              {weekdays.map((_, colIdx) => dag(addDays(ukeStart, colIdx)))}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  )
}
