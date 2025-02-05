import { Form, useSubmit } from '@remix-run/react'
import { json } from '@remix-run/node'
import { env } from '~/services/env.server'
import React, { useEffect, useRef, useState } from 'react'
import { Box, Checkbox, CheckboxGroup, HGrid, HStack, MonthPicker, Select, TextField, VStack } from '@navikt/ds-react'

export const loader = async () => {
  return json({
    env: env.env,
  })
}

export default function BatchOpprett_index() {
  const now = new Date()
  const lastYear = now.getFullYear() - 1
  const denneBehandlingsmaneden = now.getFullYear() * 100 + now.getMonth() + 1
  const [isClicked, setIsClicked] = useState(false)
  const submit = useSubmit()
  const handleSubmit = (e: any) => {
    submit(e.target.form)
    setIsClicked(true)
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
    { value: '', label: 'Ikke utfør kontroll' },
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

  return (
    <div>
      <h1>BPEN093 - Omregning av ytelser</h1>
      <Form action='omregning' method='POST'>
        <VStack gap='6'>
          <HGrid columns={2} gap='6'>
            <Box>
              <TextField label={'Behandlingsnøkkel'} name={'behandlingsnokkel'} size='small' />

              <MonthPicker.Standalone
                aria-label={'Omregningstidspunkt'}
                onMonthSelect={console.info}
                dropdownCaption
                fromDate={new Date(`1 Oct ${now.getFullYear() - 1}`)}
                toDate={new Date(`1 Oct ${now.getFullYear() + 1}`)}
              />
            </Box>
            <Box>
              <CheckboxGroup legend={'Behandlingsparametere'} name={'behandlingsparametere'}>
                <Checkbox value='1'>Omregne AFP</Checkbox>
                <Checkbox value='2'>Behandle åpne krav</Checkbox>
                <Checkbox value='3'>Bruk faktoromregning</Checkbox>
                <Checkbox value='4'>Bruk kjøreplan</Checkbox>
                <Checkbox value='5'>Opprett alle oppgaver</Checkbox>
                <Checkbox value='6'>Sjekk ytelser fra avtaleland</Checkbox>
              </CheckboxGroup>
            </Box>

            <Box>
              <Select label='Krav gjelder'>
                {optionsKravGjelder.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Select label={'Kravårsak'}>
                {optionsKravArsak.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Select label={'Toleransegrense sett'}>
                {toleransegrenseSett.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Select label={'Oppgave sett'}>
                {oppgaveSett.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <br/>
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
