import { Alert, Button, Checkbox, Heading, TextField, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import { Form, redirect, useNavigation } from 'react-router'
import { apiPost } from '~/services/api.server'
import type { Route } from './+types/bestem-etteroppgjor-resultat._index'

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

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Bestem etteroppgjør resultat | Verdande' }]
}

export const action = async ({ request }: Route.ActionArgs) => {
  try {
    const formData = await request.formData()
    const { ar, sakIds, oppdaterSisteGyldigeEtteroppgjørsÅr } = parseFormData(formData)
    const response = await apiPost<{ behandlingId: number }>(
      '/api/uforetrygd/bestemetteroppgjor/start',
      {
        sakIds,
        ar,
        oppdaterSisteGyldigeEtteroppgjørsÅr,
      },
      request,
    )
    return redirect(`/behandling/${response?.behandlingId}`)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error && error.message ? error.message : 'Ukjent feil',
    }
  }
}

export default function BestemEtteroppgjorResultatPage({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const error = actionData?.error
  const [etteroppgjørsårErSatt, setEtteroppgjørsårErSatt] = useState(false)

  const handleEtteroppgjorArChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value
    setEtteroppgjørsårErSatt(value !== undefined && value !== '' && Number.isInteger(+value))
  }

  return (
    <VStack gap="space-16" style={{ maxWidth: '50em', margin: '2em' }}>
      {actionData && error && <Alert variant="error">Feilmelding: {error}</Alert>}
      <Heading size="small" level="1">
        Bestem etteroppgjørsresultat (tidligere BPEN092)
      </Heading>
      <Form method="post" style={{ width: '20em' }}>
        <VStack gap="space-20">
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
