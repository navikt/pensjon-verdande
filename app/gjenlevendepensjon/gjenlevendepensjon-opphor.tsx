import { Button, Heading, Select, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import { redirect, useFetcher } from 'react-router'
import { ConfirmationModal } from '~/components/confirmation-modal/ConfirmationModal'
import { apiPost } from '~/services/api.server'
import { parseSakIds, SakIdTextArea } from '~/uforetrygd/components/input/SakIdTextArea'
import type { Route } from './+types/gjenlevendepensjon-opphor'

type GjenlevendepensjonOpphorBatchBehandlingRequest = {
  sakIdListe: number[]
  dryRun: boolean
}

type GjenlevendepensjonBatchBehandlingResponse = {
  behandlingId: number
}

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Opphør av gjenlevendepensjon | Verdande' }]
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const dryRun = formData.get('dryRun')
  if (dryRun !== 'true' && dryRun !== 'false') {
    throw new Response('Velg om behandlingen skal være en prøvekjøring.', { status: 400 })
  }

  const sakIdListe = parseSakIds(formData.get('sakIdListe'))
  if (sakIdListe.some((sakId) => !Number.isSafeInteger(sakId))) {
    throw new Response('Sak-ID-er må være positive heltall.', { status: 400 })
  }

  const body: GjenlevendepensjonOpphorBatchBehandlingRequest = {
    sakIdListe,
    dryRun: dryRun === 'true',
  }
  const response = await apiPost<GjenlevendepensjonBatchBehandlingResponse>(
    '/api/gjenlevendepensjon/utvidetrett/behandling/opphor/batch',
    body,
    request,
  )

  if (!response?.behandlingId) {
    throw new Error('Opprettelse av behandling mislyktes: mangler behandlingId')
  }

  return redirect(`/behandling/${response.behandlingId}`)
}

export default function GjenlevendepensjonOpphorPage() {
  const fetcher = useFetcher<typeof action>()
  const [formData, setFormData] = useState<FormData | null>(null)

  return (
    <VStack gap="space-20" style={{ maxWidth: '40em' }}>
      <Heading size="medium" level="1">
        Opprett behandlinger for opphør av gjenlevendepensjon
      </Heading>
      <fetcher.Form
        method="post"
        onSubmit={(event) => {
          event.preventDefault()
          setFormData(new FormData(event.currentTarget))
        }}
      >
        <VStack gap="space-16">
          <Select label="Prøvekjøring (dry run)" name="dryRun" defaultValue="true" style={{ width: 'fit-content' }}>
            <option value="true">Ja</option>
            <option value="false">Nei</option>
          </Select>
          <SakIdTextArea fieldName="sakIdListe" />
          <Button type="submit" disabled={fetcher.state !== 'idle'} style={{ width: 'fit-content' }}>
            Opprett
          </Button>
        </VStack>
      </fetcher.Form>
      <ConfirmationModal
        open={formData !== null}
        onCancel={() => setFormData(null)}
        onOk={() => {
          if (formData !== null) {
            fetcher.submit(formData, { method: 'post' })
            setFormData(null)
          }
        }}
        text="Dette vil opprette behandlinger for opphør av gjenlevendepensjon. Er du sikker på at du vil fortsette?"
      />
    </VStack>
  )
}
