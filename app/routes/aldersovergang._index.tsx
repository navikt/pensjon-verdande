import { Form, useSubmit } from '@remix-run/react'
import React, { useEffect, useRef, useState } from 'react'
import { Select } from '@navikt/ds-react'

export const loader = async () => {
  return {
    env: env.env,
  }
}

export default function BatchOpprett_index() {
  const now = new Date()
  const denneBehandlingsmaneden = now.getFullYear() * 100 + now.getMonth() + 1
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
      <h1>Start aldersovergang</h1>
      <Form action="bpen005" method="POST">
        <div style={{ display: 'inline-block' }}>
          <label>Behandlingsmåned</label>
          <br />
          <input
            defaultValue={denneBehandlingsmaneden}
            aria-label="Behandlingsmåned"
            name="behandlingsmaned"
            type="number"
            placeholder="Behandlingsmåned"
          />
        </div>
        <br />
        <div style={{ display: 'inline-block' }}>
          <Select
            label="Begrenset utplukk"
            size={'small'}
            name={'begrensetUtplukk'}
            defaultValue={'false'}
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
