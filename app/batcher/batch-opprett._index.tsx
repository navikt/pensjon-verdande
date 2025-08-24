import { Form, NavLink, useSubmit } from 'react-router';
import React, { useState, useRef, useEffect } from 'react'
import { Select } from '@navikt/ds-react'

export const loader = async () => {
  return {
  }
}

export default function BatchOpprett_index() {
  const now = new Date()
  const lastYear = now.getFullYear() - 1
  const nesteBehandlingsmaneden = now.getFullYear() * 100 + now.getMonth() + 2
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
      <h1>Opprett ADHOC Brevbestilling batchkjøring på brevmal for sak</h1>
      <Form action="adhocBrev" method="POST">
        <p>
          Brevmal kode for Sak
          <input
            ref={inputRef}
            defaultValue="ERSTATT MED BREVMAL KODE"
            aria-label="Brevmal"
            name="brevmal"
            type="text"
            placeholder="Brevmal"
            onInput={handleInput}
            style={{ width: 'auto' }}
          />
        </p>
        <p>
          <button type="submit" disabled={isClicked} onClick={handleSubmit}>
            Opprett
          </button>
        </p>
      </Form>

      <h1>Opprett BPEN090 batchkjøring</h1>
      <Form action="bpen090" method="POST">
        <p>
          Kjøremåned (yyyyMM)
          <input
            defaultValue={nesteBehandlingsmaneden}
            aria-label="kjoremaaned"
            name="kjoremaaned"
            type="number"
            placeholder="kjoremaaned"
          />
        </p>
        <p>
          <div style={{ display: 'inline-block' }}>
            <Select
              label="begrenset utplukk"
              size={'small'}
              name={'begrensUtplukk'}
              defaultValue={'false'}
            >
              <option value="true">Ja</option>
              <option value="false">Nei</option>
            </Select>
          </div>
        </p>
        <p>
          <div style={{ display: 'inline-block' }}>
            <Select
              label="dryRun"
              size={'small'}
              name={'dryRun'}
              defaultValue={'true'}
            >
              <option value="true">Ja</option>
              <option value="false">Nei</option>
            </Select>
          </div>
        </p>
        <p>
          <button type="submit">Opprett</button>
        </p>
      </Form>

      <h1>Opprett BPEN091 batchkjøring</h1>
      <Form action="bpen091" method="POST">
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

      <h1>Hent opplysninger fra Skatt (tidligere BPEN096)</h1>
      <Form action="bpen096" method="POST">
        <div style={{ display: 'inline-block' }}>
          <label>Max antall sekvensnummer</label>
          <br />
          <input
            defaultValue="10000"
            aria-label="maxSekvensnummer"
            name="maksAntallSekvensnummer"
            type="number"
            placeholder="maxSekvensnummer"
          />
        </div>
        <br />
        <div style={{ display: 'inline-block' }}>
          <label>Antall sekvensnummer per behandling</label>
          <br />
          <input
            defaultValue="100"
            aria-label="sekvensnummerPerBehandling"
            name="sekvensnummerPerBehandling"
            type="number"
            placeholder="sekvensnummerPerBehandling"
          />
        </div>
        <br />
        <div style={{ display: 'inline-block' }}>
          <Select
            label="dryRun"
            size={'small'}
            name={'dryRun'}
            defaultValue={'true'}
          >
            <option value="true">Ja</option>
            <option value="false">Nei</option>
          </Select>
        </div>
        <p>
          <button type="submit" disabled={isClicked} onClick={handleSubmit}>
            Opprett
          </button>
        </p>
      </Form>

      <h1>Opprett Omsorgsopptjening uttrekk</h1>
      <NavLink to={'./omsorgsopptjening-uttrekk'}>
        Opprett Omsorgsopptjening-uttrekk
      </NavLink>
    </div>
  )
}
