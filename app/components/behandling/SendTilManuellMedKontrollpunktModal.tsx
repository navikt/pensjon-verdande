import { PersonIcon } from '@navikt/aksel-icons'
import { Button, Dialog, Radio, RadioGroup, Textarea, Tooltip, UNSAFE_Combobox, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import type { BehandlingDto, SendTilManuellRequest } from '~/types'

export interface Props {
  behandling: BehandlingDto
  sendTilManuellMedKontrollpunkt: (data: SendTilManuellRequest) => void
  isSubmitting: boolean
  errors?: Record<string, string>
}

export default function SendTilManuellMedKontrollpunktModal(props: Props) {
  const [oppgavetype, setOppgavetype] = useState<'kontrollpunkt' | 'oppgavetekst'>('kontrollpunkt')
  const [valgtKontrollpunkt, setKontrollpunkt] = useState<string | null>(null)
  const [oppgavetekst, setOppgavetekst] = useState('')
  const [valideringsfeil, setValideringsfeil] = useState<string>()

  function sendTilManuell() {
    if (props.isSubmitting) return

    if (oppgavetype === 'oppgavetekst') {
      const tekst = oppgavetekst.trim()
      if (!tekst) {
        setValideringsfeil('Skriv inn oppgavetekst.')
        return
      }
      props.sendTilManuellMedKontrollpunkt({ oppgavetekst: tekst })
    } else if (valgtKontrollpunkt) {
      props.sendTilManuellMedKontrollpunkt({ kontrollpunkt: valgtKontrollpunkt })
    } else {
      setValideringsfeil('Velg et kontrollpunkt.')
    }
  }

  return (
    <Dialog>
      <Tooltip content="Fortsett videre behandling manuelt med kontrollpunkt eller egendefinert oppgavetekst">
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
            Dette vil avbryte automatisk behandling og sette kravet til manuell behandling. Det vil bli opprettet en
            oppgave med valgt kontrollpunkt eller egendefinert oppgavetekst. Velger du kontrollpunkt, blir dette også
            lagret på kravet. Det er ikke mulig å angre denne handlingen.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Body>
          <VStack gap="space-24">
            <RadioGroup
              legend="Grunnlag for manuell behandling"
              value={oppgavetype}
              onChange={(value: 'kontrollpunkt' | 'oppgavetekst') => {
                setOppgavetype(value)
                setValideringsfeil(undefined)
              }}
            >
              <Radio value="kontrollpunkt">Kontrollpunkt</Radio>
              <Radio value="oppgavetekst">Egendefinert oppgavetekst</Radio>
            </RadioGroup>
            {oppgavetype === 'kontrollpunkt' ? (
              <UNSAFE_Combobox
                label="Velg kontrollpunkt"
                selectedOptions={valgtKontrollpunkt ? [valgtKontrollpunkt] : []}
                onToggleSelected={(option, isSelected) => {
                  setKontrollpunkt(isSelected ? option : null)
                  setValideringsfeil(undefined)
                }}
                shouldAutocomplete
                options={(props.behandling.muligeKontrollpunkt ?? []).map((value) => ({
                  label: `${value.decode} [${value.kontrollpunkt}]`,
                  value: value.kontrollpunkt,
                }))}
                error={valideringsfeil ?? props.errors?.kontrollpunkt}
              />
            ) : (
              <Textarea
                label="Oppgavetekst"
                description="Beskriv hvorfor kravet må behandles manuelt. Det blir ikke lagt til et kontrollpunkt."
                value={oppgavetekst}
                onChange={(event) => {
                  setOppgavetekst(event.target.value)
                  setValideringsfeil(undefined)
                }}
                error={valideringsfeil ?? props.errors?.oppgavetekst}
              />
            )}
          </VStack>
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
            disabled={props.isSubmitting}
            loading={props.isSubmitting}
            onClick={sendTilManuell}
          >
            Manuell behandling
          </Button>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog>
  )
}
