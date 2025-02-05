import { NavLink } from '@remix-run/react'
import { json } from '@remix-run/node'
import { env } from '~/services/env.server'
import React, { useEffect, useRef } from 'react'

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

      <h1>Opprett Omsorgsopptjening uttrekk</h1>
      <NavLink to={'./omsorgsopptjening-uttrekk'}>
        Opprett Omsorgsopptjening-uttrekk
      </NavLink>

    </div>
  )
}
