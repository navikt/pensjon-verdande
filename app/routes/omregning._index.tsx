import { Form, useSubmit } from '@remix-run/react'
import React, { useEffect, useRef, useState } from 'react'
import {
  Box,
  Checkbox,
  CheckboxGroup,
  HGrid,
  MonthPicker,
  Select,
  TextField,
  useMonthpicker,
  VStack,
} from '@navikt/ds-react'

export default function BatchOpprett_index() {
  const now = new Date()
  const [isClicked, setIsClicked] = useState(false)
  const [omregningstidspunkt, setOmregningstidspunkt] = useState('')
  const [hasError, setHasError] = useState(false)
  const submit = useSubmit()
  const handleSubmit = (e: any) => {
    if (hasError) {
      return
    } else {
      submit(e.target.form)
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
  ]

  const toleransegrenseSett = [
    { value: 'DEFAULT', label: 'Default' },
    { value: 'GPPROD', label: 'GPPROD' },
    { value: 'ENSLIGE4000', label: 'ENSLIGE4000' },
    { value: 'EPS1000', label: 'EPS1000' },
    { value: 'INGEN_ENDR', label: 'INGEN_ENDR' },
  ]

  const oppgaveSett = [
    { value: 'INGEN_OPPGAVER', label: 'Ingen oppgaver' },
    { value: 'DEFAULT', label: 'Default' },
    { value: 'HENDELSE_UTLAND', label: 'Hendelse utland' },
    { value: 'OPPH_UT', label: 'Opphør utland' },
    { value: 'DOD', label: 'Død' },
    { value: 'BPEN056', label: 'BPEN056' },
    { value: 'SOKNAD_AP', label: 'Søknad AP' },
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
    fromDate: new Date(`1 Oct ${now.getFullYear() - 1}`),
    toDate: new Date(`1 Oct ${now.getFullYear() + 1}`),
    onValidate: (val) => {
      if(!val.isValidMonth && val.isEmpty) {
        setHasError(true)
      }
    },
    required: true,
  })

  return (
    <div>
      <h1>Omregn ytelser</h1>
      <p>Behandling som erstatter BPEN093</p>
      <Form action='omregning' method='POST'>
        <VStack gap='6'>
          <HGrid columns={2} gap='6'>
            <Box>
              <TextField label={'Behandlingsnøkkel'} name={'behandlingsnokkel'} size='small' />

              <MonthPicker
                {...monthpickerProps}
              >
                <MonthPicker.Input
                  {...inputProps}
                  label='Velg omregningstidspunkt'
                  error={hasError && 'Du må velge måned'}
                />
              </MonthPicker>
              <input hidden type='text' id='omregningstidspunkt' name='omregningstidspunkt' value={omregningstidspunkt}
                     readOnly />
            </Box>
            <Box>
              <CheckboxGroup legend={'Behandlingsparametere'} name={'behandlingsparametere'}>
                <Checkbox name='omregneAFP' value='omregneAFP'>Omregne AFP</Checkbox>
                <Checkbox name='behandleApneKrav' value='behandleApneKrav'>Behandle åpne krav</Checkbox>
                <Checkbox name='brukFaktoromregning' value='brukFaktoromregning'>Bruk faktoromregning</Checkbox>
                <Checkbox name='brukKjoreplan' value='brukKjoreplan'>Bruk kjøreplan</Checkbox>
                <Checkbox name='opprettAlleOppgaver' value='opprettAlleOppgaver'>Opprett alle oppgaver</Checkbox>
                <Checkbox name='sjekkYtelseFraAvtaleland' value='sjekkYtelseFraAvtaleland'>Sjekk ytelser fra
                  avtaleland</Checkbox>
                <Checkbox name='brukppen015' value='brukppen015'>Bruk PPEN015</Checkbox>
              </CheckboxGroup>
            </Box>

            <Box>
              <Select label='Krav gjelder' name={'kravGjelder'}>
                {optionsKravGjelder.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Select label={'Kravårsak'} name={'kravArsak'}>
                {optionsKravArsak.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Select label={'Toleransegrense sett'} name={'toleransegrenseSett'}>
                {toleransegrenseSett.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Select label={'Oppgave sett'} name={'oppgaveSett'}>
                {oppgaveSett.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <br />
              <Box>
                <button type='submit' disabled={isClicked} onClick={handleSubmit}>
                  Opprett
                </button>
              </Box>
            </Box>
          </HGrid>
        </VStack>
      </Form>
    </div>
  )
}
