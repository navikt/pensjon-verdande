import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons'
import { Box, Button, Heading, HStack, Spacer } from '@navikt/ds-react'
import { useSearchParams } from 'react-router'
import { erHelgedag, getDato, isSameDay } from '~/common/date'
import { getWeek, getWeekYear } from '~/common/weeknumber'
import Dag from '~/components/kalender/Dag'
import type { KalenderHendelser } from '~/components/kalender/types'

const weekdays = ['man.', 'tir.', 'ons.', 'tor.', 'fre.', 'lør.', 'søn.']

/**
 * Returnerer første og siste dag som vil vises i kalenderen for en gitt dato
 */
export function forsteOgSisteDatoForKalender(dato: Date): { forsteDato: Date; sisteDato: Date } {
  const forsteUkeNr = getWeek(new Date(dato.getFullYear(), dato.getMonth(), 1))
  const sisteUkeNr = forsteUkeNr + 5 // kalenderen viser alltid 6 uker i kalenderen

  return {
    forsteDato: getDato(getWeekYear(dato), forsteUkeNr, 1),
    sisteDato: getDato(getWeekYear(dato), sisteUkeNr, 7),
  }
}

export type Props = {
  kalenderHendelser: KalenderHendelser
  maksAntallPerDag: number
  startDato: Date
  visKlokkeSlett: boolean
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
  const firstInThisMonth = new Date(valgtDato.getFullYear(), valgtDato.getMonth(), 1)
  const forsteUkeNr = getWeek(firstInThisMonth)

  function day(ukenr: number, colIdx: number) {
    return getDato(getWeekYear(valgtDato), ukenr, colIdx + 1)
  }

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

  function dag(colIdx: number, rowIdx: number) {
    const dato = day(rowIdx + forsteUkeNr, colIdx)

    return (
      <td
        key={`col:${colIdx} row:${rowIdx}`}
        style={{
          border: '1px solid #ddd',
          width: 'calc(100% / 7)',
          maxWidth: 'calc(100% / 7)',
          backgroundColor: backgroundColorForDato(props.kalenderHendelser, dato),
        }}
      >
        <Dag
          dato={dato}
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
          {[0, 1, 2, 3, 4, 5, 6].map((row) => (
            <tr key={`rad:${row}`} style={{ height: '8em', verticalAlign: 'top' }}>
              {[...Array(7)].map((_, colIdx) => dag(colIdx, row))}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  )
}
