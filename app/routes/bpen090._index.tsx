import { Form } from '@remix-run/react'
import { json } from '@remix-run/node'
import { env } from '~/services/env.server'
import React, { useRef, useEffect } from 'react'

export const loader = async () => {
  return json({
    env: env.env,
  })
}

export default function BatchOpprett_index() {
  const now = new Date()
  const lastYear = now.getFullYear() - 1
  const nesteBehandlingsmaned = now.getFullYear() * 100 + now.getMonth() + 2

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
        <p>
          Behandlingsmåned (yyyyMM)
          <input
              defaultValue={nesteBehandlingsmaned}
              aria-label="behandlingsmaaned"
              name="behandlingsmaaned"
              type="number"
              placeholder="behandlingsmaaned"
          />
        </p>
        <p>
          <button type="submit">Opprett</button>
        </p>
      </Form>
    </div>
  )
}
