import { PersonIcon } from '@navikt/aksel-icons'
import { Button, Dialog, Tooltip, UNSAFE_Combobox } from '@navikt/ds-react'
import { useState } from 'react'
import type { BehandlingDto, KontrollpunktDecode } from '~/types'

export interface Props {
  behandling: BehandlingDto
  sendTilManuellMedKontrollpunkt: (kontrollpunkt: string) => void
}

export default function SendTilManuellMedKontrollpunktModal(props: Props) {
  const [valgtKontrollpunkt, setKontrollpunkt] = useState<KontrollpunktDecode | null>(null)

  return (
    <Dialog>
      <Tooltip content="Fortsett videre behandling manuelt med oppgitt kontrollpunkt">
        <Dialog.Trigger>
          <Button data-color="danger" variant={'secondary'} icon={<PersonIcon aria-hidden />}>
            Manuell behandling
          </Button>
        </Dialog.Trigger>
      </Tooltip>
      <Dialog.Popup style={{ minHeight: '550px' }}>
        <Dialog.Header>
          <Dialog.Title>Manuell behandling</Dialog.Title>
          <Dialog.Description>
            Dette vil avbryte automatisk behandling og sette kravet til manuelt behandling. Kontrollpunktet vil bli
            lagret på kravet og det vil bli opprettet en oppgave med oppgitt kontrollpunkt. Det er ikke mulig å angre
            denne handlingen.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Body>
          <UNSAFE_Combobox
            label="Velg kontrollpunkt"
            onToggleSelected={(option, isSelected) =>
              isSelected
                ? setKontrollpunkt(
                    Object.entries(props.behandling.muligeKontrollpunkt).filter(
                      (it) => it[1].kontrollpunkt === option,
                    )[0][1],
                  )
                : setKontrollpunkt(null)
            }
            shouldAutocomplete
            options={Object.entries(props.behandling.muligeKontrollpunkt || []).map(([_key, value]) => {
              return {
                label: `${value.decode} [${value.kontrollpunkt}]`,
                value: value.kontrollpunkt,
              }
            })}
          />
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.CloseTrigger>
            <Button type="button" variant="secondary">
              Avbryt
            </Button>
          </Dialog.CloseTrigger>
          <Button
            data-color="danger"
            type="button"
            variant="primary"
            disabled={valgtKontrollpunkt == null}
            onClick={() => {
              if (valgtKontrollpunkt) {
                props.sendTilManuellMedKontrollpunkt(valgtKontrollpunkt.kontrollpunkt)
              }
            }}
          >
            Manuell behandling
          </Button>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog>
  )
}
