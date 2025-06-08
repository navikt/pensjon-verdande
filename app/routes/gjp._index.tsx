import { Form, useSubmit } from 'react-router';
import { env } from '~/services/env.server'
import React, { useEffect, useRef, useState } from 'react'
import { Select } from '@navikt/ds-react'


export const loader = async () => {
  return {
    env: env.env,
  }
}

export default function BatchOpprett_index() {
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
      <h1>Gjenlevendepensjon - utvidet rett - varsel</h1>
      <p>Batchkjøring for vurdering av utvidet rett for gjenlevendepensjon</p>
      <p><b>DryRun</b> kjører uttrekksbatchen uten å sende videre til behandling av hver enkel sak</p>
      <p><b>Venteperiode i dager</b> angir hvor mange dager det skal gå fra utsendelse av varselbrev til vedtaket blir fattet</p>
      <p><b>SakIdFilter</b> dersom man kun ønsker å gjøre behandling for en sak, oppgi dennes sakid her</p>
      <Form action="gjp" method="POST">
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
          <label>Venteperiode i dager</label>
          <br/>
          <input
            defaultValue={42}
            aria-label="venteperiodeDager"
            name="venteperiodeDager"
            type="number"
            placeholder="venteperiodeDager"
          />
        </div>
        <br />
        <div style={{ display: 'inline-block' }}>
          <label>SakId filter</label>
          <br/>
          <input
            aria-label="sakIdFilter"
            name="sakIdFilter"
            type="number"
            placeholder="ingen"
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
