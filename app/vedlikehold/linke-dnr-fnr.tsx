import { Button, Heading, HStack, InlineMessage, TextField, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import { Form } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { linkDnrFnr } from '~/vedlikehold/vedlikehold.server'
import type { Route } from './+types/linke-dnr-fnr'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Linke D-nr/F-nr | Verdande' }]
}

export default function LinkeDnrFnrPage({ actionData }: Route.ComponentProps) {
  const [gammeltIdent, setGammelIdent] = useState('')
  const [nyIdent, setNyIdent] = useState('')

  const success = actionData?.success
  const error = actionData?.error

  return (
    <div>
      <VStack gap="space-20">
        <HStack>
          <Heading size="large">Linke Dnr Fnr</Heading>
        </HStack>

        {actionData !== undefined && (
          <>
            {success && <InlineMessage status="success">Fødselsnummer oppdatert</InlineMessage>}
            {!success && <InlineMessage status="error">{error}</InlineMessage>}
          </>
        )}

        <Form method="post">
          <VStack gap="space-12">
            <TextField
              label="Gammelt ident"
              name="gammelIdent"
              style={{ width: 200 }}
              maxLength={11}
              value={gammeltIdent}
              onChange={(e) => setGammelIdent(e.target.value)}
            />
            <TextField
              label="Ny ident"
              name="nyIdent"
              value={nyIdent}
              style={{ width: 200 }}
              maxLength={11}
              onChange={(e) => setNyIdent(e.target.value)}
            />
            <div>
              <Button type="submit">Link fødselsnummer/d-nummer</Button>
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

  return await linkDnrFnr(accessToken, formData.get('gammelIdent'), formData.get('nyIdent'))
}
