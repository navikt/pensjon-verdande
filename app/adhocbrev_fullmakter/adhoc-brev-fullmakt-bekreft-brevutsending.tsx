import { Box, Button, Heading, TextField, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import { type ActionFunctionArgs, Form, redirect, useNavigation } from 'react-router'
import { bekreftAdHocBrevSlettFullmaktBprofBrevUtsending } from '~/adhocbrev_fullmakter/adhoc-brev-fullmakt.server'

import { requireAccessToken } from '~/services/auth.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const accessToken = await requireAccessToken(request)

  const behandlingId = formData.get('behandlingId') as string

  await bekreftAdHocBrevSlettFullmaktBprofBrevUtsending(accessToken, behandlingId)

  return redirect(`/behandling/${behandlingId}`)
}

export default function AdhocBrevFullmaktBekreftBrevutsending() {
  const navigation = useNavigation()

  const isSubmitting = navigation.state === 'submitting'
  const [behandlingId, setBehandlingId] = useState<string | ''>('')

  return (
    <VStack gap={'space-4'}>
      <Box.New className={'aksel-pageblock--lg'}>
        <Heading size={'medium'} level={'1'}>
          Bekreft at ad-hoc brevbestilling for sletting av fullmakt i BPROF er klar for brevutsending
        </Heading>
      </Box.New>

      <Form method="post" style={{ width: '20em' }}>
        <VStack gap={'space-4'}>
          <TextField
            label="Behandling ID"
            name="behandlingId"
            onChange={(e) => {
              setBehandlingId(e.target.value)
            }}
            value={behandlingId}
          />

          <Button variant="danger" type="submit" disabled={behandlingId === ''} loading={isSubmitting}>
            Bekreft klar for brevutsending
          </Button>
        </VStack>
      </Form>
    </VStack>
  )
}
