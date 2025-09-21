import { Checkbox } from '@navikt/ds-react'
import { useState } from 'react'
import { Form, useSubmit } from 'react-router'

export default function ReguleringUttrekk() {
  const [isClicked, setIsClicked] = useState(false)
  const submit = useSubmit()
  const handleSubmit = async (e: React.MouseEvent<HTMLElement>) => {
    const form = (e.target as HTMLButtonElement).form
    if (form) {
      await submit(form)
      setIsClicked(true)
    }
  }

  return (
    <div>
      <h2>Start Uttrekk</h2>
      <Form method="POST">
        <input type="hidden" name="formType" value="startReguleringUttrekk" />
        <p>
          Satsdato &nbsp;
          <input defaultValue="2025-05-01" aria-label="Satsdato" name="satsDato" type="text" placeholder="Satsdato" />
        </p>
        <p>
          Reguleringsdato &nbsp;
          <input
            defaultValue="2025-05-01"
            aria-label="Reguleringsdato"
            name="reguleringsDato"
            type="text"
            placeholder="Reguleringsdato"
          />
        </p>
        <p>
          <Checkbox name="iDebug">Debug</Checkbox>
        </p>
        <p>
          <button type="submit" disabled={isClicked} onClick={handleSubmit}>
            Start
          </button>
        </p>
      </Form>
    </div>
  )
}
