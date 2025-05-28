import { Form, useSubmit } from '@remix-run/react'
import { json } from '@remix-run/node'
import { env } from '~/services/env.server'
import React, { useEffect, useRef, useState } from 'react'

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
      <h1>Start Inntektskontroll</h1>
      <Form action="opprett" method="POST">
        <div style={{ display: 'inline-block' }}>
          <label>Aar</label>
          <br />
          <input
            aria-label="aar"
            name="aar"
            type="number"
            placeholder="aar"
          />
        </div>
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