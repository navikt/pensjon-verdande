import { isSameDay } from '~/common/date'
import { getWeek } from '~/common/weeknumber'
import { BehandlingDto } from '~/types'
import { Link as ReactRouterLink } from 'react-router'
import React from 'react'
import { Link } from '@navikt/ds-react'
import { decodeBehandling } from '~/common/decodeBehandling'

export type Props = {
  highlightMaaned: Date,
  dato: Date,
  behandlinger: BehandlingDto[],
  visKlokkeSlett: boolean,
}

export default function Dag(props: Props) {
  let dagLabel: string
  if (props.dato.getDate() === 1) {
    dagLabel = props.dato.getDate() + '. ' +  props.dato.toLocaleDateString('no-NO', { month: 'long' })
  } else {
    dagLabel = props.dato.getDate().toString()
  }

  let textColor: string
  if (props.dato.getFullYear() === props.highlightMaaned.getFullYear() && props.dato.getMonth() === props.highlightMaaned.getMonth()) {
    textColor = 'black'
  } else {
    textColor = 'gray'
  }

  function dayRow() {
    if (props.dato.getDay() === 1) {
      return(
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ textAlign: 'left', color: 'gray', fontSize: '0.9em' }}>{getWeek(props.dato)}</span>
            <span style={{ textAlign: 'right', color: textColor }}>{dagLabel}</span>
          </div>
      );

    } else {
      return(
        <div style={{color: textColor, textAlign: 'right'}}>{dagLabel}</div>
      );
    }
  }

  function dagensBehandlinger() {
    return props.behandlinger
      .filter((behandling) => isSameDay(new Date(behandling.opprettet), props.dato))
      .map((behandling, idx) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.8em' }}>
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
            >
              {decodeBehandling(behandling.type)}
            </Link>
          </span>
          {props.visKlokkeSlett && <span style={{ textAlign: 'right', color: textColor }}>{new Date(behandling.opprettet).getHours().toString().padStart(2, '0') + ':' + new Date(behandling.opprettet).getMinutes().toString().padStart(2, '0')}</span>}
        </div>
      ));
  }

  return(
    <table style={{width: '100%', tableLayout: 'fixed'}}>
      <thead>
      <tr>
        {dayRow()}
      </tr>
      </thead>
      <tbody>
      <tr>{dagensBehandlinger()}</tr>
      </tbody>
    </table>
  );

}