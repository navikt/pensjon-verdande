import { type ActionFunctionArgs, Form, redirect } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { opprettBpen091 } from '~/uforetrygd/batch.bpen091.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)

  const accessToken = await requireAccessToken(request)

  const response = await opprettBpen091(accessToken, +updates.behandlingsAr)

  return redirect(`/behandling/${response.behandlingId}`)
}

export default function BatchOpprett_index() {
  const now = new Date()
  const lastYear = now.getFullYear() - 1

  return (
    <div>
      <h1>Opprett BPEN091 batchkjøring</h1>
      <p>
        Fastsette neste års forventet inntekt for uføretrygd
      </p>
      <Form method="post">
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
    </div>
  )
}
