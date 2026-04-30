import {
  Box,
  Button,
  DatePicker,
  ErrorMessage,
  Heading,
  HStack,
  Label,
  Select,
  Textarea,
  VStack,
} from '@navikt/ds-react'
import { setHours } from 'date-fns'
import { useState } from 'react'
import { redirect, useFetcher } from 'react-router'
import { toIsoDate } from '~/common/date'
import { apiPost } from '~/services/api.server'
import type { Route } from './+types/feil-registrer-krav-og-oppgave'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Feil registrer krav og oppgave | Verdande' }]
}

export const BEHANDLING_TYPE = {
  GYLDIGGJOERING: 'GyldiggjørAlder',
} as const

export const FEILREGISTRER_TYPE = {
  KRAV: 'KRAV',
  OPPGAVE: 'OPPGAVE',
  KRAV_OG_OPPGAVE: 'KRAV_OG_OPPGAVE',
} as const

export type Behandlingstype = (typeof BEHANDLING_TYPE)[keyof typeof BEHANDLING_TYPE]

export type Feilregistrertype = (typeof FEILREGISTRER_TYPE)[keyof typeof FEILREGISTRER_TYPE]

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()

  const sakIderRaw = formData.get('sakIder')
  const behandlingstypeRaw = formData.get('behandlingstype')
  const feilregistrerTypeRaw = formData.get('feilregistrerType')
  const oppgavetekstRaw = formData.get('oppgavetekst')
  const kommentarRaw = formData.get('kommentar')
  const datoOpprettetRaw = formData.get('datoOpprettet')

  if (typeof sakIderRaw !== 'string') {
    throw new Error('Påkrevd felt "sakIder" mangler eller har feil format')
  }

  const sakIder = konverterTilListe(sakIderRaw)

  const behandlingstype: Behandlingstype | null =
    typeof behandlingstypeRaw === 'string' &&
    Object.values(BEHANDLING_TYPE).includes(behandlingstypeRaw as Behandlingstype)
      ? (behandlingstypeRaw as Behandlingstype)
      : null

  const feilregistrerType: Feilregistrertype =
    typeof feilregistrerTypeRaw === 'string' &&
    Object.values(FEILREGISTRER_TYPE).includes(feilregistrerTypeRaw as Feilregistrertype)
      ? (feilregistrerTypeRaw as Feilregistrertype)
      : FEILREGISTRER_TYPE.KRAV_OG_OPPGAVE

  const oppgavetekst = typeof oppgavetekstRaw === 'string' ? oppgavetekstRaw : ''
  const kommentar = typeof kommentarRaw === 'string' ? kommentarRaw : ''

  const kreverDato = feilregistrerType !== FEILREGISTRER_TYPE.KRAV
  const datoOpprettet = typeof datoOpprettetRaw === 'string' && datoOpprettetRaw !== '' ? datoOpprettetRaw : null

  if (kreverDato && datoOpprettet === null) {
    return { error: 'Dato når oppgave ble opprettet er påkrevd' }
  }

  const response = await apiPost<{ behandlingId: number }>(
    '/api/feilregistrerkrav',
    {
      sakIder,
      behandlingstype,
      feilregistrerType,
      oppgavetekst,
      kommentar,
      datoOpprettet,
    },
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
  const fetcher = useFetcher<typeof action>()
  const [sakIderText, setSakIderText] = useState<string>('')
  const [oppgavetekst, setOppgavetekst] = useState<string>('')
  const [kommentar, setKommentarText] = useState<string>('')
  const [datoOpprettet, setDatoOpprettet] = useState<Date | undefined>()

  return (
    <VStack gap="space-16">
      <Heading size="large">Feilregistrer krav</Heading>
      <fetcher.Form
        method="post"
        onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          if (datoOpprettet) {
            formData.set('datoOpprettet', toIsoDate(datoOpprettet))
          }
          fetcher.submit(formData, { method: 'post' })
        }}
      >
        <VStack gap="space-12">
          <HStack gap="space-8" align="end">
            <Select label="Velg krav eller oppgave som skal feilregistreres" name="feilregistrerType" defaultValue="">
              <option value="" disabled>
                Velg feilregistrertype
              </option>

              <option value={FEILREGISTRER_TYPE.KRAV_OG_OPPGAVE}>Krav og oppgave</option>

              <option value={FEILREGISTRER_TYPE.KRAV}>Krav</option>

              <option value={FEILREGISTRER_TYPE.OPPGAVE}>Oppgave</option>
            </Select>
          </HStack>
          <HStack gap="space-8" align="end">
            <Textarea
              label={'Feilregistrerte saker (en per linje)'}
              onChange={(e) => setSakIderText(e.target.value)}
              value={sakIderText}
              name="sakIder"
              minRows={6}
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
          <HStack gap="space-12" align="start">
            <VStack gap="space-6" style={{ flex: '0 1 40rem', width: '100%', maxWidth: '40rem' }}>
              <Textarea
                label="Oppgavetekst (valgfritt)"
                onChange={(e) => setOppgavetekst(e.target.value)}
                value={oppgavetekst}
                name="oppgavetekst"
                minRows={3}
              />
              <Textarea
                label={'Kommentar(valgfritt)'}
                onChange={(e) => setKommentarText(e.target.value)}
                value={kommentar}
                name="kommentar"
                minRows={4}
              />
            </VStack>

            <VStack gap="space-2" style={{ minWidth: 240, marginLeft: '0.5rem' }}>
              <Label>Dato når oppgave ble opprettet *</Label>
              <Box
                padding="space-8"
                borderRadius="8"
                borderWidth="1"
                borderColor={fetcher.data?.error ? 'danger' : 'neutral'}
              >
                <div style={{ transform: 'scale(0.9)', transformOrigin: 'top left' }}>
                  <DatePicker.Standalone
                    toDate={new Date()}
                    selected={datoOpprettet}
                    onSelect={(date) => setDatoOpprettet(date ? setHours(date, 12) : undefined)}
                  />
                </div>
              </Box>
              {fetcher.data?.error && <ErrorMessage>{fetcher.data.error}</ErrorMessage>}
            </VStack>
          </HStack>
          <HStack>
            <Button type="submit" name="action">
              Feilregistrer
            </Button>
          </HStack>
        </VStack>
      </fetcher.Form>
    </VStack>
  )
}
