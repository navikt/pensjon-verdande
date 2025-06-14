import { getDato } from '~/common/date'
import Dag from '~/components/kalender/Dag'
import { PlanlagtOppgave } from '~/components/kalender/types'
import { getWeek, getWeekYear } from '~/common/weeknumber'
import { Heading } from '@navikt/ds-react'
import React from 'react'

const weekdays = ['man.', 'tir.', 'ons.', 'tor.', 'fre.', 'lør.', 'søn.']

export type Props = {
  planlagteOppgaver: PlanlagtOppgave[],
  visKlokkeSlett: boolean,
}

export default function Kalender(props: Props) {
  let now = new Date()
  let firstInThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  let førsteUkeNr = getWeek(firstInThisMonth)

  function day(ukenr: number, colIdx: number) {
    return getDato(getWeekYear(now), ukenr, colIdx + 1)
  }

  return (
    <div>
      <Heading size={'xlarge'} level="1" spacing>
        <strong>juni</strong> 2025
      </Heading>

      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
        <tr>
          {weekdays.map((day) => (
            <th key={day} style={{ textAlign: 'right', width: 'calc(100% / 7)' }}>{day}</th>
          ))}
        </tr>
        </thead>
        <tbody>
        {[...Array(6)].map((_, rowIdx) => (
          <>
            <tr key={rowIdx + 'dato'} style={{ height: '8em', verticalAlign: 'top' }}>
              {[...Array(7)].map((_, colIdx) => (
                <Dag
                  highlightMaaned={now}
                  dato={day(rowIdx + førsteUkeNr, colIdx)}
                  planlagteOppgaver={props.planlagteOppgaver}
                  visKlokkeSlett={props.visKlokkeSlett}
                ></Dag>
              ))}
            </tr>
          </>
        ))}
        </tbody>
      </table>
    </div>
  )
}