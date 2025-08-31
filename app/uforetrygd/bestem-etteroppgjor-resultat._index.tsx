import { Select } from '@navikt/ds-react'
import type { ActionFunctionArgs } from 'react-router'
import { Form } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import { startBestemEtteroppgjorResultat } from '~/uforetrygd/bestem-etteroppgjor-resultat.server'

export default function BestemEtteroppgjorResultat() {
  return <div>
    <Select
      label="DryRun"
      size="small"
      name="dryRun"
      defaultValue="true"
    >
      <option value="true">Ja</option>
      <option value="false">Nei</option>
    </Select>

    <Form method="post">
    <button type="submit">
      Opprett
    </button>
    </Form>
  </div>
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)

  const formData = await request.formData()
  const updates = Object.fromEntries(formData)

  console.log('formData', formData)
  console.log('updates', updates)

  const response = await startBestemEtteroppgjorResultat(accessToken, updates)

  console.log(response.status)

  return null;
}
