import { isSameDay } from '~/common/date'
import { getWeek } from '~/common/weeknumber'
import { BehandlingDto } from '~/types'
import { Link as ReactRouterLink } from 'react-router'
import React from 'react'
import { HStack, Link, Spacer } from '@navikt/ds-react'
import { decodeBehandling } from '~/common/decodeBehandling'
import { JSX } from 'react/jsx-runtime'

export type Props = {
  highlightMaaned: Date,
  dato: Date,
  behandlinger: BehandlingDto[],
  visKlokkeSlett: boolean,
}

export default function Dag(props: Props) {
  let dagStreng: string
  if (props.dato.getDate() === 1) {
    dagStreng = props.dato.getDate() + '. ' + props.dato.toLocaleDateString('no-NO', { month: 'long' })
  } else {
    dagStreng = props.dato.getDate().toString() + '.'
  }

  let dagLabel: JSX.Element
  if (isSameDay(props.dato, new Date())) {
    dagLabel = <span
      style={{
        fontWeight: 'bold'
      }}
    >{dagStreng}</span>
  } else {
    dagLabel = <span>{dagStreng}</span>
  }

  let textColor: string
  if (props.dato.getFullYear() === props.highlightMaaned.getFullYear() && props.dato.getMonth() === props.highlightMaaned.getMonth()) {
    textColor = 'black'
  } else {
    textColor = 'gray'
  }

  function dayRow() {
    if (props.dato.getDay() === 1) {
      return (
        <HStack>
          <span style={{ textAlign: 'left', color: 'gray', fontSize: '0.9em' }}>{getWeek(props.dato)}</span>
          <Spacer></Spacer>
          <span style={{ textAlign: 'right', color: textColor }}>{dagLabel}</span>
        </HStack>
      )

    } else {
      return (
        <div style={{ color: textColor, textAlign: 'right' }}>{dagLabel}</div>
      )
    }
  }

  function dagensBehandlinger() {
    return props.behandlinger
      .filter((behandling) => isSameDay(new Date(behandling.opprettet), props.dato))
      .map((behandling, idx) => (
        <HStack style={{ fontSize: '0.8em' }}>
          <span
            style={{
              textAlign: 'left',
              color: textColor,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <Link as={ReactRouterLink}
                  to={`/behandling/${behandling.behandlingId}`}
                  variant="neutral"
                  underline={false}
                  style={{ color: textColor }}
            >
              {decodeBehandling(behandling.type)}
            </Link>
          </span>
          <Spacer></Spacer>
          <span>
          {props.visKlokkeSlett && <span style={{
            textAlign: 'right',
            color: textColor,
          }}>{new Date(behandling.opprettet).getHours().toString().padStart(2, '0') + ':' + new Date(behandling.opprettet).getMinutes().toString().padStart(2, '0')}</span>}
          </span>
        </HStack>
      ))
  }

  return (
    <table style={{ width: '100%', tableLayout: 'fixed' }}>
      <thead>
      <tr>
        {dayRow()}
      </tr>
      </thead>
      <tbody>
      <tr>{dagensBehandlinger()}</tr>
      </tbody>
    </table>
  )

}