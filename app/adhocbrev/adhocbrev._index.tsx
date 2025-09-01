import { Form, useSubmit } from 'react-router';
import { useRef, useState } from 'react'
import { BodyShort, Select, VStack } from '@navikt/ds-react'
import { env } from '~/services/env.server'

export default function BatchOpprett_index() {
  const [isClicked, setIsClicked] = useState(false)
  const submit = useSubmit()
  const handleSubmit = (e: any) => {
    submit(e.target.form)
    setIsClicked(true)
  }

  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      <h1>Opprett ADHOC Brevbestilling batchkjøring på brevmal for sak</h1>
      <Form action="adhocBrev" method="POST" style={{width: '25em'}}>
        <VStack gap={"4"}>
        <BodyShort style={{ fontWeight: 'bold' }}>
          Brevmal kode for Sak:
        </BodyShort>
          <input
            ref={inputRef}
            defaultValue="ERSTATT MED BREVMAL KODE"
            aria-label="Brevmal"
            name="brevmal"
            type="text"
            placeholder="Brevmal"
            style={{ width: 'auto' }}
          />
          <Select
            label="Ekskluder avdøde"
            size={'small'}
            name={'ekskluderAvdoed'}
            defaultValue={'true'}
            style={{ maxWidth: '5em' }}
          >
            <option value="true">Ja</option>
            <option value="false">Nei</option>
          </Select>
          <button type="submit" disabled={isClicked} onClick={handleSubmit}>
            Opprett
          </button>
        </VStack>
      </Form>
    </div>
  )
}
