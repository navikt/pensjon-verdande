import {
  Alert,
  BodyShort,
  Box,
  Button,
  ErrorSummary,
  Heading,
  HStack,
  Page,
  ToggleGroup,
  VStack,
} from '@navikt/ds-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFetcher, useNavigate } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiPost } from '~/services/api.server'
import type { Route } from './+types/behandling-sok'
import type { TreffResponse } from './api.treff'
import { AntallOverTidChart, type Bucket } from './components/AntallOverTidChart'
import { AntallOverTidDataTabell } from './components/AntallOverTidDataTabell'
import { BehandlingTypePicker } from './components/BehandlingTypePicker'
import { EndringerIkkeKjortBanner } from './components/EndringerIkkeKjortBanner'
import { KjorSokKnapp } from './components/KjorSokKnapp'
import { KopierJsonKnapp } from './components/KopierJsonKnapp'
import { KriteriumListe } from './components/KriteriumListe'
import { LimInnJsonModal, type Snapshot } from './components/LimInnJsonModal'
import { SensitiveVerdierBanner } from './components/SensitiveVerdierBanner'
import { type Treff, TreffTabell } from './components/TreffTabell'
import { type Kriterium, validerKriterier } from './lib/kriterier'
import { buildAntallOverTidRequest, buildTreffRequest } from './lib/request-builder'
import { hentSensitive, lagreSensitive, fjernSensitive as slettSensitiveStore } from './lib/sensitive-state'
import {
  type Aggregering,
  ALLE_AGGREGERINGER,
  ALLE_TIDSDIMENSJONER,
  type CommittedState,
  DEFAULT_STATE,
  deserializeStateFromSearchParams,
  fjernSensitive,
  hashCommittedState,
  plukkSensitive,
  serializeStateToSearchParams,
  type Tidsdimensjon,
  type Visning,
} from './lib/url-state'
import { type BehandlingMetadata, hentBehandlingMetadata, hentBehandlingstyper } from './metadata-cache.server'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Behandlingssøk | Verdande' }]
}

type LoaderResult = {
  typer: string[]
  metadata: BehandlingMetadata | null
  committed: CommittedState
  ukjenteKriterier: { type: string; raw: unknown }[]
  /** True når URL signaliserer at sensitive kriterier hører til søket — server hopper over initialt søk; klient gjør det. */
  harSensitiveISok: boolean
  initialResultat:
    | { kind: 'treff'; data: TreffResponse }
    | { kind: 'antall'; data: { totalAntall: number; buckets: Bucket[] } }
    | null
  feilmelding: string | null
}

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderResult> {
  const url = new URL(request.url)
  const { state, ukjenteKriterier, feil: deserializeFeil } = deserializeStateFromSearchParams(url.searchParams)
  const harSensitiveISok = url.searchParams.get('s') === '1'

  const typer = await hentBehandlingstyper(request)

  let metadata: BehandlingMetadata | null = null
  if (state.behandlingType) {
    try {
      metadata = await hentBehandlingMetadata(state.behandlingType, request)
    } catch (e) {
      const status = (e as { data?: { status?: number } })?.data?.status ?? 500
      if (status === 401 || status === 403) throw e
      metadata = null
    }
  }

  let initialResultat: LoaderResult['initialResultat'] = null
  let feilmelding: string | null = deserializeFeil

  // Hopp over server-side initialt søk hvis sensitive er en del av søket — klient må kombinere med sessionStorage først.
  const skalKjøreServerSøk =
    state.behandlingType &&
    state.ikkeSensitiveKriterier.length > 0 &&
    ukjenteKriterier.length === 0 &&
    !harSensitiveISok

  if (skalKjøreServerSøk && state.behandlingType) {
    try {
      if (state.visning === 'treff') {
        const body = buildTreffRequest(state.behandlingType, state.ikkeSensitiveKriterier, null)
        const res = await apiPost<TreffResponse>('/api/behandling/sok/treff', body, request)
        initialResultat = { kind: 'treff', data: res as TreffResponse }
      } else {
        const body = buildAntallOverTidRequest(
          state.behandlingType,
          state.ikkeSensitiveKriterier,
          state.aggregering,
          state.tidsdimensjon,
        )
        const res = await apiPost<{ totalAntall: number; buckets: Bucket[] }>(
          '/api/behandling/sok/antall-over-tid',
          body,
          request,
        )
        initialResultat = { kind: 'antall', data: res as { totalAntall: number; buckets: Bucket[] } }
      }
    } catch (e) {
      const status = (e as { data?: { status?: number } })?.data?.status ?? 500
      if (status === 401 || status === 403) throw e
      const msg = (e as { data?: { detail?: string; title?: string } })?.data?.detail
      feilmelding = msg ?? 'Søket feilet — sjekk kriteriene.'
    }
  }

  return {
    typer,
    metadata,
    committed: { ...DEFAULT_STATE, ...state },
    ukjenteKriterier,
    harSensitiveISok,
    initialResultat,
    feilmelding,
  }
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="Behandlingssøk feilet" />
}

export default function BehandlingSokPage({ loaderData }: Route.ComponentProps) {
  const { typer, metadata, committed, ukjenteKriterier, harSensitiveISok, initialResultat, feilmelding } = loaderData
  const navigate = useNavigate()
  const fetcher = useFetcher<TreffResponse | { error: string }>()
  const antallFetcher = useFetcher<{ totalAntall: number; buckets: Bucket[] } | { error: string }>()

  const committedHash = useMemo(() => hashCommittedState(committed), [committed])

  // ─── Committed sensitive kriterier (lest fra sessionStorage etter mount) ───
  const [committedSensitive, setCommittedSensitive] = useState<Kriterium[]>([])
  useEffect(() => {
    if (typeof window === 'undefined') return
    setCommittedSensitive(harSensitiveISok ? hentSensitive(committedHash) : [])
  }, [committedHash, harSensitiveISok])

  // Fullstendig committed-kriterieliste (ikke-sensitive fra URL + sensitive fra sessionStorage)
  const committedKriterier = useMemo<Kriterium[]>(
    () => [...committed.ikkeSensitiveKriterier, ...committedSensitive],
    [committed.ikkeSensitiveKriterier, committedSensitive],
  )

  // ─── Draft-state (alt brukeren redigerer) ───
  const [draftBehandlingType, setDraftBehandlingType] = useState<string | null>(committed.behandlingType)
  const [draftKriterier, setDraftKriterier] = useState<Kriterium[]>(committedKriterier)
  const [draftVisning, setDraftVisning] = useState<Visning>(committed.visning)
  const [draftAggregering, setDraftAggregering] = useState<Aggregering>(committed.aggregering)
  const [draftTidsdimensjon, setDraftTidsdimensjon] = useState<Tidsdimensjon>(committed.tidsdimensjon)

  // Når committedSensitive lastes etter mount, oppdater draft hvis brukeren ikke har redigert noe ennå.
  const initialKriterierHashRef = useRef<string>(JSON.stringify(committed.ikkeSensitiveKriterier))
  useEffect(() => {
    if (committedSensitive.length === 0) return
    if (JSON.stringify(draftKriterier) === initialKriterierHashRef.current) {
      setDraftKriterier([...committed.ikkeSensitiveKriterier, ...committedSensitive])
    }
  }, [committedSensitive, committed.ikkeSensitiveKriterier, draftKriterier])

  // ─── Akkumulerte resultater (paginering for treff, eller klient-fetched for sensitive-søk) ───
  const initialTreff = useMemo<Treff[]>(
    () => (initialResultat?.kind === 'treff' ? initialResultat.data.treff : []),
    [initialResultat],
  )
  const initialNesteCursor = useMemo(
    () => (initialResultat?.kind === 'treff' ? initialResultat.data.nesteCursor : null),
    [initialResultat],
  )
  const initialAntall = useMemo<{ totalAntall: number; buckets: Bucket[] }>(
    () => (initialResultat?.kind === 'antall' ? initialResultat.data : { totalAntall: 0, buckets: [] }),
    [initialResultat],
  )

  const [akkumulerteTreff, setAkkumulerteTreff] = useState<Treff[]>(initialTreff)
  const [nesteCursor, setNesteCursor] = useState(initialNesteCursor)
  const [klientAntall, setKlientAntall] = useState(initialAntall)

  // Reset når committed-hash endres (ny URL).
  useEffect(() => {
    setAkkumulerteTreff(initialTreff)
    setNesteCursor(initialNesteCursor)
    setKlientAntall(initialAntall)
  }, [initialAntall, initialNesteCursor, initialTreff])

  // Klient-side initialt søk når sensitive er en del av query (loaderen hoppet over).
  const venterPaInitialSensitiveLoad = useRef(false)
  useEffect(() => {
    if (!harSensitiveISok) return
    if (committedSensitive.length === 0) return // venter på lasting fra sessionStorage
    if (!committed.behandlingType) return
    venterPaInitialSensitiveLoad.current = committed.visning === 'treff'
    if (committed.visning === 'treff') {
      const body = buildTreffRequest(committed.behandlingType, committedKriterier, null)
      fetcher.submit(body as never, {
        method: 'post',
        action: '/behandling-sok/api/treff',
        encType: 'application/json',
      })
    } else {
      const body = buildAntallOverTidRequest(
        committed.behandlingType,
        committedKriterier,
        committed.aggregering,
        committed.tidsdimensjon,
      )
      antallFetcher.submit(body as never, {
        method: 'post',
        action: '/behandling-sok/api/antall',
        encType: 'application/json',
      })
    }
  }, [
    committedSensitive,
    antallFetcher.submit,
    committed.aggregering,
    committed.behandlingType,
    committed.tidsdimensjon,
    committed.visning,
    committedKriterier,
    fetcher.submit,
    harSensitiveISok,
  ])

  // Akkumuler treff fra fetcher
  useEffect(() => {
    if (!fetcher.data) return
    if ('treff' in fetcher.data) {
      const data = fetcher.data
      const erstatt = venterPaInitialSensitiveLoad.current
      venterPaInitialSensitiveLoad.current = false
      setAkkumulerteTreff((prev) => (erstatt ? data.treff : [...prev, ...data.treff]))
      setNesteCursor(data.nesteCursor)
    }
  }, [fetcher.data])

  useEffect(() => {
    if (!antallFetcher.data) return
    if ('buckets' in antallFetcher.data) {
      setKlientAntall(antallFetcher.data)
    }
  }, [antallFetcher.data])

  const validering = useMemo(() => validerKriterier(draftKriterier), [draftKriterier])
  const harUkjenteIUrl = ukjenteKriterier.length > 0
  const kanKjore =
    !validering.manglerTidsfilter && validering.feil.length === 0 && !!draftBehandlingType && !harUkjenteIUrl
  const errorSummaryRef = useRef<HTMLDivElement>(null)

  const kjørSøk = useCallback(() => {
    if (!kanKjore) {
      errorSummaryRef.current?.focus()
      return
    }
    const ikkeSensitive = fjernSensitive(draftKriterier)
    const sensitive = plukkSensitive(draftKriterier)
    const newCommitted: CommittedState = {
      behandlingType: draftBehandlingType,
      ikkeSensitiveKriterier: ikkeSensitive,
      visning: draftVisning,
      aggregering: draftAggregering,
      tidsdimensjon: draftTidsdimensjon,
    }
    const hash = hashCommittedState(newCommitted)
    if (sensitive.length > 0) {
      lagreSensitive(hash, sensitive)
    } else {
      slettSensitiveStore(hash)
    }
    const sp = serializeStateToSearchParams({
      behandlingType: draftBehandlingType,
      kriterier: draftKriterier,
      visning: draftVisning,
      aggregering: draftAggregering,
      tidsdimensjon: draftTidsdimensjon,
    })
    if (sensitive.length > 0) sp.set('s', '1')
    navigate(`/behandling-sok?${sp.toString()}`)
  }, [kanKjore, draftKriterier, draftBehandlingType, draftVisning, draftAggregering, draftTidsdimensjon, navigate])

  const draftHash = useMemo(
    () =>
      hashCommittedState({
        behandlingType: draftBehandlingType,
        ikkeSensitiveKriterier: fjernSensitive(draftKriterier),
        visning: draftVisning,
        aggregering: draftAggregering,
        tidsdimensjon: draftTidsdimensjon,
      }),
    [draftBehandlingType, draftKriterier, draftVisning, draftAggregering, draftTidsdimensjon],
  )
  const draftSensitiveHash = useMemo(() => JSON.stringify(plukkSensitive(draftKriterier)), [draftKriterier])
  const committedSensitiveHash = useMemo(() => JSON.stringify(committedSensitive), [committedSensitive])
  const harUkjørteEndringer = draftHash !== committedHash || draftSensitiveHash !== committedSensitiveHash

  const harSensitive = plukkSensitive(draftKriterier).length > 0

  const lastMer = useCallback(() => {
    if (!nesteCursor || !committed.behandlingType) return
    if (harUkjørteEndringer) return
    const body = buildTreffRequest(committed.behandlingType, committedKriterier, nesteCursor)
    fetcher.submit(body as never, {
      method: 'post',
      action: '/behandling-sok/api/treff',
      encType: 'application/json',
    })
  }, [nesteCursor, committed.behandlingType, committedKriterier, harUkjørteEndringer, fetcher])

  const [limInnOpen, setLimInnOpen] = useState(false)

  // Vise-data: foretrekk klient-resultat når det finnes (sensitive-søk), ellers initial.
  const visTreff = initialResultat?.kind === 'treff' || (harSensitiveISok && committed.visning === 'treff')
  const visAntall = initialResultat?.kind === 'antall' || (harSensitiveISok && committed.visning === 'antall-over-tid')
  const antallData = initialResultat?.kind === 'antall' ? initialResultat.data : klientAntall

  return (
    <Page>
      <Page.Block width="2xl" gutters>
        <VStack gap="space-24">
          <Heading level="1" size="large">
            Behandlingssøk
          </Heading>
          <BodyShort>
            Bygg generiske kriteriebaserte søk mot behandlingsbeholdningen. Velg behandlingstype, legg til kriterier (★
            = tidsfilter, kreves), og velg om du vil se treff eller antall over tid.
          </BodyShort>

          {harUkjenteIUrl && (
            <Alert variant="error">
              URL-en inneholder ukjente kriterietyper: <strong>{ukjenteKriterier.map((u) => u.type).join(', ')}</strong>
              . Søket er blokkert til ukjente kriterier er fjernet fra URL-en. Oppdater Verdande hvis du forventer å
              bruke disse typene, eller fjern <code>?q=</code> fra adressen for å starte på nytt.
            </Alert>
          )}

          {feilmelding && <Alert variant="error">{feilmelding}</Alert>}

          {harSensitive && <SensitiveVerdierBanner />}

          <HStack gap="space-16" align="end" wrap>
            <BehandlingTypePicker typer={typer} valgt={draftBehandlingType} onChange={setDraftBehandlingType} />
            <ToggleGroup
              size="small"
              label="Visning"
              value={draftVisning}
              onChange={(v) => setDraftVisning(v as Visning)}
            >
              <ToggleGroup.Item value="treff">Treff (tabell)</ToggleGroup.Item>
              <ToggleGroup.Item value="antall-over-tid">Antall over tid</ToggleGroup.Item>
            </ToggleGroup>
            {draftVisning === 'antall-over-tid' && (
              <>
                <ToggleGroup
                  size="small"
                  label="Aggregering"
                  value={draftAggregering}
                  onChange={(v) => setDraftAggregering(v as Aggregering)}
                >
                  {ALLE_AGGREGERINGER.map((a) => (
                    <ToggleGroup.Item key={a} value={a}>
                      {a}
                    </ToggleGroup.Item>
                  ))}
                </ToggleGroup>
                <ToggleGroup
                  size="small"
                  label="Tidsdimensjon"
                  value={draftTidsdimensjon}
                  onChange={(v) => setDraftTidsdimensjon(v as Tidsdimensjon)}
                >
                  {ALLE_TIDSDIMENSJONER.map((t) => (
                    <ToggleGroup.Item key={t} value={t}>
                      {t}
                    </ToggleGroup.Item>
                  ))}
                </ToggleGroup>
              </>
            )}
          </HStack>

          <KriteriumListe
            kriterier={draftKriterier}
            metadata={metadata}
            feil={validering.feil}
            onChange={setDraftKriterier}
          />

          {validering.manglerTidsfilter && draftKriterier.length > 0 && (
            <Alert variant="warning" size="small">
              Minst ett tids-kriterium (★) kreves.
            </Alert>
          )}

          {validering.feil.length > 0 && (
            <ErrorSummary ref={errorSummaryRef} heading="Det er feil i ett eller flere kriterier:">
              {validering.feil.map((f, i) => (
                <ErrorSummary.Item key={`${f.kriterieIndeks}-${f.felt}-${i}`} href={`#kriterium-${f.kriterieIndeks}`}>
                  Kriterium #{f.kriterieIndeks + 1}: {f.melding}
                </ErrorSummary.Item>
              ))}
            </ErrorSummary>
          )}

          {harUkjørteEndringer && <EndringerIkkeKjortBanner />}

          <HStack gap="space-12" align="center" wrap>
            <KjorSokKnapp invalid={!kanKjore} onClick={kjørSøk} />
            <KopierJsonKnapp
              snapshot={{
                schemaVersion: '1',
                behandlingType: draftBehandlingType,
                visning: draftVisning,
                aggregering: draftAggregering,
                tidsdimensjon: draftTidsdimensjon,
                kriterier: draftKriterier,
              }}
            />
            <Button size="small" variant="tertiary" onClick={() => setLimInnOpen(true)}>
              Lim inn JSON
            </Button>
          </HStack>

          <LimInnJsonModal
            open={limInnOpen}
            onClose={() => setLimInnOpen(false)}
            onApply={(snap: Snapshot) => {
              if (snap.behandlingType !== undefined) setDraftBehandlingType(snap.behandlingType)
              if (snap.visning) setDraftVisning(snap.visning)
              if (snap.aggregering) setDraftAggregering(snap.aggregering)
              if (snap.tidsdimensjon) setDraftTidsdimensjon(snap.tidsdimensjon)
              setDraftKriterier(snap.kriterier)
            }}
          />

          <Box aria-live="polite">
            {visTreff && (
              <TreffTabell
                treff={akkumulerteTreff}
                totalAntallVist={akkumulerteTreff.length}
                nesteCursor={nesteCursor}
                isLoadingMore={fetcher.state !== 'idle'}
                paginringDisabledFordiUkjorteEndringer={harUkjørteEndringer}
                onLastMer={lastMer}
              />
            )}
            {visAntall && (
              <VStack gap="space-12">
                <BodyShort>Totalt antall: {antallData.totalAntall.toLocaleString('nb-NO')}</BodyShort>
                <AntallOverTidChart
                  buckets={antallData.buckets}
                  aggregering={committed.aggregering}
                  tidsdimensjon={committed.tidsdimensjon}
                />
                <details>
                  <summary>Vis som tabell</summary>
                  <AntallOverTidDataTabell buckets={antallData.buckets} aggregering={committed.aggregering} />
                </details>
              </VStack>
            )}
          </Box>
        </VStack>
      </Page.Block>
    </Page>
  )
}
