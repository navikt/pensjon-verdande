import { Form, useLoaderData, useSubmit } from 'react-router'
import { useState } from 'react'

export const loader = async () => {
  const innevaerendeAar = new Date().getFullYear()

  return {
    innevaerendeAar
  }
}

export default function EndretOpptjeningArligUttrekk() {
  const { innevaerendeAar } = useLoaderData<typeof loader>()

  const [isClicked, setIsClicked] = useState(false)
  const submit = useSubmit()
  const handleSubmit = (e:any)=> {submit(e.target.form); setIsClicked(true)}

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
