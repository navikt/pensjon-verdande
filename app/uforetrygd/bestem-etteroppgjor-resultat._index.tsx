import { Button, Checkbox, Heading, HelpText, HStack, LocalAlert, TextField, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import { Form, redirect, useNavigation } from 'react-router'
import { apiPost } from '~/services/api.server'
import { parseSakIds, SakIdTextArea } from '~/uforetrygd/components/input/SakIdTextArea'
import type { Route } from './+types/bestem-etteroppgjor-resultat._index'

function parseFormData(formData: FormData) {
  const arValue = formData.get('etteroppgjorAr')
  const ar = arValue ? Number(arValue) : null
  const sakIds = parseSakIds(formData.get('sakIds'))
  const oppdaterSisteGyldigeEtteroppgjørsÅr = formData.get('oppdaterSisteGyldigeEtteroppgjørsÅr') === 'checked'
  const overstyrEpsVedManglendeData = formData.get('overstyrEpsVedManglendeData') === 'checked'

  return { ar, sakIds, oppdaterSisteGyldigeEtteroppgjørsÅr, overstyrEpsVedManglendeData }
}

const overstyrEpsHelperText = `Ved å huke av denne aktiveres følgende : 
  
Ved manglende etteroppgjør for annen forelder vil brukers etteroppgjør gå til manuell behandling med oppgave.

Hvis det ikke er registrert mottatt inntekter for annen forelder vil etteroppgjøret gjennomføres som normalt, og basere seg på at annen forelder ikke har inntekter.`

const oppdaterEtteroppgjorsArHelperText = `Ved å huke av denne vil man åpne for at saksbehandler kan gjennomføre manuelle etteroppgjør for samme år.

Hvis det allerede er åpnet opp for manuelle etteroppgjør for dette året er det ikke nødvendig å huke av denne på nytt.`

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Bestem etteroppgjør resultat | Verdande' }]
}

export const action = async ({ request }: Route.ActionArgs) => {
  try {
    const formData = await request.formData()
    const { ar, sakIds, oppdaterSisteGyldigeEtteroppgjørsÅr, overstyrEpsVedManglendeData } = parseFormData(formData)
    const response = await apiPost<{ behandlingId: number }>(
      '/api/uforetrygd/bestemetteroppgjor/start',
      {
        sakIds,
        ar,
        oppdaterSisteGyldigeEtteroppgjørsÅr,
        overstyrEpsVedManglendeData,
      },
      request,
    )
    if (!response?.behandlingId) {
      throw new Error('Missing behandlingId')
    }
    return redirect(`/behandling/${response.behandlingId}`)
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
    <VStack gap="space-16" style={{ margin: '2em' }}>
      {actionData && error && (
        <LocalAlert status="error">
          <LocalAlert.Content>Feilmelding: {error}</LocalAlert.Content>
        </LocalAlert>
      )}
      <Heading size="medium" level="1">
        Bestem etteroppgjørsresultat (tidligere BPEN092)
      </Heading>
      <Form method="post" style={{ width: '25em' }}>
        <VStack gap="space-20">
          <TextField
            label="År for etteroppgjør:"
            aria-label="etteroppgjorAr"
            name="etteroppgjorAr"
            type="text"
            inputMode="numeric"
            onChange={handleEtteroppgjorArChange}
            style={{ width: '10em' }}
          />
          <HStack gap="space-8" align="center">
            <Checkbox name="oppdaterSisteGyldigeEtteroppgjørsÅr" value="checked">
              Oppdater etteroppgjørsår for saksbehandler
            </Checkbox>
            <HelpText title="Oppdater siste gyldige etteroppgjorsår">
              <span style={{ whiteSpace: 'pre-line' }}>{oppdaterEtteroppgjorsArHelperText}</span>
            </HelpText>
          </HStack>
          <HStack gap="space-8" align="center">
            <Checkbox name="overstyrEpsVedManglendeData" value="checked">
              Overstyr EPS ved manglende grunnlagsdata
            </Checkbox>
            <HelpText title="Overstyring av EPS">
              <span style={{ whiteSpace: 'pre-line' }}>{overstyrEpsHelperText}</span>
            </HelpText>
          </HStack>
          <SakIdTextArea fieldName="sakIds" />
          {!etteroppgjørsårErSatt && 'År for etteroppgjør må være satt'}
          <Button
            type="submit"
            disabled={isSubmitting || !etteroppgjørsårErSatt}
            size="small"
            style={{ width: '10em' }}
          >
            Opprett
          </Button>
        </VStack>
      </Form>
    </VStack>
  )
}
