import { Button, Heading, HStack, Textarea, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import { Outlet, redirect, useFetcher } from 'react-router'
import { apiPost } from '~/services/api.server'
import type { Route } from './+types/feil-registrer-krav'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Feil registrer krav | Verdande' }]
}

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()

  const sakIderRaw = formData.get('sakIder')

  if (typeof sakIderRaw !== 'string') {
    throw new Error('Påkrevd felt "sakIder" mangler eller har feil format')
  }

  const sakIder = konverterTilListe(sakIderRaw)

  const response = await apiPost<{ behandlingId: number }>('/api/feilregistrerkrav', { sakIder }, request)

  if (!response) {
    throw new Error('Opprettelse av feilregistrer krav returnerte ingen respons')
  }
  return redirect(`/behandling/${response.behandlingId}`)
}

function konverterTilListe(sakIderText: string): string[] {
  return sakIderText
    .split('\n')
    .map((id) => id.trim())
    .filter((id) => id !== '')
}

export default function FeilRegistrerKravPage() {
  const fetcher = useFetcher()
  const [sakIderText, setSakIderText] = useState<string>('')
  return (
    <VStack gap="space-20">
      <Heading size="large">Feilregistrer krav</Heading>
      <fetcher.Form method="post">
        <HStack gap="space-8" align="end">
          <Textarea
            label={'Feil registrerte saker (en per linje)'}
            onChange={(e) => setSakIderText(e.target.value)}
            value={sakIderText}
            name="sakIder"
            minRows={10}
          />
          <Button type="submit" name="action">
            Feil registrer saker
          </Button>
        </HStack>
      </fetcher.Form>
      <Outlet />
    </VStack>
  )
}
