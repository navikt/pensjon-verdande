import { Alert, Button, Heading, Select, TextField, VStack } from '@navikt/ds-react'
import { type ActionFunctionArgs, Form, useActionData, useNavigation } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { startBestemEtteroppgjorResultat } from '~/uforetrygd/bestem-etteroppgjor-resultat.server'

function parseSakIds(sakIds: FormDataEntryValue | null): number[] {
  if (!sakIds || typeof sakIds !== "string") return []

  return sakIds
    .split(',')
    .map(id => id.trim())
    .filter(id => id !== '')
    .map(id => {
      const parsed = Number(id)
      if (isNaN(parsed)) {
        throw new Error(`Ugyldig sak ID: "${id}"`)
      }
      return parsed
    })
}

function parseFormData(formData: FormData) {
  const dryRun = formData.get('dryRun') === "true"
  const arValue = formData.get('etteroppgjorAr')
  const ar = arValue ? Number(arValue) : null
  const sakIds = parseSakIds(formData.get('sakIds'))

  return { dryRun, ar, sakIds }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const accessToken = await requireAccessToken(request)
    const formData = await request.formData()
    const { dryRun, ar, sakIds } = parseFormData(formData)
    await startBestemEtteroppgjorResultat(accessToken, dryRun, ar, sakIds)
    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error && error.message ? error.message : "Ukjent feil",
    }
  }
}

export default function BestemEtteroppgjorResultatPage() {
  const actionData = useActionData() as ActionData | undefined
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"
  const error = actionData?.error
  const success = actionData?.success

  return (
    <VStack gap="4" style={{ maxWidth: '50em', margin: '2em' }}>
      {actionData &&
        <>
          {success &&
            <Alert variant="success">
              Behandling er opprettet
            </Alert>}
          {error &&
            <Alert variant="error">
              Feilmelding: {error}
            </Alert>}
        </>
      }
      <Heading size="small" level="1">
        Bestem etteroppgjørsresultat
      </Heading>
      <Form method="post" style={{ width: '20em' }}>
        <VStack gap="5">
          <Select label="DryRun : " size="small" name="dryRun" defaultValue="true">
            <option value="true">Ja</option>
            <option value="false">Nei</option>
          </Select>
          <TextField
            label="År for Etteroppgjør : "
            aria-label="etteroppgjorAr"
            name="etteroppgjorAr"
            type="text"
            inputMode="numeric"
          />
          <TextField
            label="Kommaseparert liste med sak-id'er som skal behandles (valgfritt) : "
            aria-label="sakIds"
            name="sakIds"
            type="text"
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            size="small"
          >
            Opprett
          </Button>
        </VStack>
      </Form>
    </VStack>
  )
}

type ActionData = {
  success: boolean
  error: string | null
}
