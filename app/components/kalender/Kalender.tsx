import { getDato } from '~/common/date'
import Dag from '~/components/kalender/Dag'
import { getWeek, getWeekYear } from '~/common/weeknumber'
import { Heading } from '@navikt/ds-react'
import React from 'react'
import { BehandlingDto } from '~/types'

const weekdays = ['man.', 'tir.', 'ons.', 'tor.', 'fre.', 'lør.', 'søn.']

export type Props = {
  behandlinger: BehandlingDto[],
  visKlokkeSlett: boolean,
}

export default function Kalender(props: Props) {
  let now = new Date()
  let firstInThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  let forsteUkeNr = getWeek(firstInThisMonth)

  function day(ukenr: number, colIdx: number) {
    return getDato(getWeekYear(now), ukenr, colIdx + 1)
  }

  return (
    <div>
      <Heading size={'xlarge'} level="1" spacing>
        <strong>juni</strong> 2025
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
                    highlightMaaned={now}
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