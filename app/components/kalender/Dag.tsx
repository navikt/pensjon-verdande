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
  maksAntallPerDag?: number
}

const formatTidspunkt = (datoStr: string) => {
  const dato = new Date(datoStr);
  return `${dato.getHours().toString().padStart(2, '0')}:${dato.getMinutes().toString().padStart(2, '0')}`;
};

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

  function behandlingElement(behandling: BehandlingDto, textColor: string, visKlokkeSlett: boolean) {
    return <HStack
      key={`behandling-${behandling.behandlingId}`}
      style={{ fontSize: '0.8em' }}
    >
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
          {visKlokkeSlett && <span style={{
            textAlign: 'right',
            color: textColor,
          }}>{formatTidspunkt(behandling.opprettet)}</span>}
          </span>
    </HStack>
  }

  function visDagensBehandlingerMedBegrensning(maksAntall: number = 5) {
    const dagens = props.behandlinger.filter((b) =>
      isSameDay(new Date(b.opprettet), props.dato)
    ).sort((a, b) => a.opprettet.localeCompare(b.opprettet))

    const behandlingerSomVises =
      dagens.length > maksAntall
        ? dagens.slice(0, maksAntall - 1)
        : dagens

    const antallEkstra = Math.max(0, dagens.length - behandlingerSomVises.length)

    const behandlingElementer = behandlingerSomVises.map((behandling) =>
      behandlingElement(behandling, textColor, props.visKlokkeSlett)
    )

    if (antallEkstra > 0) {
      behandlingElementer.push(
        <HStack key="ekstra" style={{ fontSize: '0.8em' }}>
          <span style={{
            color: textColor,
          }}>
            og {antallEkstra} til
          </span>
        </HStack>
      )
    }

    return behandlingElementer
  }

  return (
    <table style={{ width: '100%', tableLayout: 'fixed' }}>
      <thead>
      <tr>
        <td>
          {dayRow()}
        </td>
      </tr>
      </thead>
      <tbody>
      <tr>
        <td>
          {visDagensBehandlingerMedBegrensning(props.maksAntallPerDag)}
        </td>
      </tr>
      </tbody>
    </table>
  )

}