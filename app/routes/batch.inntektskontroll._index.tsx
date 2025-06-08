import { Form, useSubmit } from 'react-router';
import React, { useEffect, useRef, useState } from 'react'
import { Box, Checkbox, CheckboxGroup } from '@navikt/ds-react'

export const loader = async () => {
  return {
    env: env.env,
  }
}

export default function BatchOpprett_index() {
  const [isClicked, setIsClicked] = useState(false)
  const submit = useSubmit()
  const handleSubmit = (e:any)=> {submit(e.target.form); setIsClicked(true)}

  const inputRef = useRef<HTMLInputElement>(null)

  const handleInput = () => {
    if (inputRef.current) {
      inputRef.current.style.width = `${inputRef.current.value.length + 1}ch`
    }
  }


  const [eps2g, setEps2g] = useState(false)

  const [gjenlevende, setGjenlevende] = useState(false)

  useEffect(() => {
    handleInput()
  })

  return (
    <div>
      <h1>Start Inntektskontroll</h1>
      <Form action="opprett" method="POST">
        <div style={{ display: 'inline-block' }}>
          <label>År</label>
          <br />
          <input
            aria-label="Behandling År"
            name="aar"
            type="number"
            placeholder="KontrollÅr"
          />
        </div>
        <Box>
          <CheckboxGroup legend={'Behandlingsparametere'} name={'behandlingsparametere'} onChange={() => {
            console.log('change')
          }}>
            <Checkbox
              name='eps2g'
              value={eps2g}
              onChange={(event) => setEps2g(event.target.checked)}
            >
              Inntektskontroll for ektefelle/samboer (2G)
            </Checkbox>

            <Checkbox
              name='gjenlevende'
              value={gjenlevende}
              onChange={(event) => setGjenlevende(event.target.checked)}
            >
              Inntektskontroll for gjenlevende
            </Checkbox>

          </CheckboxGroup>
        </Box>
            <br />
        <p>
          <button type="submit" disabled={isClicked} onClick={handleSubmit}>
            Opprett
          </button>
        </p>
      </Form>
    </div>
  )
}