import { Alert, Button, Heading, HStack, TextField, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import type { ActionFunctionArgs } from 'react-router'
import { Form, useActionData } from 'react-router'
import invariant from 'tiny-invariant'
import { requireAccessToken } from '~/services/auth.server'
import { hentMot } from '~/vedlikehold/vedlikehold.server'
import type { ActionData } from '~/vedlikehold/vedlikehold.types'

export default function SokosSPKMottakPage() {
  const [fomYear, setFomYear] = useState('')
  const [fomMonth, setFomMonth] = useState('')

  const actionData = useActionData() as ActionData | undefined

  const antall = actionData?.antall
  const error = actionData?.error

  return (
    <div>
      <VStack gap="5">
        <HStack>
          <Heading size="large">Hent antall fra MOT</Heading>
        </HStack>

        {actionData !== undefined && (
          <>
            {antall && (
              <Alert variant="success" inline>
                {antall} i svar fra MOT
              </Alert>
            )}
            {!antall && (
              <Alert variant="error" inline>
                {error}
              </Alert>
            )}
          </>
        )}

        <Form method="post">
          <VStack gap="3">
            <TextField
              label="fomYear"
              name="fomYear"
              style={{ width: 300 }}
              value={fomYear}
              onChange={(e) => setFomYear(e.target.value)}
            />
            <TextField
              label="fomMonth"
              name="fomMonth"
              style={{ width: 300 }}
              value={fomMonth}
              onChange={(e) => setFomMonth(e.target.value)}
            />
            <div>
              <Button type="submit">Hent antall</Button>
            </div>
          </VStack>
        </Form>
      </VStack>
    </div>
  )
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const accessToken = await requireAccessToken(request)

  const fomYear = formData.get('fomYear')
  const fomMonth = formData.get('fomMonth')

  invariant(typeof fomYear === 'string' && fomYear.length > 0, "Parameteret 'fomYear' mangler")
  invariant(typeof fomMonth === 'string' && fomMonth.length > 0, "Parameteret 'fomMonth' mangler")

  return await hentMot(accessToken, fomYear, fomMonth)
}
