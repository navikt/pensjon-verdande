import { Alert, Button, Heading, HStack, TextField, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import { Form } from 'react-router';
import type { ActionFunctionArgs } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import { useActionData } from 'react-router'
import { linkDnrFnr } from '~/vedlikehold/vedlikehold.server'

export default function LinkeDnrFnrPage() {

  const [gammeltIdent, setGammelIdent] = useState('')
  const [nyIdent, setNyIdent] = useState('')

  const actionData = useActionData() as ActionData | undefined

  const success = actionData?.success
  const error = actionData?.error

  return (
    <div>
      <VStack gap="5">
        <HStack>
          <Heading size="large">Linke Dnr Fnr</Heading>
        </HStack>

        {actionData !== undefined && (<>
            {success && <Alert variant="success" inline>Fødselsnummer oppdatert</Alert>}
            {!success && <Alert variant="error" inline>{error}</Alert>}</>
        )}


        <Form method="post">
          <VStack gap="3">
            <TextField label="Gammelt ident" name="gammelIdent" style={{ width: 200 }} maxLength={11}
                       value={gammeltIdent}
                       onChange={(e) => setGammelIdent(e.target.value)} />
            <TextField label="Ny ident" name="nyIdent" value={nyIdent} style={{ width: 200 }} maxLength={11}
                       onChange={(e) => setNyIdent(e.target.value)} />
            <div><Button type="submit">Link fødselsnummer/d-nummer</Button></div>
          </VStack>
        </Form>
      </VStack>
    </div>
  )
}


export const action = async ({ request }: ActionFunctionArgs) => {

  const formData = await request.formData()
  const accessToken = await requireAccessToken(request)

  return await linkDnrFnr(accessToken, formData.get('gammelIdent'), formData.get('nyIdent'))
}


type ActionData = {
  success: boolean
  error: string | null
}
