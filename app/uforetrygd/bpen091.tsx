import { BodyLong, Box, Button, Heading, TextField, VStack } from '@navikt/ds-react'
import { type ActionFunctionArgs, Form, redirect, useLoaderData, useNavigation } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { opprettBpen091 } from '~/uforetrygd/batch.bpen091.server'

export const loader = () => {
  return {
    lastYear: new Date().getFullYear() - 1,
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)

  const accessToken = await requireAccessToken(request)

  const response = await opprettBpen091(accessToken, +updates.behandlingsAr)

  return redirect(`/behandling/${response.behandlingId}`)
}

export default function FastsettForventetInntekt() {
  const { lastYear } = useLoaderData<typeof loader>()
  const navigation = useNavigation()

  const isSubmitting = navigation.state === 'submitting'

  return (
    <VStack gap={'4'}>
      <Box.New className={'aksel-pageblock--lg'}>
        <Heading size={'medium'} level={'1'}>Fastsett forventet inntekt (BPEN091)</Heading>
        <BodyLong>
          Fastsette neste års forventet inntekt for uføretrygd
        </BodyLong>
      </Box.New>

      <Form method="post" style={{ width: '20em' }}>
        <VStack gap={'4'}>
          <TextField
            label={'Behandlingsår'}
            defaultValue={lastYear}
            aria-label="År"
            name="behandlingsAr"
            type="number"
            placeholder="År"
          />
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Oppretter…' : 'Opprett'}
          </Button>
        </VStack>
      </Form>
    </VStack>
  )
}
