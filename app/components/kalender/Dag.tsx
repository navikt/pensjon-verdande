import { Button, HStack, Link, Modal, Spacer, VStack } from '@navikt/ds-react'
import type { JSX } from 'react'
import { useMemo, useState } from 'react'
import { Link as ReactRouterLink } from 'react-router'
import { isSameDay } from '~/common/date'
import { decodeBehandling } from '~/common/decodeBehandling'
import { getWeek } from '~/common/weeknumber'
import type { KalenderBehandling, KalenderHendelser } from '~/components/kalender/types'

export type Props = {
  dato: Date
  highlightMaaned: Date
  maksAntallPerDag?: number
  kalenderHendelser: KalenderHendelser
  visKlokkeSlett: boolean
}

const formatTidspunkt = (datoStr: string) => {
  const dato = new Date(datoStr)
  return `${dato.getHours().toString().padStart(2, '0')}:${dato.getMinutes().toString().padStart(2, '0')}`
}

export default function Dag(props: Props) {
  let dagStreng: string
  if (props.dato.getDate() === 1) {
    dagStreng = `${props.dato.getDate()}. ${props.dato.toLocaleDateString('no-NO', { month: 'short' })}`
  } else {
    dagStreng = `${props.dato.getDate().toString()}.`
  }

  let dagLabel: JSX.Element
  if (isSameDay(props.dato, new Date())) {
    dagLabel = (
      <span
        style={{
          fontWeight: 'bold',
        }}
      >
        {dagStreng}
      </span>
    )
  } else {
    dagLabel = <span>{dagStreng}</span>
  }

  let textColor: string
  if (
    props.dato.getFullYear() === props.highlightMaaned.getFullYear() &&
    props.dato.getMonth() === props.highlightMaaned.getMonth()
  ) {
    textColor = 'var(--ax-text-neutral)'
  } else {
    textColor = 'var(--ax-neutral-600)'
  }

  const offentligFridag = props.kalenderHendelser.offentligeFridager.find((it) => isSameDay(it.dato, props.dato))?.navn

  const [modalOpen, setModalOpen] = useState(false)

  function dayRow() {
    if (props.dato.getDay() === 1) {
      return (
        <HStack>
          <span
            style={{
              textAlign: 'left',
              color: 'var(--ax-neutral-600)',
              fontSize: '0.9em',
            }}
          >
            {getWeek(props.dato)}
          </span>
          <Spacer></Spacer>
          <span style={{ textAlign: 'right', color: textColor }}>{dagLabel}</span>
        </HStack>
      )
    } else {
      return <div style={{ color: textColor, textAlign: 'right' }}>{dagLabel}</div>
    }
  }

  function behandlingElement(behandling: KalenderBehandling, textColor: string, visKlokkeSlett: boolean) {
    return (
      <HStack key={`behandling-${behandling.behandlingId}`} style={{ fontSize: '0.8em' }}>
        <span
          style={{
            textAlign: 'left',
            color: textColor,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <Link
            data-color="neutral"
            as={ReactRouterLink}
            to={`/behandling/${behandling.behandlingId}`}
            underline={false}
            style={{ color: textColor }}
          >
            {decodeBehandling(behandling.type)}
          </Link>
        </span>
        <Spacer></Spacer>
        <span>
          {visKlokkeSlett && (
            <span
              style={{
                textAlign: 'right',
                color: textColor,
              }}
            >
              {formatTidspunkt(behandling.kjoreDato)}
            </span>
          )}
        </span>
      </HStack>
    )
  }
  const dagens = useMemo(
    () =>
      props.kalenderHendelser.kalenderBehandlinger
        .filter((b) => isSameDay(new Date(b.kjoreDato), props.dato))
        .sort((a, b) => a.kjoreDato.localeCompare(b.kjoreDato, 'nb', { sensitivity: 'base' })),
    [props.kalenderHendelser, props.dato],
  )
  function visDagensBehandlingerMedBegrensning(maksAntall: number = 5) {
    const behandlingerSomVises = dagens.length > maksAntall ? dagens.slice(0, Math.max(1, maksAntall - 1)) : dagens
    const antallEkstra = Math.max(0, dagens.length - behandlingerSomVises.length)

    const offentligFridagElement = offentligFridag
      ? [
          <HStack key="kalenderHendelse" style={{ fontSize: '0.8em' }}>
            <span style={{ color: 'red' }}>{offentligFridag}</span>
          </HStack>,
        ]
      : []

    const behandlingElementer = behandlingerSomVises.map((behandling) =>
      behandlingElement(behandling, textColor, props.visKlokkeSlett),
    )

    const ekstraKnapp =
      antallEkstra > 0
        ? [
            <div key="vis-alle" style={{ marginTop: '0.25rem' }}>
              <Button
                size="xsmall"
                variant="tertiary"
                onClick={() => setModalOpen(true)}
                aria-label={`Vis ${antallEkstra} flere behandlinger denne dagen`}
              >
                +{antallEkstra} (Vis alle)
              </Button>
            </div>,
          ]
        : []

    return [...offentligFridagElement, ...behandlingElementer, ...ekstraKnapp]
  }

  return (
    <>
      <table style={{ width: '100%', tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <td>{dayRow()}</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{visDagensBehandlingerMedBegrensning(props.maksAntallPerDag)}</td>
          </tr>
        </tbody>
      </table>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        width="small"
        header={{
          heading: props.dato.toLocaleDateString('no-NO', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          }),
        }}
      >
        <Modal.Body>
          <VStack gap="space-4">
            {offentligFridag && (
              <HStack key="modal-kalenderHendelse" style={{ fontSize: '0.9em' }}>
                <span style={{ color: 'red' }}>{offentligFridag}</span>
              </HStack>
            )}

            {dagens.length === 0 && (
              <span style={{ color: 'var(--ax-neutral-700)' }}>Ingen behandlinger denne dagen.</span>
            )}

            <div style={{ maxHeight: 360, overflow: 'auto', paddingRight: 4 }}>
              {dagens.map((b) => behandlingElement(b, textColor, props.visKlokkeSlett))}
            </div>
          </VStack>
        </Modal.Body>
        <Modal.Footer>
          <Button size="small" onClick={() => setModalOpen(false)}>
            Lukk
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
