import { Form, useSubmit } from '@remix-run/react'
import { json } from '@remix-run/node'
import { env } from '~/services/env.server'
import React, { useEffect, useRef, useState } from 'react'
import { Select } from '@navikt/ds-react'

export const loader = async () => {
  return json({
    env: env.env,
  })
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

  useEffect(() => {
    handleInput()
  })

  return (
    <div>
      <h1>Opprett BPEN096 batchkjøring</h1>
      <p>BPEN096 - Hent opplysninger fra Skatt for Uføretrygd Etteroppgjør</p>
      <Form action="bpen096" method="POST">
        <div style={{ display: 'inline-block' }}>
          <label>Max antall sekvensnummer</label>
          <br />
          <input
            defaultValue="100"
            aria-label="maxSekvensnummer"
            name="maksAntallSekvensnummer"
            type="number"
            placeholder="maxSekvensnummer"
          />
        </div>
        <br />
        <div style={{ display: 'inline-block' }}>
          <label>Antall sekvensnummer per aktivitet</label>
          <br />
          <input
            defaultValue="10"
            aria-label="sekvensnummerPerAktivitet"
            name="sekvensnummerPerAktivitet"
            type="number"
            placeholder="sekvensnummerPerAktivitet"
          />
        </div>
        <br />
        <div style={{ display: 'inline-block' }}>
          <Select
            label="dryRun"
            size={'small'}
            name={'dryRun'}
            defaultValue={'true'}
          >
            <option value="true">Ja</option>
            <option value="false">Nei</option>
          </Select>
        </div>
        <p>
          <button type="submit" disabled={isClicked} onClick={handleSubmit}>
            Opprett
          </button>
        </p>
      </Form>

    </div>
  )
}
