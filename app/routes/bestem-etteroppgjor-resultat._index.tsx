import { Select } from '@navikt/ds-react'
import React from 'react'
import { ActionFunctionArgs, redirect } from 'react-router';
import { Form } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import { serverOnly$ } from 'vite-env-only/macros'

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

export const action = serverOnly$(async ({ params, request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)

  const formData = await request.formData()
  const updates = Object.fromEntries(formData)

  console.log('formData', formData)
  console.log('updates', updates)

  const response = await fetch(
    `${env.penUrl}/api/uforetrygd/bestemetteroppgjor/start`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
      body: JSON.stringify({
        dryRun: updates.dryRun,
      }),
    },
  )

  console.log(response.status)

  return null;
})
