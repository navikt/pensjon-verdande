import {
  Alert,
  BodyShort,
  Button,
  Checkbox,
  CheckboxGroup,
  Heading,
  HStack,
  Loader,
  Modal,
  Select,
  Table,
  Tabs,
  TextField,
  VStack,
} from '@navikt/ds-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { useFetcher } from 'react-router'
import { apiGetOrUndefined, apiPost } from '~/services/api.server'
import type { Route } from './+types/leveattest-kontroll'
import KjoringerPreview, { type BubbleItem } from './kjoringer-preview'
import 'chart.js/auto'

type StartGrunnlagResponse = { behandlingId: number }
type StartSokResponse = { sokBehandlingId: number }
type StartKontrollActionResponse = { ok: true }

type ModusActionResponse = { ok: true; type: 'PURR' | 'OPPGAVE' }

type BehandlingStatus = string

type LeveattestGrunnlagResultat = {
  grunnlagBehandlingId: number
  status: BehandlingStatus
  antallSPKPersoner?: number | null
  kjoredatoGrunnlag?: string | null
  behandlingSistKjort?: string | null
}

type LeveattestSokResultat = {
  grunnlagBehandlingId: number
  status: string
  sokBehandlingId: number
  sokPaaLand: string[]
  alder: number
  filtrerPaSakstypeUfore: boolean
  antallPersonerTilKontroll: number
  behandlingSistKjort: string
}

type LeveattestStartKontrollResponse = {
  sokBehandlingId: number
  status: string
  behandlingSistKjort: string
}

type PollResponse =
  | { status: 'KJØRER' }
  | { status: 'FERDIG'; resultat: LeveattestGrunnlagResultat }
  | { status: 'IKKE_FUNNET' }

type SokPollResponse = {
  grunnlagBehandlingId: number
  sok: LeveattestSokResultat[]
}

type StartKontrollPollResponse = {
  startkontroller: LeveattestStartKontrollResponse[]
}

type LeveattestKontrollStatistikk = {
  antallOpprettet: number
  antallUnderBehandling: number
  antallFullfort: number
  antallFeil: number
}

type LoaderData = {
  latestGrunnlag: LeveattestGrunnlagResultat | null
  sok: LeveattestSokResultat[]
  startkontroller: LeveattestStartKontrollResponse[]
}

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Leveattestkontroll | Verdande' }]
}

const FERDIG_STATUSER: ReadonlySet<string> = new Set(['FULLFORT', 'STOPPET', 'STOPPET_VENTER_BEKREFTELSE'])
const TERMINAL_STATUSER: ReadonlySet<string> = new Set([...Array.from(FERDIG_STATUSER), 'FEILENDE'])
const KJORENDE_STATUSER: ReadonlySet<string> = new Set(['OPPRETTET', 'UNDER_BEHANDLING'])

function isFerdig(status: string) {
  return FERDIG_STATUSER.has(status)
}

function isTerminal(status: string) {
  return TERMINAL_STATUSER.has(status)
}

function isKjorende(status: string) {
  return KJORENDE_STATUSER.has(status)
}

function todayYmd(): string {
  return new Date().toISOString().slice(0, 10)
}

function toYmd(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const s = value.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  return null
}

function formatIsoDateTimeNo(value: unknown): string | null {
  if (typeof value !== 'string' || value.length < 10) return null
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return null
  return new Intl.DateTimeFormat('no-NO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dt)
}

function formatIsoTimeNo(value: unknown): string | null {
  if (typeof value !== 'string' || value.length < 10) return null
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return null
  return new Intl.DateTimeFormat('no-NO', { hour: '2-digit', minute: '2-digit' }).format(dt)
}

const BOSTEDLAND_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'AUS', label: 'Australia (AU)' },
  { value: 'AUT', label: 'Østerrike (AT)' },
  { value: 'BEL', label: 'Belgia (BE)' },
  { value: 'BGR', label: 'Bulgaria (BG)' },
  { value: 'CAN', label: 'Canada (CA)' },
  { value: 'CHE', label: 'Sveits (CH)' },
  { value: 'CHL', label: 'Chile (CL)' },
  { value: 'CYP', label: 'Kypros (CY)' },
  { value: 'CZE', label: 'Den Tsjekkiske Rep. (CZ)' },
  { value: 'DEU', label: 'Tyskland (DE)' },
  { value: 'ESP', label: 'Spania (ES)' },
  { value: 'EST', label: 'Estland (EE)' },
  { value: 'FRA', label: 'Frankrike (FR)' },
  { value: 'FRO', label: 'Færøyene (FO)' },
  { value: 'GBR', label: 'Storbritannia (GB)' },
  { value: 'GLP', label: 'Frankrike Guadeloupe (GP)' },
  { value: 'GRC', label: 'Hellas (GR)' },
  { value: 'GRL', label: 'Grønland (GL)' },
  { value: 'GUF', label: 'Frankrike Fransk Guyana (GF)' },
  { value: 'HRV', label: 'Kroatia (HR)' },
  { value: 'HUN', label: 'Ungarn (HU)' },
  { value: 'IMN', label: 'Storbritannia Isle Of Man (IM)' },
  { value: 'IND', label: 'India (IN)' },
  { value: 'IRL', label: 'Irland (IE)' },
  { value: 'ISL', label: 'Island (IS)' },
  { value: 'ISR', label: 'Israel (IL)' },
  { value: 'ITA', label: 'Italia (IT)' },
  { value: 'JEY', label: 'Storbritannia Jersey (JE)' },
  { value: 'KOR', label: 'Sør-Korea (KR)' },
  { value: 'LIE', label: 'Liechtenstein (LI)' },
  { value: 'LTU', label: 'Litauen (LT)' },
  { value: 'LUX', label: 'Luxembourg (LU)' },
  { value: 'LVA', label: 'Latvia (LV)' },
  { value: 'MLT', label: 'Malta (MT)' },
  { value: 'MTQ', label: 'Frankrike Martinique (MQ)' },
  { value: 'NLD', label: 'Nederland (NL)' },
  { value: 'POL', label: 'Polen (PL)' },
  { value: 'PRT', label: 'Portugal (PT)' },
  { value: 'QEB', label: 'Quebec (QB)' },
  { value: 'REU', label: 'Frankrike Reunion (RE)' },
  { value: 'ROU', label: 'Romania (RO)' },
  { value: 'SVK', label: 'Slovakia (SK)' },
  { value: 'SVN', label: 'Slovenia (SI)' },
  { value: 'THA', label: 'Thailand (THA)' },
  { value: 'USA', label: 'USA (US)' },
]

function labelForLand(code: string) {
  return BOSTEDLAND_OPTIONS.find((o) => o.value === code)?.label ?? `${code} (ukjent)`
}

function sokStatusToBubbleStatus(status: string): BubbleItem['status'] {
  if (isKjorende(status)) return 'KJØRER'
  if (isTerminal(status) && !isFerdig(status)) return 'FEILET'
  if (isFerdig(status)) return 'FERDIG'
  return 'OPPRETTET'
}

function startKontrollStatusToBubbleStatus(status: string): BubbleItem['status'] {
  if (isKjorende(status)) return 'KJØRER'
  if (isTerminal(status) && !isFerdig(status)) return 'FEILET'
  if (isFerdig(status)) return 'FERDIG'
  return 'OPPRETTET'
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)

  if (url.searchParams.get('poll') === 'grunnlag') {
    const resultat = await apiGetOrUndefined<LeveattestGrunnlagResultat>('/api/behandling/leveattest/grunnlag', request)

    if (!resultat) return { status: 'IKKE_FUNNET' } satisfies PollResponse
    if (isFerdig(resultat.status)) return { status: 'FERDIG', resultat } satisfies PollResponse
    return { status: 'KJØRER' } satisfies PollResponse
  }

  if (url.searchParams.get('poll') === 'sok') {
    const grunnlagIdStr = url.searchParams.get('grunnlagId')
    if (!grunnlagIdStr) throw new Response('Missing grunnlagId', { status: 400 })

    const grunnlagId = Number(grunnlagIdStr)
    if (!Number.isFinite(grunnlagId) || grunnlagId <= 0) throw new Response('Invalid grunnlagId', { status: 400 })

    const sok =
      (await apiGetOrUndefined<LeveattestSokResultat[]>(`/api/behandling/leveattest/${grunnlagId}`, request)) ?? []

    return { grunnlagBehandlingId: grunnlagId, sok } satisfies SokPollResponse
  }

  if (url.searchParams.get('poll') === 'startkontroll') {
    const startkontroller =
      (await apiGetOrUndefined<LeveattestStartKontrollResponse[]>(
        '/api/behandling/leveattest/startkontroll',
        request,
      )) ?? []

    return { startkontroller } satisfies StartKontrollPollResponse
  }

  if (url.searchParams.get('poll') === 'statistikk') {
    const grunnlagIdStr = url.searchParams.get('grunnlagId')
    if (!grunnlagIdStr) throw new Response('Missing grunnlagId', { status: 400 })

    const grunnlagId = Number(grunnlagIdStr)
    if (!Number.isFinite(grunnlagId) || grunnlagId <= 0) throw new Response('Invalid grunnlagId', { status: 400 })

    const statistikk = await apiGetOrUndefined<LeveattestKontrollStatistikk>(
      `/api/behandling/leveattest/startkontroll/${grunnlagId}/statistikk`,
      request,
    )

    return { grunnlagId, statistikk: statistikk ?? null }
  }

  const latestGrunnlag = await apiGetOrUndefined<LeveattestGrunnlagResultat>(
    '/api/behandling/leveattest/grunnlag',
    request,
  )

  const sok = latestGrunnlag
    ? ((await apiGetOrUndefined<LeveattestSokResultat[]>(
        `/api/behandling/leveattest/${latestGrunnlag.grunnlagBehandlingId}`,
        request,
      )) ?? [])
    : []

  const startkontroller =
    (await apiGetOrUndefined<LeveattestStartKontrollResponse[]>('/api/behandling/leveattest/startkontroll', request)) ??
    []

  return {
    latestGrunnlag: latestGrunnlag ?? null,
    sok,
    startkontroller,
  } satisfies LoaderData
}

export async function action({ request }: Route.ActionArgs) {
  const fd = await request.formData()
  const intent = String(fd.get('_intent') ?? '')

  if (intent === 'hentGrunnlag') {
    const behandlingId = await apiPost<number>('/api/behandling/leveattest/grunnlag', {}, request)
    if (typeof behandlingId !== 'number') throw new Response('Missing behandlingId', { status: 500 })
    return { behandlingId } satisfies StartGrunnlagResponse
  }

  if (intent === 'kjorSok') {
    const grunnlagBehandlingId = Number(fd.get('grunnlagBehandlingId'))
    if (!Number.isFinite(grunnlagBehandlingId) || grunnlagBehandlingId <= 0) {
      throw new Response('Invalid grunnlagBehandlingId', { status: 400 })
    }

    const alderRaw = String(fd.get('alder') ?? '')
    const alder = Number(alderRaw)
    if (!Number.isFinite(alder) || alder < 0 || alder > 120) {
      throw new Response('Ugyldig minstealder', { status: 400 })
    }

    const filtrerPaSakstypeUfore = String(fd.get('filtrerPaSakstypeUfore') ?? 'false') === 'true'
    const sokPaaLand = fd
      .getAll('sokPaaLand')
      .map((v) => String(v))
      .filter(Boolean)
    if (sokPaaLand.length === 0) throw new Response('Mangler sokPaaLand', { status: 400 })

    const sokBehandlingId = await apiPost<number>(
      '/api/behandling/leveattest/sok',
      { grunnlagBehandlingId, alder, sokPaaLand, filtrerPaSakstypeUfore },
      request,
    )

    if (typeof sokBehandlingId !== 'number') throw new Response('Missing sokBehandlingId', { status: 500 })
    return { sokBehandlingId } satisfies StartSokResponse
  }

  if (intent === 'startKontroll') {
    const sokBehandlingId = fd
      .getAll('valgteSok')
      .map((v) => Number(v))
      .filter((n) => Number.isFinite(n))
    if (sokBehandlingId.length === 0) throw new Response('Ingen søk valgt', { status: 400 })

    await apiPost<void>('/api/behandling/leveattest/startkontroll', { sokBehandlingId }, request)
    return { ok: true } satisfies StartKontrollActionResponse
  }

  if (intent === 'settPurreModus') {
    const grunnlagId = Number(fd.get('grunnlagId'))
    if (!Number.isFinite(grunnlagId) || grunnlagId <= 0) throw new Response('Invalid grunnlagId', { status: 400 })
    await apiPost<void>(`/api/behandling/leveattest/kontroll/${grunnlagId}/settpurremodus`, {}, request)
    return { ok: true, type: 'PURR' } satisfies ModusActionResponse
  }

  if (intent === 'settOppgaveModus') {
    const grunnlagId = Number(fd.get('grunnlagId'))
    if (!Number.isFinite(grunnlagId) || grunnlagId <= 0) throw new Response('Invalid grunnlagId', { status: 400 })
    await apiPost<void>(`/api/behandling/leveattest/kontroll/${grunnlagId}/settoppgavemodus`, {}, request)
    return { ok: true, type: 'OPPGAVE' } satisfies ModusActionResponse
  }
  return null
}

export default function LeveattestKontrollStartside({ loaderData }: Route.ComponentProps) {
  const { latestGrunnlag, sok: initialSok, startkontroller: initialStartkontroller } = loaderData

  const startFetcher = useFetcher<StartGrunnlagResponse>()
  const pollFetcher = useFetcher<PollResponse>()
  const sokStartFetcher = useFetcher<StartSokResponse>()
  const sokListFetcher = useFetcher<SokPollResponse>()
  const startKontrollFetcher = useFetcher<StartKontrollActionResponse>()
  const startKontrollListFetcher = useFetcher<StartKontrollPollResponse>()
  const statistikkFetcher = useFetcher<{ grunnlagId: number; statistikk: LeveattestKontrollStatistikk | null }>()
  const purreFetcher = useFetcher<ModusActionResponse>()
  const oppgaveFetcher = useFetcher<ModusActionResponse>()

  const [grunnlagBehandlingId, setGrunnlagBehandlingId] = useState<number | null>(null)
  const [grunnlagStatus, setGrunnlagStatus] = useState<'IDLE' | 'KJØRER' | 'FERDIG'>('IDLE')
  const [grunnlagResultat, setGrunnlagResultat] = useState<LeveattestGrunnlagResultat | null>(null)

  const [sokListe, setSokListe] = useState<LeveattestSokResultat[]>(initialSok ?? [])
  const [startkontroller, setStartkontroller] = useState<LeveattestStartKontrollResponse[]>(
    initialStartkontroller ?? [],
  )

  const [statistikk, setStatistikk] = useState<LeveattestKontrollStatistikk | null>(null)

  const [modusStatus, setModusStatus] = useState<ModusActionResponse['type'] | null>(null)
  const autoStatistikkLastetRef = useRef(false)

  const [aktivFane, setAktivFane] = useState<'kontroll' | 'statistikk'>('kontroll')

  const [openPurrDialog, setOpenPurrDialog] = useState(false)
  const [openOppgaveDialog, setOpenOppgaveDialog] = useState(false)

  const pollTimerRef = useRef<number | null>(null)
  const sokPollTimerRef = useRef<number | null>(null)
  const sokBackgroundPollRef = useRef<number | null>(null)
  const startKontrollPollRef = useRef<number | null>(null)
  const initializedRef = useRef(false)

  const [valgteSokIds, setValgteSokIds] = useState<number[]>([])

  const valgtGrunnlagId = useMemo(
    () => grunnlagBehandlingId ?? grunnlagResultat?.grunnlagBehandlingId ?? null,
    [grunnlagBehandlingId, grunnlagResultat?.grunnlagBehandlingId],
  )

  const stoppInterval = useCallback((ref: React.MutableRefObject<number | null>) => {
    if (ref.current != null) {
      window.clearInterval(ref.current)
      ref.current = null
    }
  }, [])

  const pollGrunnlag = useCallback(() => {
    pollFetcher.load('?poll=grunnlag')
  }, [pollFetcher])

  const pollSokListe = useCallback(
    (grunnlagId: number) => {
      sokListFetcher.load(`?poll=sok&grunnlagId=${grunnlagId}`)
    },
    [sokListFetcher],
  )

  const pollStartKontroller = useCallback(() => {
    startKontrollListFetcher.load('?poll=startkontroll')
  }, [startKontrollListFetcher])

  const pollStatistikk = useCallback(
    (grunnlagId: number) => {
      statistikkFetcher.load(`?poll=statistikk&grunnlagId=${grunnlagId}`)
    },
    [statistikkFetcher],
  )

  const sendtTilKontrollSet = useMemo(() => new Set(startkontroller.map((k) => k.sokBehandlingId)), [startkontroller])

  useEffect(() => {
    setValgteSokIds((prev) => prev.filter((id) => !sendtTilKontrollSet.has(id)))
  }, [sendtTilKontrollSet])

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    setStartkontroller(initialStartkontroller ?? [])

    if (!latestGrunnlag) {
      setGrunnlagStatus('IDLE')
      setSokListe([])
      return
    }

    setGrunnlagBehandlingId(latestGrunnlag.grunnlagBehandlingId)
    setGrunnlagResultat(latestGrunnlag)
    setSokListe(initialSok ?? [])

    if (isFerdig(latestGrunnlag.status)) {
      setGrunnlagStatus('FERDIG')
      stoppInterval(pollTimerRef)
      return
    }

    setGrunnlagStatus('KJØRER')
    pollGrunnlag()
    stoppInterval(pollTimerRef)
    pollTimerRef.current = window.setInterval(pollGrunnlag, 10_000)
    return () => stoppInterval(pollTimerRef)
  }, [latestGrunnlag, initialSok, initialStartkontroller, pollGrunnlag, stoppInterval])

  useEffect(() => {
    const behandlingId = startFetcher.data?.behandlingId
    if (!behandlingId) return

    setGrunnlagBehandlingId(behandlingId)
    setGrunnlagStatus('KJØRER')
    setGrunnlagResultat({
      grunnlagBehandlingId: behandlingId,
      status: 'UNDER_BEHANDLING',
      antallSPKPersoner: null,
      kjoredatoGrunnlag: null,
      behandlingSistKjort: null,
    })

    pollGrunnlag()
    stoppInterval(pollTimerRef)
    pollTimerRef.current = window.setInterval(pollGrunnlag, 10_000)
    return () => stoppInterval(pollTimerRef)
  }, [startFetcher.data?.behandlingId, pollGrunnlag, stoppInterval])

  useEffect(() => {
    const data = pollFetcher.data
    if (!data) return

    if (data.status === 'IKKE_FUNNET') {
      setGrunnlagStatus('IDLE')
      return
    }

    if (data.status === 'KJØRER') {
      setGrunnlagStatus('KJØRER')
      return
    }

    if (data.status === 'FERDIG') {
      setGrunnlagStatus('FERDIG')
      setGrunnlagResultat(data.resultat)
      setGrunnlagBehandlingId(data.resultat.grunnlagBehandlingId)
      stoppInterval(pollTimerRef)
      pollSokListe(data.resultat.grunnlagBehandlingId)
    }
  }, [pollFetcher.data, pollSokListe, stoppInterval])

  useEffect(() => {
    if (!sokListFetcher.data) return
    setSokListe(sokListFetcher.data.sok ?? [])
  }, [sokListFetcher.data])

  useEffect(() => {
    const grunnlagId = grunnlagBehandlingId ?? grunnlagResultat?.grunnlagBehandlingId ?? null
    if (!grunnlagId || grunnlagStatus !== 'FERDIG') return

    const hasNonTerminal = sokListe.some((s) => !isTerminal(s.status))
    if (!hasNonTerminal) {
      stoppInterval(sokBackgroundPollRef)
      return
    }

    if (sokBackgroundPollRef.current != null) return
    sokBackgroundPollRef.current = window.setInterval(() => pollSokListe(grunnlagId), 10_000)
    return () => stoppInterval(sokBackgroundPollRef)
  }, [grunnlagBehandlingId, grunnlagResultat, grunnlagStatus, sokListe, pollSokListe, stoppInterval])

  useEffect(() => {
    const grunnlagId = grunnlagBehandlingId ?? grunnlagResultat?.grunnlagBehandlingId ?? null
    const sokId = sokStartFetcher.data?.sokBehandlingId
    if (!grunnlagId || !sokId) return

    pollSokListe(grunnlagId)
    stoppInterval(sokPollTimerRef)

    const startedAt = Date.now()
    sokPollTimerRef.current = window.setInterval(() => {
      pollSokListe(grunnlagId)
      if (Date.now() - startedAt > 60_000) stoppInterval(sokPollTimerRef)
    }, 5_000)

    return () => stoppInterval(sokPollTimerRef)
  }, [sokStartFetcher.data?.sokBehandlingId, grunnlagBehandlingId, grunnlagResultat, pollSokListe, stoppInterval])

  useEffect(() => {
    if (!startKontrollListFetcher.data) return
    setStartkontroller(startKontrollListFetcher.data.startkontroller ?? [])
  }, [startKontrollListFetcher.data])

  useEffect(() => {
    const data = statistikkFetcher.data
    if (!data) return
    if (data.grunnlagId !== valgtGrunnlagId) return
    setStatistikk(data.statistikk ?? null)
  }, [statistikkFetcher.data, valgtGrunnlagId])

  useEffect(() => {
    const d = purreFetcher.data
    if (!d) return
    setModusStatus(d.type)
  }, [purreFetcher.data])

  useEffect(() => {
    const d = oppgaveFetcher.data
    if (!d) return
    setModusStatus(d.type)
  }, [oppgaveFetcher.data])

  useEffect(() => {
    if (startKontrollFetcher.state !== 'idle') return
    if (!startKontrollFetcher.data?.ok) return

    pollStartKontroller()
    stoppInterval(startKontrollPollRef)

    const startedAt = Date.now()
    startKontrollPollRef.current = window.setInterval(() => {
      pollStartKontroller()
      if (Date.now() - startedAt > 60_000) stoppInterval(startKontrollPollRef)
    }, 5_000)

    return () => stoppInterval(startKontrollPollRef)
  }, [startKontrollFetcher.state, startKontrollFetcher.data, pollStartKontroller, stoppInterval])

  useEffect(() => {
    const hasNonTerminal = startkontroller.some((k) => !isTerminal(k.status))
    if (!hasNonTerminal) {
      stoppInterval(startKontrollPollRef)
      return
    }

    if (startKontrollPollRef.current != null) return
    startKontrollPollRef.current = window.setInterval(() => pollStartKontroller(), 10_000)
    return () => stoppInterval(startKontrollPollRef)
  }, [startkontroller, pollStartKontroller, stoppInterval])
  const disableStart = grunnlagStatus === 'KJØRER'
  const disableSok = !valgtGrunnlagId || grunnlagStatus !== 'FERDIG'
  const disableModus = disableSok || purreFetcher.state !== 'idle' || oppgaveFetcher.state !== 'idle'
  useEffect(() => {
    void valgtGrunnlagId
    autoStatistikkLastetRef.current = false
    setStatistikk(null)
  }, [valgtGrunnlagId])

  useEffect(() => {
    if (!valgtGrunnlagId) return
    if (grunnlagStatus !== 'FERDIG') return
    if (autoStatistikkLastetRef.current) return
    autoStatistikkLastetRef.current = true
    pollStatistikk(valgtGrunnlagId)
  }, [valgtGrunnlagId, grunnlagStatus, pollStatistikk])

  const [minstAlder, setMinstAlder] = useState<string>('67')
  const [kunUfore, setKunUfore] = useState<boolean>(false)
  const [sokPaaLand, setSokPaaLand] = useState<string[]>(['USA'])
  const [landQuery, setLandQuery] = useState<string>('')

  const normalizeCode = (raw: string) => raw.trim().toUpperCase()

  const canAddFromQuery = (() => {
    const c = normalizeCode(landQuery)
    return /^[A-Z]{3}$/.test(c) && !sokPaaLand.includes(c)
  })()

  function addFromQuery() {
    const c = normalizeCode(landQuery)
    if (!/^[A-Z]{3}$/.test(c)) return
    setSokPaaLand((prev) => (prev.includes(c) ? prev : [c, ...prev]))
    setLandQuery('')
  }

  const allLandOptions = useMemo(() => {
    const existing = new Set(BOSTEDLAND_OPTIONS.map((o) => o.value))
    const custom = sokPaaLand.filter((c) => !existing.has(c)).map((c) => ({ value: c, label: `${c} (ukjent)` }))
    return [...custom, ...BOSTEDLAND_OPTIONS]
  }, [sokPaaLand])

  const visibleLandOptions = useMemo(() => {
    const q = landQuery.trim().toLowerCase()
    const selected = new Set(sokPaaLand)

    const matchesQuery = (o: { value: string; label: string }) => {
      if (!q) return true
      const hay = `${o.value} ${o.label}`.toLowerCase()
      return hay.includes(q)
    }

    const selectedOptions = allLandOptions
      .filter((o) => selected.has(o.value))
      .slice()
      .sort((a, b) => a.label.localeCompare(b.label, 'no-NO'))

    const unselectedOptions = allLandOptions
      .filter((o) => !selected.has(o.value))
      .filter(matchesQuery)
      .slice()
      .sort((a, b) => a.label.localeCompare(b.label, 'no-NO'))

    return [...selectedOptions, ...unselectedOptions]
  }, [allLandOptions, landQuery, sokPaaLand])

  const selectedLandLabel = useMemo(() => {
    if (sokPaaLand.length === 0) return 'Ingen land valgt'
    return sokPaaLand.map(labelForLand).join(', ')
  }, [sokPaaLand])

  function toggleSokSelection(sokId: number) {
    setValgteSokIds((prev) => (prev.includes(sokId) ? prev.filter((x) => x !== sokId) : [...prev, sokId]))
  }

  const grunnlagItems: BubbleItem[] = useMemo(() => {
    const id = valgtGrunnlagId
    if (!id) return []

    const grunnlagsdato = toYmd(grunnlagResultat?.kjoredatoGrunnlag)
    const sistKjort = formatIsoDateTimeNo(grunnlagResultat?.behandlingSistKjort)

    const ymd = grunnlagsdato ?? todayYmd()
    const tagText = grunnlagsdato ? `Grunnlag: ${grunnlagsdato}` : `BehandlingId: ${id}`
    const description = sistKjort ? `Kjørt: ${sistKjort}` : 'Grunnlag'
    const antall = grunnlagResultat?.antallSPKPersoner ?? 0

    return [
      {
        id: String(id),
        yearMonthDay: ymd,
        time: undefined,
        status: grunnlagStatus === 'KJØRER' ? 'KJØRER' : 'FERDIG',
        antallPersoner: antall,
        description,
        tagText,
        tagColorKey: 'GRUNNLAG',
        selected: true,
      },
    ]
  }, [valgtGrunnlagId, grunnlagResultat, grunnlagStatus])

  const sokItems: BubbleItem[] = useMemo(() => {
    const selectedSet = new Set(valgteSokIds)

    return sokListe
      .slice()
      .sort((a, b) => b.sokBehandlingId - a.sokBehandlingId)
      .map((s) => {
        const ymd = toYmd(s.behandlingSistKjort) ?? todayYmd()
        const time = formatIsoTimeNo(s.behandlingSistKjort) ?? undefined

        const landLabel =
          s.sokPaaLand.length <= 3
            ? s.sokPaaLand.map(labelForLand).join(', ')
            : `${s.sokPaaLand.length} land (${s.sokPaaLand.slice(0, 3).join(', ')}, …)`

        const sendt = sendtTilKontrollSet.has(s.sokBehandlingId)

        const baseTag = `SøkId: ${s.sokBehandlingId} · ${landLabel} · ${s.alder}+${s.filtrerPaSakstypeUfore ? ' · Kun uføre' : ''}`
        const tagText = sendt ? `${baseTag} · SENDT` : baseTag

        const selectable = isFerdig(s.status) && !sendt
        const isSelected = selectedSet.has(s.sokBehandlingId)

        const description = sendt
          ? `Søk · ${s.status} · Sendt til kontroll`
          : selectable
            ? `Søk · ${s.status}`
            : `Søk · ${s.status} (ikke klar)`

        return {
          id: String(s.sokBehandlingId),
          yearMonthDay: ymd,
          time,
          status: sokStatusToBubbleStatus(s.status),
          antallPersoner: s.antallPersonerTilKontroll,
          description,
          tagText,
          tagColorKey: `SOK:${String(s.sokBehandlingId)}`,
          selected: selectable ? isSelected : false,
        }
      })
  }, [sokListe, valgteSokIds, sendtTilKontrollSet])

  const startKontrollItems: BubbleItem[] = useMemo(() => {
    return startkontroller
      .slice()
      .sort((a, b) => b.sokBehandlingId - a.sokBehandlingId)
      .map((k) => {
        const ymd = toYmd(k.behandlingSistKjort) ?? todayYmd()
        const time = formatIsoTimeNo(k.behandlingSistKjort) ?? undefined

        return {
          id: String(k.sokBehandlingId),
          yearMonthDay: ymd,
          time,
          status: startKontrollStatusToBubbleStatus(k.status),
          description: `Startkontroll · ${k.status}`,
          tagText: `SøkId: ${k.sokBehandlingId}`,
          tagColorKey: `STARTKONTROLL:${String(k.sokBehandlingId)}`,
          selected: false,
        }
      })
  }, [startkontroller])

  const disableStartKontroll = valgteSokIds.length === 0

  const statistikkChartData = useMemo(() => {
    if (!statistikk) return null
    return {
      labels: ['Opprettet', 'Under behandling', 'Fullført', 'Feil'],
      datasets: [
        {
          label: 'Antall',
          data: [
            statistikk.antallOpprettet,
            statistikk.antallUnderBehandling,
            statistikk.antallFullfort,
            statistikk.antallFeil,
          ],
        },
      ],
    }
  }, [statistikk])

  return (
    <VStack gap="space-24" style={{ padding: '1rem' }}>
      <Heading size="large" level="1">
        Opprett leveattestkontroll
      </Heading>

      <Tabs value={aktivFane} onChange={(v) => setAktivFane(v as 'kontroll' | 'statistikk')}>
        <Tabs.List>
          <Tabs.Tab value="kontroll" label="Kontroll" />
          <Tabs.Tab value="statistikk" label="Statistikk" />
        </Tabs.List>

        <Tabs.Panel value="kontroll" style={{ marginTop: '1rem' }}>
          <VStack gap="space-24">
            <VStack gap="space-12">
              <Heading size="medium" level="2">
                Steg 1: Hent grunnlag
              </Heading>

              <HStack gap="space-12" align="end">
                <startFetcher.Form method="post">
                  <input type="hidden" name="_intent" value="hentGrunnlag" />
                  <Button type="submit" loading={startFetcher.state !== 'idle'} disabled={disableStart}>
                    Hent grunnlag
                  </Button>
                </startFetcher.Form>

                {grunnlagStatus === 'KJØRER' && <div style={{ opacity: 0.85 }}>Kjører…</div>}

                {grunnlagStatus === 'FERDIG' && grunnlagResultat && (
                  <div style={{ opacity: 0.9 }}>
                    Ferdig: <strong>{grunnlagResultat.antallSPKPersoner ?? 0}</strong> personer
                  </div>
                )}
              </HStack>

              <KjoringerPreview title="Grunnlagkjøring" items={grunnlagItems} emptyText="Ingen grunnlag funnet ennå." />
            </VStack>

            <VStack gap="space-12">
              <Heading size="medium" level="2">
                Steg 2: Kjør søk
              </Heading>

              <HStack gap="space-12" wrap align="end">
                <TextField
                  label="Minstealder"
                  value={minstAlder}
                  onChange={(e) => setMinstAlder(e.target.value)}
                  type="number"
                  min={0}
                  max={120}
                  inputMode="numeric"
                  disabled={disableSok}
                />

                <Checkbox checked={kunUfore} onChange={(e) => setKunUfore(e.target.checked)} disabled={disableSok}>
                  Kun uføre
                </Checkbox>

                <Select
                  label="Velg land-sett"
                  value={sokPaaLand.length > 0 ? 'valgt' : 'tom'}
                  onChange={(e) => {
                    const v = e.target.value
                    if (v === 'eu')
                      setSokPaaLand(['DEU', 'FRA', 'ESP', 'PRT', 'ITA', 'NLD', 'BEL', 'AUT', 'CHE', 'IRL'])
                    else if (v === 'na') setSokPaaLand(['USA', 'CAN'])
                    else if (v === 'asia') setSokPaaLand(['THA', 'IND', 'KOR'])
                    else if (v === 'reset') setSokPaaLand(['USA'])
                  }}
                  disabled={disableSok}
                >
                  <option value="tom" disabled>
                    Velg…
                  </option>
                  <option value="valgt">Egendefinert</option>
                  <option value="eu">Typisk Europa</option>
                  <option value="na">Nord-Amerika</option>
                  <option value="asia">Asia (utvalg)</option>
                  <option value="reset">Reset (USA)</option>
                </Select>
              </HStack>

              <HStack gap="space-8" align="end">
                <TextField
                  label="Søk land (navn eller kode)"
                  value={landQuery}
                  onChange={(e) => setLandQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && canAddFromQuery) {
                      e.preventDefault()
                      addFromQuery()
                    }
                  }}
                  disabled={disableSok}
                  placeholder="F.eks. Thailand eller THA"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addFromQuery}
                  disabled={disableSok || !canAddFromQuery}
                >
                  Legg til kode
                </Button>
              </HStack>

              <div
                style={{
                  maxHeight: '240px',
                  overflow: 'auto',
                  border: '1px solid var(--ax-border-neutral-subtleA)',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  background: 'var(--ax-bg-raised)',
                }}
              >
                <div style={{ fontSize: '0.85rem' }}>
                  <CheckboxGroup
                    legend="Søk på land"
                    value={sokPaaLand}
                    onChange={(v) => setSokPaaLand(v as string[])}
                    disabled={disableSok}
                  >
                    <div style={{ columnCount: 3, columnGap: '1rem' }}>
                      {visibleLandOptions.map((o) => (
                        <div key={o.value} style={{ breakInside: 'avoid', padding: '2px 0' }}>
                          <Checkbox value={o.value}>{o.label}</Checkbox>
                        </div>
                      ))}
                    </div>
                  </CheckboxGroup>
                </div>
              </div>

              <div style={{ opacity: 0.85 }}>
                Valgt: <strong>{selectedLandLabel}</strong> {' · '}
                Minstealder: <strong>{minstAlder || '—'}+</strong> {' · '}
                Filter: <strong>{kunUfore ? 'Kun uføre' : 'Alle'}</strong>
              </div>

              <sokStartFetcher.Form method="post">
                <input type="hidden" name="_intent" value="kjorSok" />
                <input type="hidden" name="grunnlagBehandlingId" value={valgtGrunnlagId ?? ''} />
                <input type="hidden" name="alder" value={minstAlder} />
                <input type="hidden" name="filtrerPaSakstypeUfore" value={String(kunUfore)} />
                {sokPaaLand.map((l) => (
                  <input key={l} type="hidden" name="sokPaaLand" value={l} />
                ))}

                <Button
                  type="submit"
                  variant="secondary"
                  loading={sokStartFetcher.state !== 'idle'}
                  disabled={disableSok || sokPaaLand.length === 0}
                >
                  Kjør søk
                </Button>
              </sokStartFetcher.Form>

              <KjoringerPreview
                title="Søkeresultater"
                items={sokItems}
                emptyText="Ingen søk kjørt ennå."
                onClickItem={(item) => {
                  const id = Number(item.id)
                  if (!Number.isFinite(id)) return
                  const s = sokListe.find((x) => x.sokBehandlingId === id)
                  if (!s) return
                  if (!isFerdig(s.status)) return
                  if (sendtTilKontrollSet.has(id)) return
                  toggleSokSelection(id)
                }}
              />
            </VStack>

            <VStack gap="space-12">
              <Heading size="medium" level="2">
                Steg 3: Start kontroll
              </Heading>

              <div style={{ opacity: 0.85 }}>
                Valgte søk: <strong>{valgteSokIds.length}</strong>
                {valgteSokIds.length > 0 ? ` (${valgteSokIds.join(', ')})` : ''}
              </div>

              <startKontrollFetcher.Form method="post">
                <input type="hidden" name="_intent" value="startKontroll" />
                {valgteSokIds.map((id) => (
                  <input key={id} type="hidden" name="valgteSok" value={String(id)} />
                ))}

                <Button
                  type="submit"
                  variant="primary"
                  loading={startKontrollFetcher.state !== 'idle'}
                  disabled={disableStartKontroll}
                >
                  Start kontroll på valgte
                </Button>
              </startKontrollFetcher.Form>

              <KjoringerPreview
                title="StartKontrollkjøringer"
                items={startKontrollItems}
                emptyText="Ingen startkontroller funnet ennå."
              />
            </VStack>
          </VStack>
        </Tabs.Panel>

        <Tabs.Panel value="statistikk" style={{ marginTop: '1rem' }}>
          <VStack gap="space-12">
            <Heading size="medium" level="2">
              Kontrollstatistikk (grunnlag)
            </Heading>

            {!valgtGrunnlagId || grunnlagStatus !== 'FERDIG' ? (
              <Alert variant="info">
                Statistikk er tilgjengelig når grunnlaget er ferdig. Kjør steg 1 (grunnlag) og vent til status er
                ferdig.
              </Alert>
            ) : (
              <>
                <VStack gap="space-2">
                  <HStack align="center" gap="space-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => pollStatistikk(valgtGrunnlagId)}
                      loading={statistikkFetcher.state !== 'idle'}
                    >
                      Refresh
                    </Button>

                    {statistikkFetcher.state !== 'idle' ? <Loader size="xsmall" title="Henter statistikk" /> : null}

                    <div style={{ opacity: 0.85 }}>
                      GrunnlagId: <strong>{valgtGrunnlagId}</strong>
                    </div>
                  </HStack>
                </VStack>

                {modusStatus === 'PURR' ? <Alert variant="success">Purrebrev er startet.</Alert> : null}
                {modusStatus === 'OPPGAVE' ? <Alert variant="success">Oppgaver er startet.</Alert> : null}

                <div style={{ maxWidth: 560 }}>
                  <Table size="small">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader scope="col">Opprettet</Table.ColumnHeader>
                        <Table.ColumnHeader scope="col">Under behandling</Table.ColumnHeader>
                        <Table.ColumnHeader scope="col">Fullført</Table.ColumnHeader>
                        <Table.ColumnHeader scope="col">Feil</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      <Table.Row>
                        <Table.DataCell>{statistikk?.antallOpprettet ?? '—'}</Table.DataCell>
                        <Table.DataCell>{statistikk?.antallUnderBehandling ?? '—'}</Table.DataCell>
                        <Table.DataCell>{statistikk?.antallFullfort ?? '—'}</Table.DataCell>
                        <Table.DataCell>{statistikk?.antallFeil ?? '—'}</Table.DataCell>
                      </Table.Row>
                    </Table.Body>
                  </Table>

                  {statistikkChartData ? (
                    <div style={{ height: 260, marginTop: '1rem' }}>
                      <Bar
                        data={statistikkChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: {
                            y: { beginAtZero: true, ticks: { precision: 0 } },
                          },
                          datasets: {
                            bar: {
                              maxBarThickness: 42,
                              categoryPercentage: 0.7,
                              barPercentage: 0.8,
                            },
                          },
                        }}
                      />
                    </div>
                  ) : null}

                  <HStack align="center" gap="space-2" style={{ marginTop: '1rem' }}>
                    <Button
                      size="small"
                      variant="danger"
                      type="button"
                      onClick={() => setOpenPurrDialog(true)}
                      disabled={disableModus}
                    >
                      Purr
                    </Button>

                    <Button
                      size="small"
                      variant="danger"
                      type="button"
                      onClick={() => setOpenOppgaveDialog(true)}
                      disabled={disableModus}
                    >
                      Opprett oppgaver
                    </Button>
                  </HStack>

                  <Modal
                    open={openPurrDialog}
                    onClose={() => setOpenPurrDialog(false)}
                    header={{ heading: 'Purr', size: 'small' }}
                  >
                    <Modal.Body>
                      <BodyShort>
                        Er du sikker på at du vil purre? Denne sender brev med påminnelse om leveattest til alle
                        behandlinger som ligger til "under behandling".
                      </BodyShort>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button
                        type="button"
                        variant="danger"
                        loading={purreFetcher.state !== 'idle'}
                        disabled={disableModus}
                        onClick={() => {
                          if (!valgtGrunnlagId) return
                          setOpenPurrDialog(false)
                          const fd = new FormData()
                          fd.append('_intent', 'settPurreModus')
                          fd.append('grunnlagId', String(valgtGrunnlagId))
                          purreFetcher.submit(fd, { method: 'post' })
                        }}
                      >
                        Ja, purr
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={purreFetcher.state !== 'idle'}
                        onClick={() => setOpenPurrDialog(false)}
                      >
                        Avbryt
                      </Button>
                    </Modal.Footer>
                  </Modal>

                  <Modal
                    open={openOppgaveDialog}
                    onClose={() => setOpenOppgaveDialog(false)}
                    header={{ heading: 'Opprett oppgaver', size: 'small' }}
                  >
                    <Modal.Body>
                      <BodyShort>
                        Er du sikker på at du vil opprette oppgaver på alle behandlinger som ligger til "under
                        behandling" ?
                      </BodyShort>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button
                        type="button"
                        variant="danger"
                        loading={oppgaveFetcher.state !== 'idle'}
                        disabled={disableModus}
                        onClick={() => {
                          if (!valgtGrunnlagId) return
                          setOpenOppgaveDialog(false)
                          const fd = new FormData()
                          fd.append('_intent', 'settOppgaveModus')
                          fd.append('grunnlagId', String(valgtGrunnlagId))
                          oppgaveFetcher.submit(fd, { method: 'post' })
                        }}
                      >
                        Ja, opprett oppgaver
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={oppgaveFetcher.state !== 'idle'}
                        onClick={() => setOpenOppgaveDialog(false)}
                      >
                        Avbryt
                      </Button>
                    </Modal.Footer>
                  </Modal>
                </div>
              </>
            )}
          </VStack>
        </Tabs.Panel>
      </Tabs>
    </VStack>
  )
}
