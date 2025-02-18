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
  const now = new Date()
  const nesteBehandlingsmaned = now.getFullYear() * 100 + now.getMonth() + 2
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
      <h1>Opprett BPEN090 batchkjøring</h1>
      <Form action="bpen090" method="POST">
        <div style={{ display: 'inline-block' }}>
          <label>Behandlingsmåned (yyyyMM)</label>
          <br/>
          <input
              defaultValue={nesteBehandlingsmaned}
              aria-label="behandlingsmaaned"
              name="behandlingsmaaned"
              type="number"
              placeholder="behandlingsmaaned"
          />
        </div>
        <br/>
        <div style={{ display: 'inline-block' }}>
          <Select
            label="begrenset utplukk"
            size={'small'}
            name={'begrensUtplukk'}
            defaultValue={'false'}
          >
            <option value="true">Ja</option>
            <option value="false">Nei</option>
          </Select>
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
