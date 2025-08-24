import { Alert, Button, Heading, HStack, TextField, VStack } from '@navikt/ds-react'
import React, { useState } from 'react'
import { Form } from 'react-router';
import type { ActionFunctionArgs } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import { env } from '~/services/env.server'
import { useActionData } from 'react-router'
import { serverOnly$ } from 'vite-env-only/macros'

export default function SokosSPKMottakPage() {

  const [fomYear, setFomYear] = useState('')
  const [fomMonth, setFomMonth] = useState('')

  const actionData = useActionData() as ActionData | undefined

  const antall = actionData?.antall
  const error = actionData?.error

  return (
    <div id="sokos-spk-mottak">
      <VStack gap="5">
        <HStack>
          <Heading size="large">Hent antall fra MOT</Heading>
        </HStack>

        {actionData !== undefined && (<>
            {antall && <Alert variant="success" inline>{antall} i svar fra MOT</Alert>}
            {!antall && <Alert variant="error" inline>{error}</Alert>}</>
        )}

        <Form method="post">
          <VStack gap="3">
            <TextField label="fomYear" name="fomYear" style={{ width: 300 }}
                       value={fomYear}
                       onChange={(e) => setFomYear(e.target.value)} />
            <TextField label="fomMonth" name="fomMonth" style={{ width: 300 }}
                       value={fomMonth}
                       onChange={(e) => setFomMonth(e.target.value)} />
            <div><Button type="submit">Hent antall</Button></div>
          </VStack>
        </Form>
      </VStack>
    </div>
  )
}

export const action = async ({ params, request }: ActionFunctionArgs) => {

  const formData = await request.formData()
  const accessToken = await requireAccessToken(request)

  return await hentMot(accessToken, formData.get('fomYear')!,formData.get('fomMonth')!)
}

const hentMot = serverOnly$(async(
  accessToken: string,
  fomYear: FormDataEntryValue,
  fomMonth: FormDataEntryValue,
): Promise<ActionData> => {

  const response = await fetch(
    `${env.penUrl}/api/utbetaling/spkmottak/antall?fomYear=${fomYear}&fomMonth=${fomMonth}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID(),
      },
    },
  )

  if (response.ok) {
    return {
      antall: await response.text(),
      error: null,
    }
  } else {
    return {
      antall: null,
      error: await response.text(),
    }
  }
})

type ActionData = {
  antall: string | null
  error: string | null
}
