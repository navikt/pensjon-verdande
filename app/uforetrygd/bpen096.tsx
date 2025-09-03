import { Form, useSubmit } from 'react-router';
import { useState } from 'react'
import { Select } from '@navikt/ds-react'
import { type ActionFunctionArgs, redirect } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import { opprettBpen096 } from '~/uforetrygd/batch.bpen096.server'


export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)

  const response = await opprettBpen096(accessToken, +updates.maksAntallSekvensnummer, +updates.sekvensnummerPerBehandling, updates.dryRun === 'true', updates.debug === 'true')

  return redirect(`/behandling/${response.behandlingId}`)
}

export default function BatchOpprett_index() {

  const [isClicked, setIsClicked] = useState(false)
  const submit = useSubmit()
  const handleSubmit = (e:any)=> {submit(e.target.form); setIsClicked(true)}

  return (
    <div>
      <h1>Hent opplysninger fra Skatt (tidligere BPEN096)</h1>
      <p>Batchkjøring for henting av opplysninger fra Skatteetaten for Uføretrygd Etteroppgjør</p>
      <Form method="post">
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
        <br />
        <div style={{ display: 'inline-block' }}>
          <Select
            label="debug"
            size={'small'}
            name={'debug'}
            defaultValue={'false'}
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

    </div>
  )
}
