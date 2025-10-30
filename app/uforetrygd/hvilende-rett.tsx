import { Alert, Button, Heading, TextField, VStack } from '@navikt/ds-react'
import { type ActionFunctionArgs, Form, redirect, useActionData, useNavigation } from 'react-router'

type ActionData = {
  success: boolean
  error: string | null
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { requireAccessToken } = await import('~/services/auth.server')
  const { opprettHvilendeRettVarselbrevBehandlinger } = await import('~/uforetrygd/hvilende-rett.server')

  const accessToken = await requireAccessToken(request)
  const formData = await request.formData()
  const senesteHvilendeAr = Number(formData.get('senesteHvilendeAr'))

  if (!senesteHvilendeAr || Number.isNaN(senesteHvilendeAr)) {
    return {
      success: false,
      error: 'Seneste hvilende år for Uføretryged må være et gyldig tall',
    }
  }

  try {
    const response = await opprettHvilendeRettVarselbrevBehandlinger(accessToken, senesteHvilendeAr)
    return redirect(`/behandling/${response.behandlingId}`)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'En ukjent feil oppstod',
    }
  }
}

export default function HvilendeRettPage() {
  const actionData = useActionData() as ActionData | undefined
  const navigation = useNavigation()

  const isSubmitting = navigation.state === 'submitting'
  const success = actionData?.success
  const error = actionData?.error

  return (
    <VStack gap="5" style={{ maxWidth: '50em', margin: '2em' }}>
      {actionData && <>{!success && <Alert variant="error">Feilmelding: {error}</Alert>}</>}
      <Heading size="small">Opprett behandlinger for varselbrev for hvilende rett av Uføretrygd</Heading>

      <Form method="post" style={{ width: '10em' }}>
        <VStack gap={'4'}>
          <TextField
            label="Seneste hvilende år :"
            aria-label="senesteHvilendeAr"
            name="senesteHvilendeAr"
            type="text"
            inputMode="numeric"
          />
          <Button type="submit" disabled={isSubmitting}>
            Opprett
          </Button>
        </VStack>
      </Form>
    </VStack>
  )
}
