import { Form, useSubmit } from 'react-router';
import React, { useEffect, useRef, useState } from 'react'
import { Select } from '@navikt/ds-react'


export const loader = async () => {
  return {
    env: env.env,
  }
}

export default function BatchOpprett_index() {
  const now = new Date()
  const kjoremaaned = now.getFullYear() * 100 + now.getMonth() + 1
  const prioritet = 2
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
      <h1>Løpende inntektsavkorting (tidligere BPEN090)</h1>
      <p>Batchkjøring for løpende inntektsavkorting av uføretrygd</p>
      <p><b>Kjøremåned</b> er måneden du starter kjøringen. Inntekter hentes da til og med måneden <i>før</i> kjøremåned mens virkningsdato blir satt til den første i måneden <i>etter</i> kjøremåned.</p>
      <p>Gyldige verdier for kjøremåned er april til oktober.</p>
      <p><b>Begrenset utplukk</b> krever oppføringer i tabellen T_BATCH_PERSON_FILTER med PERSON_ID for de personer man ønsker å kjøre behandlingen for</p>
      <p><b>DryRun</b> kjører batchen uten å sende videre til VurderOmregning</p>
      <p><b>Prioritet</b> angir om batchen skal kjøres mot Oppdrag som en BATCH (HPEN) eller ONLINE_BATCH</p>
      <Form action="bpen090" method="POST">
        <div style={{ display: 'inline-block' }}>
          <label>Kjøremåned (yyyyMM)</label>
          <br/>
          <input
              defaultValue={kjoremaaned}
              aria-label="kjoremaaned"
              name="kjoremaaned"
              type="number"
              placeholder="kjoremaaned"
          />
        </div>
        <br/>
        <div style={{ display: 'inline-block' }}>
          <Select
            label="Begrenset utplukk"
            size={'small'}
            name={'begrensUtplukk'}
            defaultValue={'false'}
          >
            <option value="true">Ja</option>
            <option value="false">Nei</option>
          </Select>
        </div>
        <br />
        <div style={{ display: 'inline-block' }}>
          <Select
            label="DryRun"
            size={'small'}
            name={'dryRun'}
            defaultValue={'true'}
          >
            <option value="true">Ja</option>
            <option value="false">Nei</option>
          </Select>
        </div>
        <br />
        <div style={{ display: 'inline-block' }}>
          <label>Prioritet (1 = ONLINE_BATCH, 2 = BATCH)</label>
          <br/>
          <input
            defaultValue={prioritet}
            aria-label="prioritet"
            name="prioritet"
            type="number"
            placeholder="prioritet"
          />
        </div>
        <p>
          <button type="submit" disabled={isClicked} onClick={handleSubmit}>
            Opprett
          </button>
        </p>
      </Form>
    </div>
  )
}
