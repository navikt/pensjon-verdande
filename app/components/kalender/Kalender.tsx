import { getDato } from '~/common/date'
import Dag from '~/components/kalender/Dag'
import { getWeek, getWeekYear } from '~/common/weeknumber'
import { Button, Heading, HStack, Spacer } from '@navikt/ds-react'
import React, { useState } from 'react'
import { BehandlingDto } from '~/types'
import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons'

const weekdays = ['man.', 'tir.', 'ons.', 'tor.', 'fre.', 'lør.', 'søn.']

export type Props = {
  behandlinger: BehandlingDto[],
  visKlokkeSlett: boolean,
}

export default function Kalender(props: Props) {
  const [valgtDato, setValgtDato] = useState(new Date())
  let firstInThisMonth = new Date(valgtDato.getFullYear(), valgtDato.getMonth(), 1)
  let forsteUkeNr = getWeek(firstInThisMonth)

  function day(ukenr: number, colIdx: number) {
    return getDato(getWeekYear(valgtDato), ukenr, colIdx + 1)
  }

  function iDag() {
    setValgtDato(new Date());
  }

  function forrigeMaaned() {
    const prevMonth = new Date(valgtDato);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setValgtDato(prevMonth);
  }

  function nesteMaaned() {
    const nextMonth = new Date(valgtDato);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setValgtDato(nextMonth);
  }

  return (
    <div>
      <Heading size={'xlarge'} level="1" spacing>
        <HStack align="center">
          <span><strong>{valgtDato.toLocaleDateString('no-NO', { month: 'long' })}</strong> {valgtDato.getFullYear()}</span>
          <Spacer></Spacer>
          <HStack gap="1" style={{ height: '10px' }}>
            <Button icon={<ChevronLeftIcon title="Forrige måned" />} variant="primary-neutral" size="xsmall" onClick={forrigeMaaned}></Button>
            <Button variant="primary-neutral" size="xsmall" onClick={iDag}>I dag</Button>
            <Button icon={<ChevronRightIcon title="Neste måned" />} variant="primary-neutral" size="xsmall" onClick={nesteMaaned}></Button>
          </HStack>
        </HStack>
      </Heading>

      <table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}>
        <thead>
        <tr>
          {weekdays.map((day) => (
            <th key={day} style={{ textAlign: 'right', width: 'calc(100% / 7)', maxWidth: 'calc(100% / 7)' }}>{day}</th>
          ))}
        </tr>
        </thead>
        <tbody>
        {[...Array(6)].map((_, rowIdx) => (
          <>
            <tr key={rowIdx + 'dato'} style={{ height: '8em', verticalAlign: 'top' }}>
              {[...Array(7)].map((_, colIdx) => (
                <td key={'col' + colIdx + 'row' + rowIdx}
                    style={{ border: '1px solid #ddd', width: 'calc(100% / 7)', maxWidth: 'calc(100% / 7)' }}>
                  <Dag
                    highlightMaaned={valgtDato}
                    dato={day(rowIdx + forsteUkeNr, colIdx)}
                    behandlinger={props.behandlinger}
                    visKlokkeSlett={props.visKlokkeSlett}
                  ></Dag>
                </td>
              ))}
            </tr>
          </>
        ))}
        </tbody>
      </table>
    </div>
  )
}