import { Alert, Button, Checkbox, Heading, TextField, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import { type ActionFunctionArgs, Form, redirect, useActionData, useNavigation } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { startBestemEtteroppgjorResultat } from '~/uforetrygd/bestem-etteroppgjor-resultat.server'

function parseSakIds(sakIds: FormDataEntryValue | null): number[] {
  if (!sakIds || typeof sakIds !== 'string') return []

  return sakIds
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id !== '')
    .map((id) => {
      const parsed = Number(id)
      if (Number.isNaN(parsed)) {
        throw new Error(`Ugyldig sak ID: "${id}"`)
      }
      return parsed
    })
}

function parseFormData(formData: FormData) {
  const arValue = formData.get('etteroppgjorAr')
  const ar = arValue ? Number(arValue) : null
  const sakIds = parseSakIds(formData.get('sakIds'))
  const oppdaterSisteGyldigeEtteroppgjørsÅr = formData.get('oppdaterSisteGyldigeEtteroppgjørsÅr') === 'checked'

  return { ar, sakIds, oppdaterSisteGyldigeEtteroppgjørsÅr }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const accessToken = await requireAccessToken(request)
    const formData = await request.formData()
    const { ar, sakIds, oppdaterSisteGyldigeEtteroppgjørsÅr } = parseFormData(formData)
    const response = await startBestemEtteroppgjorResultat(accessToken, ar, sakIds, oppdaterSisteGyldigeEtteroppgjørsÅr)
    return redirect(`/behandling/${response.behandlingId}`)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error && error.message ? error.message : 'Ukjent feil',
    }
  }
}

export default function BestemEtteroppgjorResultatPage() {
  const actionData = useActionData() as ActionData | undefined
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const error = actionData?.error
  const [etteroppgjørsårErSatt, setEtteroppgjørsårErSatt] = useState(false)

  const handleEtteroppgjorArChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value
    setEtteroppgjørsårErSatt(value !== undefined && value !== '' && Number.isInteger(+value))
  }

  return (
    <VStack gap="space-4" style={{ maxWidth: '50em', margin: '2em' }}>
      {actionData && error && <Alert variant="error">Feilmelding: {error}</Alert>}
      <Heading size="small" level="1">
        Bestem etteroppgjørsresultat (tidligere BPEN092)
      </Heading>
      <Form method="post" style={{ width: '20em' }}>
        <VStack gap="space-6">
          <TextField
            label="År for etteroppgjør:"
            aria-label="etteroppgjorAr"
            name="etteroppgjorAr"
            type="text"
            inputMode="numeric"
            onChange={handleEtteroppgjorArChange}
          />
          <Checkbox name="oppdaterSisteGyldigeEtteroppgjørsÅr" value="checked" disabled={!etteroppgjørsårErSatt}>
            Oppdater etteroppgjørsår for saksbehandler
          </Checkbox>
          <TextField
            label="Kommaseparert liste med sak-id'er som skal behandles (tomt betyr alle):"
            aria-label="sakIds"
            name="sakIds"
            type="text"
          />
          {!etteroppgjørsårErSatt && 'År for etteroppgjør må være satt'}
          <Button type="submit" disabled={isSubmitting || !etteroppgjørsårErSatt} size="small">
            Opprett
          </Button>
        </VStack>
      </Form>
    </VStack>
  )
}

type ActionData = {
  error: string | null
}
