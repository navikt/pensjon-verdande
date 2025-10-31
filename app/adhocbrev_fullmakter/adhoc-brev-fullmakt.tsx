import { Box, Button, Heading, Textarea, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import { type ActionFunctionArgs, Form, redirect, useNavigation } from 'react-router'
import { opprettAdHocBrevSlettFullmaktBprofBehandling } from '~/adhocbrev_fullmakter/adhoc-brev-fullmakt.server'

import type { BprofUttrekk } from '~/adhocbrev_fullmakter/adhoc-brev-fullmakt.types'
import { requireAccessToken } from '~/services/auth.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const accessToken = await requireAccessToken(request)

  const response = await opprettAdHocBrevSlettFullmaktBprofBehandling(
    accessToken,
    JSON.parse(formData.get('bprofUttrekk') as string) as BprofUttrekk,
  )

  return redirect(`/behandling/${response.behandlingId}`)
}

export default function AdhocBrevFullmakt() {
  const navigation = useNavigation()

  const isSubmitting = navigation.state === 'submitting'
  const [bprofUttrekk, setBprofUttrekk] = useState<string | ''>('')

  return (
    <VStack gap={'4'}>
      <Box.New className={'aksel-pageblock--lg'}>
        <Heading size={'medium'} level={'1'}>
          Opprett ad-hoc brevbestilling for sletting av fullmakt i BPROF
        </Heading>
      </Box.New>

      <Form method="post" style={{ width: '20em' }}>
        <VStack gap={'4'}>
          <Textarea
            label="BPROF-uttrekk (JSON-format)"
            name="bprofUttrekk"
            resize
            onChange={(e) => {
              setBprofUttrekk(e.target.value)
            }}
            value={bprofUttrekk}
          />

          <Button type="submit" disabled={bprofUttrekk === ''} loading={isSubmitting}>
            Opprett adhoc-brevbestilling
          </Button>
        </VStack>
      </Form>
    </VStack>
  )
}
