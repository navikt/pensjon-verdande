import { Alert, Button, Heading, TextField, VStack } from '@navikt/ds-react'
import { type ActionFunctionArgs, Form, useActionData, useNavigation } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { ugyldiggjorEtteroppgjorHistorikkUfore } from '~/vedlikehold/vedlikehold.server'

type ActionData = {
  success: boolean
  error: string | null
  sakId: number | null
  etteroppgjortAar: number | null
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const formData = await request.formData()
  const sakId = Number(formData.get('sakId'))
  const etteroppgjortAr = Number(formData.get('etteroppgjortAr'))

  if (!sakId || !etteroppgjortAr || Number.isNaN(sakId) || Number.isNaN(etteroppgjortAr)) {
    return {
      success: false,
      error: 'Sak ID og etteroppgjort år må være gyldige tall',
    }
  }

  const response = await ugyldiggjorEtteroppgjorHistorikkUfore(accessToken, sakId, etteroppgjortAr)

  return {
    ...response,
    sakId,
    etteroppgjortAr,
  }
}

export default function EtteroppgjorHistorikkUforePage() {
  const actionData = useActionData() as ActionData | undefined
  const navigation = useNavigation()

  const isSubmitting = navigation.state === 'submitting'
  const success = actionData?.success
  const error = actionData?.error

  return (
    <VStack gap="5" style={{ maxWidth: '50em', margin: '2em' }}>
      {actionData && (
        <>
          {success && (
            <Alert variant="success">
              Oppdatert historikk for sakid {actionData.sakId} og etteroppgjort år {actionData.etteroppgjortAar}
            </Alert>
          )}
          {!success && <Alert variant="error">Feilmelding: {error}</Alert>}
        </>
      )}
      <Heading size="small">Ugyldiggjør EtteroppgjørHistorikk Uføretrygd</Heading>

      <Form method="post" style={{ width: '10em' }}>
        <VStack gap={'4'}>
          <TextField label="Sak Id" aria-label="sakId" name="sakId" type="text" inputMode="numeric" />
          <TextField
            label="Etteroppgjort År"
            aria-label="etteroppgjortAr"
            name="etteroppgjortAr"
            type="text"
            inputMode="numeric"
          />
          <Button type="submit" disabled={isSubmitting}>
            Kjør
          </Button>
        </VStack>
      </Form>
    </VStack>
  )
}
