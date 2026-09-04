import {
  Box,
  Button,
  DatePicker,
  ErrorMessage,
  Heading,
  HStack,
  Label,
  Modal,
  Select,
  Textarea,
  VStack,
} from '@navikt/ds-react'
import { setHours } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import { redirect, useFetcher } from 'react-router'
import { toIsoDate } from '~/common/date'
import { toNormalizedError } from '~/common/error'
import { apiPost } from '~/services/api.server'
import type { Route } from './+types/feil-registrer-krav-og-oppgave'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Feilregistrer krav og oppgave | Verdande' }]
}

export const BEHANDLING_TYPE = {
  GYLDIGGJOERING: 'GyldiggjørAlder',
  OMREGNYTELSE: 'Omregning',
} as const

export const FEILREGISTRER_TYPE = {
  KRAV: 'KRAV',
  OPPGAVE: 'OPPGAVE',
} as const

export type Behandlingstype = (typeof BEHANDLING_TYPE)[keyof typeof BEHANDLING_TYPE]

export type Feilregistrertype = (typeof FEILREGISTRER_TYPE)[keyof typeof FEILREGISTRER_TYPE]

type ActionData = {
  error?: string
}

function konverterTilListe(sakIderText: string): string[] {
  return sakIderText
    .split('\n')
    .map((id) => id.trim())
    .filter((id) => id !== '')
}

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()

  const sakIderRaw = formData.get('sakIder')
  const behandlingstypeRaw = formData.get('behandlingstype')
  const feilregistrerTypeRaw = formData.get('feilregistrerType')
  const kommentarRaw = formData.get('kommentar')
  const datoOpprettetRaw = formData.get('datoOpprettet')
  const oppgavetekstRaw = formData.get('oppgavetekst')

  const feilregistrerType: Feilregistrertype =
    typeof feilregistrerTypeRaw === 'string' &&
    Object.values(FEILREGISTRER_TYPE).includes(feilregistrerTypeRaw as Feilregistrertype)
      ? (feilregistrerTypeRaw as Feilregistrertype)
      : FEILREGISTRER_TYPE.KRAV

  let sakIdTall: number[] = []

  if (typeof sakIderRaw === 'string') {
    const sakIder = konverterTilListe(sakIderRaw)
    const sakIdNumre = sakIder.map((id) => Number(id))
    sakIdTall = sakIdNumre.filter((id) => Number.isInteger(id))
    const ugyldigeSakIder = sakIder.filter((_, i) => !Number.isInteger(sakIdNumre[i]))

    if (ugyldigeSakIder.length > 0) {
      return {
        error: `Ugyldige sakIder (må være heltall): ${ugyldigeSakIder.join(', ')}`,
      } satisfies ActionData
    }
  }

  const behandlingstype: Behandlingstype | null =
    typeof behandlingstypeRaw === 'string' &&
    Object.values(BEHANDLING_TYPE).includes(behandlingstypeRaw as Behandlingstype)
      ? (behandlingstypeRaw as Behandlingstype)
      : null

  const kommentar = typeof kommentarRaw === 'string' ? kommentarRaw : null
  const oppgavetekst = typeof oppgavetekstRaw === 'string' ? oppgavetekstRaw.trim() : null
  const datoOpprettet = typeof datoOpprettetRaw === 'string' && datoOpprettetRaw !== '' ? datoOpprettetRaw : null

  if (datoOpprettet === null && feilregistrerType === FEILREGISTRER_TYPE.OPPGAVE) {
    return {
      error: 'Dato når oppgave ble opprettet er påkrevd',
    } satisfies ActionData
  }

  if (feilregistrerType === FEILREGISTRER_TYPE.OPPGAVE && (!oppgavetekst || oppgavetekst.length === 0)) {
    return { error: 'Skriv inn oppgavetekst' } satisfies ActionData
  }

  try {
    const response = await apiPost<{ behandlingId: number }>(
      '/api/feilregistrerkravogoppgave/feilregistrer',
      {
        sakIder: sakIdTall,
        behandlingstype,
        feilregistrerType,
        oppgaveList: [],
        oppgavetekst: oppgavetekst,
        kommentar,
        datoOpprettet,
      },
      request,
    )

    if (!response) {
      throw new Error('Opprettelse av feilregistrering av krav eller oppgave returnerte ingen respons')
    }

    return redirect(`/behandling/${response.behandlingId}`)
  } catch (error) {
    const normalizedError = toNormalizedError(error)
    const status = normalizedError?.status
    const detail = normalizedError?.detail ?? normalizedError?.message
    return {
      error: detail ?? `Feilregistrering feilet${status ? ` (HTTP ${status})` : ''}`,
    } satisfies ActionData
  }
}

export default function FeilRegistrerKravOgOppgavePage() {
  const fetcher = useFetcher<typeof action>()
  const formRef = useRef<HTMLFormElement>(null)
  const modalRef = useRef<HTMLDialogElement>(null)

  const [feilregistrerType, setFeilregistrerType] = useState<Feilregistrertype>(FEILREGISTRER_TYPE.KRAV)
  const [sakIderText, setSakIderText] = useState('')
  const [oppgavetekst, setOppgavetekst] = useState('')
  const [kommentar, setKommentarText] = useState('')
  const [datoOpprettet, setDatoOpprettet] = useState<Date | undefined>()

  const visOppgaveFelter = feilregistrerType === FEILREGISTRER_TYPE.OPPGAVE
  const visBehandlingstypeFelter = feilregistrerType === FEILREGISTRER_TYPE.KRAV
  const visSakIdFelter = true

  useEffect(() => {
    if (feilregistrerType === FEILREGISTRER_TYPE.KRAV) {
      setOppgavetekst('')
      setDatoOpprettet(undefined)
    }
  }, [feilregistrerType])

  const valideringsFeil: string | undefined = (() => {
    if (visSakIdFelter && sakIderText.trim().length > 0 && konverterTilListe(sakIderText).length === 0) return undefined
    if (visOppgaveFelter && datoOpprettet === undefined) return 'Velg dato når oppgave ble opprettet'
    if (visOppgaveFelter && oppgavetekst.trim().length === 0) return 'Skriv inn oppgavetekst'
    return undefined
  })()

  return (
    <VStack gap="space-16">
      <Heading size="large">Feilregistrer krav og oppgave</Heading>

      <fetcher.Form
        ref={formRef}
        method="post"
        onSubmit={(e) => {
          e.preventDefault()

          const payload = new FormData()

          payload.set('_intent', 'feilregistrer')
          payload.set('feilregistrerType', feilregistrerType)
          payload.set('sakIder', sakIderText)

          if (visBehandlingstypeFelter) {
            payload.set('behandlingstype', new FormData(e.currentTarget).get('behandlingstype')?.toString() ?? '')
          }

          payload.set('kommentar', kommentar)

          if (visOppgaveFelter) {
            payload.set('oppgavetekst', oppgavetekst)

            if (datoOpprettet) {
              payload.set('datoOpprettet', toIsoDate(datoOpprettet))
            }
          }

          fetcher.submit(payload, { method: 'post' })
        }}
      >
        <VStack gap="space-12">
          <HStack gap="space-8" align="end">
            <Select
              label="Velg krav eller oppgave som skal feilregistreres"
              name="feilregistrerType"
              value={feilregistrerType}
              onChange={(e) => setFeilregistrerType(e.target.value as Feilregistrertype)}
            >
              <option value={FEILREGISTRER_TYPE.KRAV}>Krav</option>
              <option value={FEILREGISTRER_TYPE.OPPGAVE}>Oppgave</option>
            </Select>
          </HStack>

          {visSakIdFelter && (
            <HStack gap="space-12" align="start">
              <VStack style={{ width: '20rem' }} gap="space-2">
                <Textarea
                  style={{ height: '25rem' }}
                  label={visOppgaveFelter ? 'Saker' : 'Feilregistrerte saker (en per linje)'}
                  onChange={(e) => setSakIderText(e.target.value)}
                  value={sakIderText}
                  name="sakIder"
                  minRows={8}
                />
              </VStack>
            </HStack>
          )}

          {visOppgaveFelter && (
            <HStack gap="space-12" align="start">
              <VStack style={{ marginTop: '0.25rem' }} gap="space-2">
                <Label>Dato når oppgave ble opprettet</Label>
                <Box
                  padding="space-8"
                  borderRadius="8"
                  borderWidth="1"
                  borderColor={fetcher.data?.error ? 'danger-subtle' : 'neutral-subtleA'}
                >
                  <DatePicker.Standalone
                    toDate={new Date()}
                    selected={datoOpprettet}
                    onSelect={(date) => setDatoOpprettet(date ? setHours(date, 12) : undefined)}
                  />
                </Box>
              </VStack>
            </HStack>
          )}

          {visBehandlingstypeFelter && (
            <HStack gap="space-8" align="end">
              <Select
                label="Velg behandlingen som opprettet feil krav (valgfritt)"
                name="behandlingstype"
                defaultValue=""
              >
                <option value="">Velg behandlingstype</option>
                <option value={BEHANDLING_TYPE.GYLDIGGJOERING}>{BEHANDLING_TYPE.GYLDIGGJOERING.valueOf()}</option>
              </Select>
            </HStack>
          )}

          {visOppgaveFelter ? (
            <HStack gap="space-12" align="start">
              <VStack gap="space-6" style={{ flex: '0 1 40rem', width: '100%', maxWidth: '40rem' }}>
                <Textarea
                  label="Oppgavetekst"
                  onChange={(e) => setOppgavetekst(e.target.value)}
                  value={oppgavetekst}
                  name="oppgavetekst"
                  minRows={4}
                />
                <Textarea
                  label="Kommentar (valgfritt)"
                  onChange={(e) => setKommentarText(e.target.value)}
                  value={kommentar}
                  name="kommentar"
                  minRows={4}
                />
              </VStack>
            </HStack>
          ) : (
            <HStack gap="space-12" align="start">
              <VStack gap="space-6" style={{ flex: '0 1 40rem', width: '100%', maxWidth: '40rem' }}>
                <Textarea
                  label="Kommentar (valgfritt)"
                  onChange={(e) => setKommentarText(e.target.value)}
                  value={kommentar}
                  name="kommentar"
                  minRows={4}
                />
              </VStack>
            </HStack>
          )}

          <HStack>
            <Button
              type="button"
              onClick={() => modalRef.current?.showModal()}
              loading={fetcher.state === 'submitting'}
              disabled={fetcher.state === 'submitting' || Boolean(valideringsFeil)}
            >
              Feilregistrer
            </Button>
          </HStack>

          {valideringsFeil && <ErrorMessage>{valideringsFeil}</ErrorMessage>}
          {fetcher.data?.error && <ErrorMessage>{fetcher.data.error}</ErrorMessage>}
        </VStack>
      </fetcher.Form>

      <Modal ref={modalRef} header={{ heading: 'Bekreft feilregistrering' }} width="small">
        <Modal.Body>
          Du er i ferd med å feilregistrere {konverterTilListe(sakIderText).length} saker. Handlingen kan ikke angres.
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            loading={fetcher.state === 'submitting'}
            disabled={fetcher.state === 'submitting' || Boolean(valideringsFeil)}
            onClick={() => {
              modalRef.current?.close()
              formRef.current?.requestSubmit()
            }}
          >
            Bekreft og feilregistrer
          </Button>
          <Button type="button" variant="secondary" onClick={() => modalRef.current?.close()}>
            Avbryt
          </Button>
        </Modal.Footer>
      </Modal>
    </VStack>
  )
}
