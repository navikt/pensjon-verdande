import { Form, useSubmit } from '@remix-run/react'
import React, { useEffect, useRef, useState } from 'react'
import { Select } from '@navikt/ds-react'

export const loader = async () => {
  return {
    env: env.env,
  }
}

export default function BatchOpprett_index() {
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

  return (
    <div>
      <h1>Opprett ADHOC Brevbestilling batchkjøring på brevmal for sak</h1>
      <Form action="adhocBrev" method="POST">
        <p style={{ fontWeight: 'bold' }}>
          Brevmal kode for Sak:
        </p>
        <p>
          <input
            ref={inputRef}
            defaultValue="ERSTATT MED BREVMAL KODE"
            aria-label="Brevmal"
            name="brevmal"
            type="text"
            placeholder="Brevmal"
            onInput={handleInput}
            style={{ width: 'auto' }}
          />
        </p>
        <p>
          <Select
            label="Ekskluder avdøde"
            size={'small'}
            name={'ekskluderAvdoed'}
            defaultValue={'true'}
            style={{ maxWidth: '5em' }}
          >
            <option value="true">Ja</option>
            <option value="false">Nei</option>
          </Select>
        </p>
        <p>
          <button type="submit" disabled={isClicked} onClick={handleSubmit}>
            Opprett
          </button>
        </p>
      </Form>
    </div>
  )
}
