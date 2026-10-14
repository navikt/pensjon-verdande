import { BodyLong, BodyShort, Box, Button, Heading, LocalAlert, Select, TextField, VStack } from '@navikt/ds-react'
import { Form, redirect, useActionData, useNavigation } from 'react-router'
import { apiPost } from '~/services/api.server'
import type { Route } from './+types/overfor-saker'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Overfør saker til nasjonal enhet | Verdande' }]
}

type ActionData = {
  error?: string
  values?: {
    fraEnhet: string
    sakId: string
    dryRun: string
  }
}

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()

  const fraEnhet = String(formData.get('fraEnhet') ?? '')
  const sakId = String(formData.get('sakId') ?? '')
  const dryRunStr = String(formData.get('dryRun') ?? 'true')
  const dryRun = dryRunStr === 'true'

  const hasFraEnhet = fraEnhet.length > 0
  const hasSakId = sakId.length > 0

  if (hasFraEnhet === hasSakId) {
    return {
      error: 'Du må fylle ut enten fraEnhet eller sakId (ikke begge).',
      values: { fraEnhet, sakId, dryRun: dryRunStr },
    } satisfies ActionData
  }

  let response: { behandlingId: number } | undefined

  if (hasFraEnhet) {
    response = await apiPost<{ behandlingId: number }>(
      '/api/uforetrygd/behandling/overforsaker/batch',
      { fraEnhet, dryRun },
      request,
    )
  } else {
    response = await apiPost<{ behandlingId: number }>(
      `/api/uforetrygd/behandling/overforsaker/${sakId}?dryRun=${dryRun}`,
      {},
      request,
    )
  }

  if (!response?.behandlingId) {
    throw new Error('Missing behandlingId')
  }

  return redirect(`/behandling/${response.behandlingId}`)
}

export default function OverforSaker() {
  const navigation = useNavigation()
  const actionData = useActionData<typeof action>() as ActionData | undefined
  const isSubmitting = navigation.state === 'submitting'

  return (
    <VStack gap={'space-16'}>
      <Box className={'aksel-pageblock--lg'}>
        <Heading size={'medium'} level={'1'}>
          Overfør saker til nasjonal enhet
        </Heading>
        <BodyLong>Overfører saker til nasjonal enhet for uføretrygd</BodyLong>
      </Box>
      <Form method="post" style={{ width: '20em' }}>
        <VStack gap={'space-16'}>
          {actionData?.error && (
            <LocalAlert status="error">
              <LocalAlert.Header>
                <LocalAlert.Title>Feil</LocalAlert.Title>
              </LocalAlert.Header>
              <LocalAlert.Content>{actionData.error}</LocalAlert.Content>
            </LocalAlert>
          )}
          <TextField
            label="Fra enhet"
            description={<BodyShort as="div">Enheten som sakene skal overføres fra</BodyShort>}
            aria-label="Fra enhet"
            name="fraEnhet"
            type="text"
          />
          <TextField
            label="Sak ID"
            description={<BodyShort as="div">Overfør en spesifikk sak</BodyShort>}
            aria-label="Sak ID"
            name="sakId"
            type="text"
          />
          <Select
            label="Prøvekjøring (dry run)"
            description={<BodyShort as="div">Kjører uten å sende videre til ForventetInntektUTBehandling.</BodyShort>}
            size="small"
            name="dryRun"
          >
            <option value="true">Ja</option>
            <option value="false">Nei</option>
          </Select>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Oppretter…' : 'Opprett'}
          </Button>
        </VStack>
      </Form>
    </VStack>
  )
}
