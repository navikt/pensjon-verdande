import {
  Alert,
  Box,
  Button,
  Checkbox,
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
import { useEffect, useMemo, useRef, useState } from 'react'
import { redirect, useFetcher } from 'react-router'
import { toIsoDate } from '~/common/date'
import { toNormalizedError } from '~/common/error'
import { isRecord } from '~/common/utils'
import { apiPost } from '~/services/api.server'
import type { Route } from './+types/feil-registrer-krav-og-oppgave'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Feilregistrer krav og oppgave | Verdande' }]
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

type HentOppgaveteksterResponse = {
  oppgavetekster: Record<string, number[]>
  oppgaveError?: string
}

type ActionData = {
  error?: string
  oppgavetekster?: Record<string, number[]>
  oppgaveError?: string
}

function toOppgavetekster(data: unknown): Record<string, number[]> {
  if (!isRecord(data)) return {}

  const oppgavetekster = data.oppgavetekster
  if (!isRecord(oppgavetekster)) return {}

  const result: Record<string, number[]> = {}

  for (const [tekst, ids] of Object.entries(oppgavetekster)) {
    if (!Array.isArray(ids)) continue
    result[tekst] = ids.filter((value): value is number => typeof value === 'number' && Number.isInteger(value))
  }

  return result
}

function konverterTilListe(sakIderText: string): string[] {
  return sakIderText
    .split('\n')
    .map((id) => id.trim())
    .filter((id) => id !== '')
}

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const intent = formData.get('_intent')

  if (intent === 'hentOppgaver') {
    const sakIderRaw = formData.get('sakIder')
    const datoOpprettetRaw = formData.get('datoOpprettet')

    if (typeof sakIderRaw !== 'string' || konverterTilListe(sakIderRaw).length === 0) {
      return {
        oppgavetekster: {},
        oppgaveError: 'Legg inn minst én sakid før du henter oppgaver',
      } satisfies HentOppgaveteksterResponse
    }

    if (typeof datoOpprettetRaw !== 'string' || datoOpprettetRaw === '') {
      return {
        oppgavetekster: {},
        oppgaveError: 'Velg dato når oppgave ble opprettet før du henter oppgaver',
      } satisfies HentOppgaveteksterResponse
    }

    try {
      const sakIdListe = konverterTilListe(sakIderRaw)
      const sakIdNumre = sakIdListe.map((id) => Number(id))
      const ugyldigeSakIder = sakIdListe.filter((_, i) => !Number.isInteger(sakIdNumre[i]))

      if (ugyldigeSakIder.length > 0) {
        return {
          oppgavetekster: {},
          oppgaveError: `Ugyldige sakIder (må være heltall): ${ugyldigeSakIder.join(', ')}`,
        } satisfies HentOppgaveteksterResponse
      }

      const sakIdNumbers = sakIdNumre.filter((id) => Number.isInteger(id))

      const response = await apiPost<unknown>(
        '/api/feilregistrerkravogoppgave/hentoppgaver',
        {
          sakIder: sakIdNumbers,
          datoOpprettet: datoOpprettetRaw,
        },
        request,
      )

      return {
        oppgavetekster: toOppgavetekster(response),
      } satisfies HentOppgaveteksterResponse
    } catch (error) {
      const normalizedError = toNormalizedError(error)
      const status = normalizedError?.status
      const detail = normalizedError?.detail ?? normalizedError?.message

      return {
        oppgavetekster: {},
        oppgaveError: detail ?? `Kunne ikke hente oppgaver${status ? ` (HTTP ${status})` : ''}`,
      } satisfies HentOppgaveteksterResponse
    }
  }

  const sakIderRaw = formData.get('sakIder')
  const behandlingstypeRaw = formData.get('behandlingstype')
  const feilregistrerTypeRaw = formData.get('feilregistrerType')
  const kommentarRaw = formData.get('kommentar')
  const datoOpprettetRaw = formData.get('datoOpprettet')
  const oppgaveteksterMapRaw = formData.get('oppgaveteksterMap')
  const valgteOppgaverRaw = formData.getAll('valgteOppgaver')

  if (typeof sakIderRaw !== 'string') {
    throw new Error('Påkrevd felt "sakIder" mangler eller har feil format')
  }

  const sakIder = konverterTilListe(sakIderRaw)
  const sakIdNumre = sakIder.map((id) => Number(id))
  const sakIdTall = sakIdNumre.filter((id) => Number.isInteger(id))
  const ugyldigeSakIder = sakIder.filter((_, i) => !Number.isInteger(sakIdNumre[i]))

  if (ugyldigeSakIder.length > 0) {
    return {
      error: `Ugyldige sakIder (må være heltall): ${ugyldigeSakIder.join(', ')}`,
    } satisfies ActionData
  }

  if (sakIdTall.length === 0) {
    return { error: 'Mangler sakId' } satisfies ActionData
  }

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

  const kommentar = typeof kommentarRaw === 'string' ? kommentarRaw : null

  const datoOpprettet = typeof datoOpprettetRaw === 'string' && datoOpprettetRaw !== '' ? datoOpprettetRaw : null

  if (datoOpprettet === null && feilregistrerType !== FEILREGISTRER_TYPE.KRAV) {
    return {
      error: 'Dato når oppgave ble opprettet er påkrevd',
    } satisfies ActionData
  }

  let oppgaveList: number[] = []

  if (typeof oppgaveteksterMapRaw === 'string' && oppgaveteksterMapRaw !== '') {
    try {
      const parsed = JSON.parse(oppgaveteksterMapRaw) as Record<string, unknown>
      const oppgaveteksterMap: Record<string, number[]> = {}

      for (const [tekst, ids] of Object.entries(parsed)) {
        if (!Array.isArray(ids)) continue
        oppgaveteksterMap[tekst] = ids.filter(
          (value): value is number => typeof value === 'number' && Number.isInteger(value),
        )
      }

      oppgaveList = valgteOppgaverRaw
        .filter((value): value is string => typeof value === 'string')
        .flatMap((tekst) => oppgaveteksterMap[tekst] ?? [])
        .filter((id) => Number.isInteger(id))
    } catch {
      return { error: 'Kunne ikke lese valgte oppgaver' } satisfies ActionData
    }
  }

  if (feilregistrerType !== FEILREGISTRER_TYPE.KRAV && oppgaveList.length === 0) {
    return { error: 'Velg minst én oppgavetekst' } satisfies ActionData
  }

  try {
    const response = await apiPost<{ behandlingId: number }>(
      '/api/feilregistrerkravogoppgave/feilregistrer',
      {
        sakIder: sakIdTall,
        behandlingstype,
        feilregistrerType,
        oppgaveList,
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
  const oppgaveFetcher = useFetcher<HentOppgaveteksterResponse>()
  const formRef = useRef<HTMLFormElement>(null)
  const modalRef = useRef<HTMLDialogElement>(null)

  const [feilregistrerType, setFeilregistrerType] = useState<Feilregistrertype>(FEILREGISTRER_TYPE.KRAV_OG_OPPGAVE)
  const [sakIderText, setSakIderText] = useState('')
  const [kommentar, setKommentarText] = useState('')
  const [datoOpprettet, setDatoOpprettet] = useState<Date | undefined>()
  const [valgteOppgaver, setValgteOppgaver] = useState<string[]>([])
  const [lastFetchSnapshot, setLastFetchSnapshot] = useState<string | null>(null)

  const oppgaveteksterMap = oppgaveFetcher.data?.oppgavetekster ?? {}
  const oppgavetekster = useMemo(() => Object.keys(oppgaveteksterMap), [oppgaveteksterMap])

  const currentInputsKey = `${sakIderText}|${datoOpprettet ? toIsoDate(datoOpprettet) : ''}`
  const oppgaverErUtdatert = lastFetchSnapshot !== null && lastFetchSnapshot !== currentInputsKey

  const visOppgaveFelter = feilregistrerType !== FEILREGISTRER_TYPE.KRAV
  const visBehandlingstypeFelter = feilregistrerType !== FEILREGISTRER_TYPE.OPPGAVE
  const kanHenteOppgaver = visOppgaveFelter && sakIderText.trim().length > 0 && datoOpprettet !== undefined

  useEffect(() => {
    if (oppgaveFetcher.data !== undefined) {
      setValgteOppgaver([])
    }
  }, [oppgaveFetcher.data])

  useEffect(() => {
    if (oppgaverErUtdatert) {
      setValgteOppgaver([])
    }
  }, [oppgaverErUtdatert])

  useEffect(() => {
    if (feilregistrerType === FEILREGISTRER_TYPE.KRAV) {
      setValgteOppgaver([])
    }
  }, [feilregistrerType])

  const handleOppgaveValg = (oppgaveTekst: string, checked: boolean) => {
    const nesteValg = checked
      ? [...valgteOppgaver, oppgaveTekst]
      : valgteOppgaver.filter((item) => item !== oppgaveTekst)

    setValgteOppgaver(nesteValg)
  }

  return (
    <VStack gap="space-16">
      <Heading size="large">Feilregistrer krav og oppgave</Heading>

      <fetcher.Form
        ref={formRef}
        method="post"
        onSubmit={(e) => {
          e.preventDefault()

          const htmlFormData = new FormData(e.currentTarget)
          const payload = new FormData()

          payload.set('_intent', 'feilregistrer')
          payload.set('feilregistrerType', feilregistrerType)

          payload.set('sakIder', (htmlFormData.get('sakIder') ?? '').toString())
          payload.set('behandlingstype', (htmlFormData.get('behandlingstype') ?? '').toString())
          payload.set('kommentar', (htmlFormData.get('kommentar') ?? '').toString())

          if (datoOpprettet) {
            payload.set('datoOpprettet', toIsoDate(datoOpprettet))
          }

          payload.set('oppgaveteksterMap', JSON.stringify(oppgaveteksterMap))
          for (const tekst of valgteOppgaver) {
            payload.append('valgteOppgaver', tekst)
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
              <option value={FEILREGISTRER_TYPE.KRAV_OG_OPPGAVE}>Krav og oppgave</option>
              <option value={FEILREGISTRER_TYPE.KRAV}>Krav</option>
              <option value={FEILREGISTRER_TYPE.OPPGAVE}>Oppgave</option>
            </Select>
          </HStack>

          <HStack gap="space-12" align="start">
            <VStack style={{ width: '20rem' }} gap="space-2">
              <Textarea
                style={{ height: '25rem' }}
                label="Feilregistrerte saker (en per linje)"
                onChange={(e) => setSakIderText(e.target.value)}
                value={sakIderText}
                name="sakIder"
                minRows={8}
              />

              {visOppgaveFelter && (
                <VStack gap="space-2">
                  <Button
                    type="button"
                    loading={oppgaveFetcher.state === 'submitting'}
                    disabled={oppgaveFetcher.state === 'submitting' || !kanHenteOppgaver}
                    onClick={() => {
                      if (!datoOpprettet) return

                      setLastFetchSnapshot(currentInputsKey)
                      oppgaveFetcher.submit(
                        {
                          _intent: 'hentOppgaver',
                          sakIder: sakIderText,
                          datoOpprettet: toIsoDate(datoOpprettet),
                        },
                        { method: 'post' },
                      )
                    }}
                  >
                    Hent oppgaver
                  </Button>
                </VStack>
              )}
            </VStack>

            {visOppgaveFelter && (
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
                {fetcher.data?.error && <ErrorMessage>{fetcher.data.error}</ErrorMessage>}
              </VStack>
            )}
          </HStack>

          {visOppgaveFelter && oppgaveFetcher.data?.oppgaveError && (
            <ErrorMessage>{oppgaveFetcher.data.oppgaveError}</ErrorMessage>
          )}

          {visOppgaveFelter && oppgaverErUtdatert && oppgavetekster.length > 0 && (
            <Alert variant="warning">
              Sakene eller datoen er endret siden oppgavene ble hentet. Hent oppgaver på nytt.
            </Alert>
          )}

          {visOppgaveFelter && !oppgaverErUtdatert && oppgavetekster.length > 0 && (
            <VStack gap="space-2">
              <Label>Velg oppgavetekst</Label>
              {oppgavetekster.map((oppgaveTekst) => {
                const antallIds = oppgaveteksterMap[oppgaveTekst]?.length ?? 0
                return (
                  <Checkbox
                    key={oppgaveTekst}
                    checked={valgteOppgaver.includes(oppgaveTekst)}
                    onChange={(event) => handleOppgaveValg(oppgaveTekst, event.target.checked)}
                  >
                    {oppgaveTekst} ({antallIds})
                  </Checkbox>
                )
              })}
            </VStack>
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

          {visOppgaveFelter && (
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
              disabled={fetcher.state === 'submitting' || (visOppgaveFelter && oppgaveFetcher.state !== 'idle')}
            >
              Feilregistrer
            </Button>
          </HStack>

          {!visOppgaveFelter && fetcher.data?.error && <ErrorMessage>{fetcher.data.error}</ErrorMessage>}
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
            disabled={fetcher.state === 'submitting'}
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
