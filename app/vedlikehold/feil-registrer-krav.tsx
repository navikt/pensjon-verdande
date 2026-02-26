import { Button, Heading, HStack, Select, Textarea, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import { redirect, useFetcher } from 'react-router'
import { apiPost } from '~/services/api.server'
import type { Route } from './+types/feil-registrer-krav'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Feil registrer krav | Verdande' }]
}

export const BEHANDLING_TYPE = {
  GYLDIGGJOERING: 'GyldiggjørAlder',
} as const

export type Behandlingstype = (typeof BEHANDLING_TYPE)[keyof typeof BEHANDLING_TYPE]

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()

  const sakIderRaw = formData.get('sakIder')
  const behandlingstypeRaw = formData.get('behandlingstype')

  if (typeof sakIderRaw !== 'string') {
    throw new Error('Påkrevd felt "sakIder" mangler eller har feil format')
  }

  const sakIder = konverterTilListe(sakIderRaw)

  const behandlingstype: Behandlingstype | null =
    typeof behandlingstypeRaw === 'string' &&
    Object.values(BEHANDLING_TYPE).includes(behandlingstypeRaw as Behandlingstype)
      ? (behandlingstypeRaw as Behandlingstype)
      : null

  const response = await apiPost<{ behandlingId: number }>(
    '/api/feilregistrerkrav',
    { sakIder, behandlingstype },
    request,
  )

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
        <VStack gap="space-16">
          <HStack gap="space-8" align="end">
            <Textarea
              label={'Feilregistrerte saker (en per linje)'}
              onChange={(e) => setSakIderText(e.target.value)}
              value={sakIderText}
              name="sakIder"
              minRows={10}
            />
          </HStack>
          <HStack gap="space-8" align="end">
            <Select
              label="Velg behandlingen som opprettet feil krav (valgfritt)"
              name="behandlingstype"
              defaultValue=""
            >
              <option value="" disabled>
                Velg behandlingstype
              </option>

              <option value={BEHANDLING_TYPE.GYLDIGGJOERING}>{BEHANDLING_TYPE.GYLDIGGJOERING.valueOf()}</option>
            </Select>
          </HStack>
          <HStack>
            <Button type="submit" name="action">
              Feilregistrer saker
            </Button>
          </HStack>
        </VStack>
      </fetcher.Form>
    </VStack>
  )
}
