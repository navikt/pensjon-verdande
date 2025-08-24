import { Alert, Button, Heading, HStack, TextField, VStack } from '@navikt/ds-react'
import React, { useState } from 'react'
import { Form } from 'react-router';
import type { ActionFunctionArgs } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import { useActionData } from 'react-router'
import { ActionData } from '~/vedlikehold/vedlikehold.types'
import { hentMot } from '~/vedlikehold/vedlikehold.server'

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

export const action = async ({ request }: ActionFunctionArgs) => {

  const formData = await request.formData()
  const accessToken = await requireAccessToken(request)

  return await hentMot(accessToken, formData.get('fomYear')!,formData.get('fomMonth')!)
}
