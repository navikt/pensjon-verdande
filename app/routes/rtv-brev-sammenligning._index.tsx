import { Form, NavLink, useSubmit } from '@remix-run/react'
import { json } from '@remix-run/node'
import { env } from '~/services/env.server'
import React, { useState, useRef, useEffect } from 'react'
import { Select } from '@navikt/ds-react'

export const loader = async () => {
  return json({
    env: env.env,
  })
}

export default function BatchOpprett_index() {
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
      <h1>Opprett RTV Brev Sammenligninger</h1>

      <NavLink to={'./rtv-brev-sammenligning'}>
        Opprett RTV Brev Sammenligninger
      </NavLink>
    </div>
  )
}
