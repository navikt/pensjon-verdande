import { Alert, Button, Heading, TextField, VStack } from '@navikt/ds-react'
import { Form, useNavigation } from 'react-router'
import { ugyldiggjorEtteroppgjorHistorikkUfore } from '~/vedlikehold/vedlikehold.server'
import type { Route } from './+types/etteroppgjor-historikk-ufore'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Etteroppgjør historikk uføre | Verdande' }]
}

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const sakId = Number(formData.get('sakId'))
  const etteroppgjortAr = Number(formData.get('etteroppgjortAr'))

  if (!sakId || !etteroppgjortAr || Number.isNaN(sakId) || Number.isNaN(etteroppgjortAr)) {
    return {
      success: false,
      error: 'Sak ID og etteroppgjort år må være gyldige tall',
    }
  }

  const response = await ugyldiggjorEtteroppgjorHistorikkUfore(request, sakId, etteroppgjortAr)

  return {
    ...response,
    sakId,
    etteroppgjortAr,
  }
}

export default function EtteroppgjorHistorikkUforePage({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation()

  const isSubmitting = navigation.state === 'submitting'
  const success = actionData?.success
  const error = actionData?.error

  return (
    <VStack gap="space-20" style={{ maxWidth: '50em', margin: '2em' }}>
      {actionData && (
        <>
          {success && 'sakId' in actionData && (
            <Alert variant="success">
              Oppdatert historikk for sakid {actionData.sakId} og etteroppgjort år {actionData.etteroppgjortAr}
            </Alert>
          )}
          {!success && <Alert variant="error">Feilmelding: {error}</Alert>}
        </>
      )}
      <Heading size="small">Ugyldiggjør EtteroppgjørHistorikk Uføretrygd</Heading>
      <Form method="post" style={{ width: '10em' }}>
        <VStack gap={'space-16'}>
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
