import type { BehandlingDto, KontrollpunktDecode } from '~/types'
import { Button, Modal, Tooltip, UNSAFE_Combobox } from '@navikt/ds-react'
import { PersonIcon } from '@navikt/aksel-icons'
import type { RefObject } from 'react'
import { useState } from 'react'

export interface Props {
  modalRef: RefObject<HTMLDialogElement | null>
  behandling: BehandlingDto
  sendTilManuellMedKontrollpunkt: (kontrollpunkt: string) => void
}


export default function SendTilManuellMedKontrollpunktModal(props: Props) {
  const [valgtKontrollpunkt, setKontrollpunkt] = useState<KontrollpunktDecode | null>(null)

  return (
    <>
      <Tooltip content='Fortsett videre behandling manuelt med oppgitt kontrollpunkt'>
        <Button
          variant={'danger'}
          icon={<PersonIcon aria-hidden />}
          onClick={() => props.modalRef.current?.showModal()}
        >
          Manuell behandling
        </Button>
      </Tooltip>

      <Modal
        ref={props.modalRef}
        header={{ heading: 'Manuell behandling' }}
        placement="top"
      >
        <Modal.Body style={{ minHeight: "550px" }}>
          Dette vil avbryte automatisk behandling og sette kravet til manuelt behandling. Kontrollpunktet vil bli
          lagret på kravet og det vil bli opprettet en oppgave med oppgitt kontrollpunkt. Det er ikke mulig å angre
          denne handlingen

          <form method="dialog" id="skjema" onSubmit={() => alert("onSubmit")}>

            <UNSAFE_Combobox label="Velg kontrollpunkt"
                             onToggleSelected={(option, isSelected) =>
                               isSelected
                                 ? setKontrollpunkt(Object.entries(props.behandling.muligeKontrollpunkt).filter(it => it[1].kontrollpunkt === option)[0][1])
                                 : setKontrollpunkt(null)
                             }
                             shouldAutocomplete
                             options={
                               Object.entries(props.behandling.muligeKontrollpunkt || []).map(([key, value]) => {
                                 return ({
                                   label: `${value.decode} [${value.kontrollpunkt}]`,
                                   value: value.kontrollpunkt,
                                 })
                               })
                             } />
          </form>

        </Modal.Body>
        <Modal.Footer>
          <Button type='button' variant='danger' disabled={valgtKontrollpunkt == null} onClick={() => valgtKontrollpunkt ? props.sendTilManuellMedKontrollpunkt(valgtKontrollpunkt.kontrollpunkt) : null}>
            Manuell behandling
          </Button>
          <Button
            type='button'
            variant='secondary'
            onClick={() => props.modalRef.current?.close()}
          >
            Avbryt
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )

}
