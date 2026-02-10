import { Button, Heading, HStack, InlineMessage, TextField, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import { Form } from 'react-router'
import invariant from 'tiny-invariant'
import { requireAccessToken } from '~/services/auth.server'
import { hentMot } from '~/vedlikehold/vedlikehold.server'
import type { Route } from './+types/leveattester-sokos-spkmottak'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Leveattester SOKOS/SPK-mottak | Verdande' }]
}

export default function SokosSPKMottakPage({ actionData }: Route.ComponentProps) {
  const [fomYear, setFomYear] = useState('')
  const [fomMonth, setFomMonth] = useState('')

  const antall = actionData?.antall
  const error = actionData?.error

  return (
    <div>
      <VStack gap="space-20">
        <HStack>
          <Heading size="large">Hent antall fra MOT</Heading>
        </HStack>

        {actionData !== undefined && (
          <>
            {antall && <InlineMessage status="success">{antall} i svar fra MOT</InlineMessage>}
            {!antall && <InlineMessage status="error">{error}</InlineMessage>}
          </>
        )}

        <Form method="post">
          <VStack gap="space-12">
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

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const accessToken = await requireAccessToken(request)

  const fomYear = formData.get('fomYear')
  const fomMonth = formData.get('fomMonth')

  invariant(typeof fomYear === 'string' && fomYear.length > 0, "Parameteret 'fomYear' mangler")
  invariant(typeof fomMonth === 'string' && fomMonth.length > 0, "Parameteret 'fomMonth' mangler")

  return await hentMot(accessToken, fomYear, fomMonth)
}
