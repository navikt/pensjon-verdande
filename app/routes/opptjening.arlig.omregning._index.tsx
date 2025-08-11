import { Form, useSubmit } from 'react-router';
import { env } from '~/services/env.server'
import React, { useState } from 'react'

export const loader = async () => {
  return {
    env: env.env,
  }
}

export default function EndretOpptjeningArligUttrekk() {
  const [isClicked, setIsClicked] = useState(false)
  const submit = useSubmit()
  const handleSubmit = (e:any)=> {submit(e.target.form); setIsClicked(true)}

  const now = new Date()
  const innevaerendeAar = now.getFullYear()

  return (
    <div>
      <h1>Årlig omregning av ytelse ved oppdaterte opptjeningsopplysninger</h1>
      <Form action="uttrekk" method="POST">
        <br />
        <p>
          <button type="submit" disabled={isClicked} onClick={handleSubmit}>
            Opprett uttrekk for {innevaerendeAar}
          </button>
        </p>
      </Form>
    </div>
  )
}
