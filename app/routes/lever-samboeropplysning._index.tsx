import { Form } from '@remix-run/react'
import { env } from '~/services/env.server'
import React, { useEffect, useRef } from 'react'

export const loader = async () => {
  return {
    env: env.env,
  }
}

export default function BatchOpprett_index() {
  const now = new Date()
  const lastYear = now.getFullYear() - 1

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
      <h1>Opprett BPEN007 batchkjøring</h1>
      <p>Lever samboeropplysning til SKD</p>
      <Form action="bpen007" method="POST">
        <p>
          Behandlingsår
          <input
            defaultValue={lastYear}
            aria-label="År"
            name="behandlingsAr"
            type="number"
            placeholder="År"
          />
        </p>
        <p>
          <button type="submit">Opprett</button>
        </p>
      </Form>
    </div>
  )
}
