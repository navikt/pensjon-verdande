import { Form, useLoaderData, useSubmit } from 'react-router'
import { useState } from 'react'

export default function ManedligOmregningUttrekk({denneBehandlingsmaneden}: { denneBehandlingsmaneden: number }) {
  const [isClicked, setIsClicked] = useState(false)
  const submit = useSubmit()
  const handleSubmit = (e:any)=> {submit(e.target.form); setIsClicked(true)}

  return (
    <div>
      <h1>Start uttrekk</h1>
      <Form action="uttrekk" method="POST">
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
        <p>
          <button type="submit" disabled={isClicked} onClick={handleSubmit}>
            Opprett
          </button>
        </p>
      </Form>
    </div>
  )
}
