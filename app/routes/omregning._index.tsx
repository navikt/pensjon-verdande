import { useFetcher } from '@remix-run/react'
import React, { useEffect, useRef, useState } from 'react'
import {
  BodyLong,
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  HGrid, Link,
  List,
  Modal,
  MonthPicker,
  Select,
  TextField,
  useMonthpicker,
  VStack,
} from '@navikt/ds-react'
import DateTimePicker from '~/components/datetimepicker/DateTimePicker'
import { PlayIcon } from '@navikt/aksel-icons'

export default function BatchOpprett_index() {
  const now = new Date()
  const [isClicked, setIsClicked] = useState(false)
  const [omregningstidspunkt, setOmregningstidspunkt] = useState('')
  const [behandlingsnokkel, setBehandlingsnokkel] = useState('')
  const ref = useRef<HTMLDialogElement>(null)

  const [omregneAFP, setOmregneAFP] = useState(true)
  const [skalSletteIverksettingsoppgaver, setSkalSletteIverksettingsoppgaver] = useState(true)
  const [skalDistribuereUforevedtak, setSkalDistribuereUforevedtak] = useState(true)
  const [skalBestilleBrev, setSkalBestilleBrev] = useState(true)
  const [skalSamordne, setSkalSamordne] = useState(true)
  const [skalSendeBrevBerorteSaker, setSkalSendeBrevBerorteSaker] = useState(false)
  const [behandleApneKrav, setBehandleApneKrav] = useState(false)
  const [brukFaktoromregning, setBrukFaktoromregning] = useState(false)
  const [opprettAlleOppgaver, setOpprettAlleOppgaver] = useState(false)
  const [sjekkYtelseFraAvtaleland, setSjekkYtelseFraAvtaleland] = useState(false)
  const [kjoreTidspunkt, setkjoreTidspunkt] = useState(false)

  const [selectedKjoretidspunkt, setSelectedKjoretidspunkt] = useState<Date | null>(null)

  const [hasError, setHasError] = useState(false)
  const fetcher = useFetcher()

  const handleSubmit = (e: any) => {
    if (hasError) {
      return
    } else {
      fetcher.submit(e.target.form)
      setIsClicked(true)
    }
  }

  const inputRef = useRef<HTMLInputElement>(null)

  const handleInput = () => {
    if (inputRef.current) {
      inputRef.current.style.width = `${inputRef.current.value.length + 1}ch`
    }
  }

  useEffect(() => {
    handleInput()
  })
  const optionsKravGjelder = [
    { value: 'REVURD', label: 'Revurdering' },
    { value: 'REGULERING', label: 'Regulering' },
  ]
  const optionsKravArsak = [
    { value: 'OMREGNING', label: 'Omregning' },
    { value: 'ANNEN_ARSAK', label: 'Annen årsak' },
  ]

  const optionToleransegrenseSett = [
    { value: 'DEFAULT', label: 'Default' },
    { value: 'GPPROD', label: 'GPPROD' },
    { value: 'GJLKAP20', label: 'GJLKAP20' },
    { value: 'ENSLIGE4000', label: 'ENSLIGE4000' },
    { value: 'ENSLIGE5000', label: 'ENSLIGE5000' },
    { value: 'EPS1000', label: 'EPS1000' },
    { value: 'INGEN_ENDR', label: 'INGEN_ENDR' },
    { value: 'AFP2500', label: 'AFP2500' },
    { value: 'UFORE_MYT', label: 'UFORE_MYT' },
    { value: 'not set', label: 'Ikke angitt' },
  ]

  const optionOppgaveSett = [
    { value: 'INGEN_OPPGAVER', label: 'Ingen oppgaver' },
    { value: 'DEFAULT', label: 'Default' },
    { value: 'HENDELSE_UTLAND', label: 'Hendelse utland' },
    { value: 'OPPH_UT', label: 'Opphør utland' },
    { value: 'DOD', label: 'Død' },
    { value: 'BPEN056', label: 'BPEN056' },
    { value: 'SOKNAD_AP', label: 'Søknad AP' },
  ]

  const optionOppgavePrefiks = [
    { value: 'DEFAULT_PREFIKS', label: 'Default prefiks' },
    { value: 'REGELENDRING_PREFIKS', label: 'Regelendring prefiks' },
    { value: 'FEILRETTING_PREFIKS', label: 'Feilretting prefiks' },
  ]

  function setMonthSelected(date: Date | undefined): Date | undefined {
    if (!date) {
      return undefined
    }
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    const behandlingsmaned = year * 100 + month
    setOmregningstidspunkt(behandlingsmaned.toString())
    return date
  }

  const { monthpickerProps, inputProps } = useMonthpicker({
    onMonthChange: setMonthSelected,
    fromDate: new Date(`1 Oct ${now.getFullYear() - 10}`),
    toDate: new Date(`1 Oct ${now.getFullYear() + 1}`),
    onValidate: (val) => {
      if (!val.isValidMonth && val.isEmpty) {
        setHasError(true)
      }
    },
    required: true,
  })


  const [kravGjelder, setKravGjelder] = useState(optionsKravGjelder[0].value)
  const [kravArsak, setKravArsak] = useState(optionsKravArsak[0].value)
  const [toleransegrenseSett, setToleransegrenseSett] = useState(optionToleransegrenseSett[0].value)
  const [oppgaveSett, setOppgaveSett] = useState(optionOppgaveSett[0].value)
  const [oppgavePrefiks, setOppgavePrefiks] = useState(optionOppgavePrefiks[0].value)


  return (
    <div>
      <h1>Omregn ytelser</h1>
      <p>Behandling som erstatter BPEN093</p>
      <p><Link href="https://pensjon-dokumentasjon.intern.dev.nav.no/pen/Behandlinger/Omregning.html" target="_blank">Dokumentasjon</Link></p>

      <fetcher.Form id={'skjema'} action='omregning' method='POST'>
        <Box style={{ display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'center' }}>
          <Checkbox
            value={kjoreTidspunkt}
            onChange={(event) => setkjoreTidspunkt(event.target.checked)}
          >Sett kjøretidspunkt - Ikke implementert</Checkbox>

          <Box hidden={!kjoreTidspunkt}>
            <DateTimePicker
              id='date-picker'
              name={'datetimepicker'}
              labelText='Kjøredato'
              selectedDate={selectedKjoretidspunkt}
              setSelectedDate={(date) => setSelectedKjoretidspunkt(date)}
              placeholderText={'Velg kjøredato'}
              ariaLabel={'Velg kjøredato'}
              tabIndex={6}
            />
          </Box>
        </Box>

        <VStack gap='6'>

          <HGrid columns={2} gap='12'>

            <Box>
              <TextField
                label={'Behandlingsnøkkel'}
                name={'behandlingsnokkel'}
                size='small'
                onChange={(event) => setBehandlingsnokkel(event.target.value)}
              />

              <MonthPicker
                {...monthpickerProps}
              >
                <MonthPicker.Input
                  {...inputProps}
                  label='Velg omregningstidspunkt'
                  error={hasError && 'Du må velge måned'}
                />
              </MonthPicker>
              <input hidden type='text' id='omregningstidspunkt' name='omregningstidspunkt'
                     value={omregningstidspunkt}
                     readOnly />

              <br />
              <br />

              <Select
                label='Krav gjelder'
                name={'kravGjelder'}
                onChange={(event) => setKravGjelder(event.target.value)}>
                {optionsKravGjelder.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <Select
                label={'Kravårsak'}
                name={'kravArsak'}
                onChange={(event) => setKravArsak(event.target.value)}>
                {optionsKravArsak.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <Select
                label={'Toleransegrense sett'}
                name={'toleransegrenseSett'}
                onChange={(event) => setToleransegrenseSett(event.target.value)}>
                {optionToleransegrenseSett.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <Select
                label={'Oppgave sett'}
                name={'oppgaveSett'}
                onChange={(event) => setOppgaveSett(event.target.value)}>
                {optionOppgaveSett.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <Select
                label={'Oppgave prefiks'}
                name={'oppgavePrefiks'}
                onChange={(event) => setOppgavePrefiks(event.target.value)}>
                {optionOppgavePrefiks.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <br />

            </Box>

            <Box>
              <CheckboxGroup legend={'Behandlingsparametere'} name={'behandlingsparametere'} onChange={() => {
                console.log('change')
              }}>
                <Checkbox
                  name='behandleApneKrav'
                  value={behandleApneKrav}
                  onChange={(event) => setBehandleApneKrav(event.target.checked)}
                >
                  Behandle åpne krav
                </Checkbox>

                <Checkbox
                  name='brukFaktoromregning'
                  value={brukFaktoromregning}
                  onChange={(event) => setBrukFaktoromregning(event.target.checked)}
                >
                  Bruk faktoromregning
                </Checkbox>

                <Checkbox
                  name='opprettAlleOppgaver'
                  value={opprettAlleOppgaver}
                  onChange={(event) => setOpprettAlleOppgaver(event.target.checked)}
                >
                  Opprett alle oppgaver
                </Checkbox>

                <Checkbox
                  name='sjekkYtelseFraAvtaleland'
                  value={sjekkYtelseFraAvtaleland}
                  onChange={(event) => setSjekkYtelseFraAvtaleland(event.target.checked)}
                >
                  Sjekk ytelser fra avtaleland
                </Checkbox>

                <Checkbox
                  defaultChecked={skalBestilleBrev}
                  name='skalBestilleBrev'
                  value={skalBestilleBrev}
                  onChange={(event) => setSkalBestilleBrev(event.target.checked)}>
                  Skal bestille brev
                </Checkbox>

                <Checkbox
                  defaultChecked={skalSamordne}
                  name='skalSamordne'
                  value={skalSamordne}
                  onChange={(event) => setSkalSamordne(event.target.checked)}>
                  Skal samordne
                </Checkbox>

                <h3>Følgende verdier er default satt:</h3>
                <Checkbox
                  defaultChecked={omregneAFP}
                  name='omregneAFP'
                  value={omregneAFP}
                  onChange={(event) => {
                    setOmregneAFP(event.target.checked)
                  }}
                >
                  Omregne AFP
                </Checkbox>

                <Checkbox
                  defaultChecked={skalSendeBrevBerorteSaker}
                  name='sendBrevBerorteSaker'
                  value={skalSendeBrevBerorteSaker}
                  onChange={(event) => {
                    setSkalSendeBrevBerorteSaker(event.target.checked)
                  }}
                >
                  Send brev for berørte saker
                </Checkbox>

                <Checkbox
                  defaultChecked={skalSletteIverksettingsoppgaver}
                  name='skalSletteIverksettingsoppgaver'
                  value={skalSletteIverksettingsoppgaver}
                  onChange={(event) => setSkalSletteIverksettingsoppgaver(event.target.checked)}>
                  Skal slette iverksettingsoppgaver
                </Checkbox>

                <Checkbox
                  defaultChecked={skalDistribuereUforevedtak}
                  name='skalDistribuereUforevedtak'
                  value={skalDistribuereUforevedtak}
                  onChange={(event) => setSkalDistribuereUforevedtak(event.target.checked)}>
                  Skal distribuere uførevedtak
                </Checkbox>

              </CheckboxGroup>
            </Box>

          </HGrid>
        </VStack>
      </fetcher.Form>

      <Box>
        <br />
        <Button
          icon={<PlayIcon aria-hidden />}
          onClick={() => ref.current?.showModal()}>
          Start omregning
        </Button>

        <Modal ref={ref} header={{ heading: 'Start Omregning' }}>
          <Modal.Body>
            <BodyLong>
              Du vil nå starte en behandling med følgende parametere:

              {behandlingsnokkel && <p>Behandlingsnøkkel: {behandlingsnokkel}</p>}
              {omregningstidspunkt && <p>Omregningstidspunkt: {omregningstidspunkt}</p>}
              <List size={'small'}>
                {omregneAFP && <List.Item>Omregne AFP: {omregneAFP ? 'Ja' : 'Nei'}</List.Item>}
                {behandleApneKrav && <List.Item>Behandle åpne krav: {behandleApneKrav ? 'Ja' : 'Nei'}</List.Item>}
                {brukFaktoromregning &&
                  <List.Item>Bruk faktoromregning: {brukFaktoromregning ? 'Ja' : 'Nei'}</List.Item>}
                {opprettAlleOppgaver &&
                  <List.Item>Opprett alle oppgaver: {opprettAlleOppgaver ? 'Ja' : 'Nei'}</List.Item>}
                {sjekkYtelseFraAvtaleland &&
                  <List.Item>Sjekk ytelser fra avtaleland: {sjekkYtelseFraAvtaleland ? 'Ja' : 'Nei'}</List.Item>}
                {skalSletteIverksettingsoppgaver && <List.Item>Skal slette Iverksettingsoppgaver: {skalSletteIverksettingsoppgaver ? 'Ja' : 'Nei'}</List.Item> }
                {skalBestilleBrev && <List.Item>Skal bestille brev: {skalBestilleBrev ? 'Ja' : 'Nei'}</List.Item>}
                {skalSamordne && <List.Item>Skal samordne: {skalSamordne ? 'Ja' : 'Nei'}</List.Item>}
                {skalSendeBrevBerorteSaker && <List.Item>Send brev for berørte saker: {skalSendeBrevBerorteSaker ? 'Ja' : 'Nei'}</List.Item>}
                {skalDistribuereUforevedtak && <List.Item>Skal distribuere uførevedtak: {skalDistribuereUforevedtak ? 'Ja' : 'Nei'}</List.Item>}

                <List.Item>Krav gjelder: {kravGjelder}</List.Item>
                <List.Item>Kravårsak: {kravArsak}</List.Item>
                <List.Item>Toleransegrense sett: {toleransegrenseSett}</List.Item>
                <List.Item>Oppgave sett: {oppgaveSett}</List.Item>
                <List.Item>Oppgave prefiks: {oppgavePrefiks}</List.Item>

              </List>
              Du kan ikke angre denne handlingen.
            </BodyLong>
          </Modal.Body>
          <Modal.Footer>
            <Button form={'skjema'} type='submit' loading={fetcher.state === 'submitting'} disabled={isClicked}
                    onClick={(e: any) => {
                      handleSubmit(e.target.form)
                    }}>
              Submit
            </Button>
            <Button
              type='button'
              variant='secondary'
              onClick={() => ref.current?.close()}
            >
              Tilbake
            </Button>
          </Modal.Footer>
        </Modal>
      </Box>


    </div>
  )
}
