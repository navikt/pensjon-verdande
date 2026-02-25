import { Button, Checkbox, CheckboxGroup, Heading, HStack, Select, TextField, VStack } from '@navikt/ds-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFetcher } from 'react-router'
import { apiGetOrUndefined, apiPost } from '~/services/api.server'
import type { Route } from './+types/leveattest-kontroll'
import KjoringerPreview, { type BubbleItem } from './kjoringer-preview'

type StartGrunnlagResponse = { behandlingId: number }
type StartSokResponse = { sokBehandlingId: number }
type StartKontrollActionResponse = { ok: true }

type BehandlingStatus = string

type LeveattestGrunnlagResultat = {
  grunnlagBehandlingId: number
  status: BehandlingStatus
  antallSPKPersoner?: number | null
  kjoredatoGrunnlag?: string | null // LocalDate -> YYYY-MM-DD
  behandlingSistKjort?: string | null // LocalDateTime -> ISO
}

type LeveattestSokResultat = {
  grunnlagBehandlingId: number
  status: string
  sokBehandlingId: number
  sokPaaLand: string[]
  alder: number
  filtrerPaSakstypeUfore: boolean
  antallPersonerTilKontroll: number
  behandlingSistKjort: string // ISO
}

type LeveattestStartKontrollResponse = {
  sokBehandlingId: number
  status: string
  behandlingSistKjort: string // ISO
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
  return new Intl.DateTimeFormat('no-NO', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dt)
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
    const resultat = await apiGetOrUndefined<LeveattestGrunnlagResultat>(`/api/behandling/leveattest/grunnlag`, request)

    if (!resultat) return Response.json({ status: 'IKKE_FUNNET' } satisfies PollResponse)
    if (isFerdig(resultat.status)) return Response.json({ status: 'FERDIG', resultat } satisfies PollResponse)
    return Response.json({ status: 'KJØRER' } satisfies PollResponse)
  }

  if (url.searchParams.get('poll') === 'sok') {
    const grunnlagIdStr = url.searchParams.get('grunnlagId')
    if (!grunnlagIdStr) {
      return Response.json({ grunnlagBehandlingId: 0, sok: [] } satisfies SokPollResponse, { status: 400 })
    }
    const grunnlagId = Number(grunnlagIdStr)

    const sok =
      (await apiGetOrUndefined<LeveattestSokResultat[]>(`/api/behandling/leveattest/${grunnlagId}`, request)) ?? []

    return Response.json({ grunnlagBehandlingId: grunnlagId, sok } satisfies SokPollResponse)
  }

  if (url.searchParams.get('poll') === 'startkontroll') {
    const startkontroller =
      (await apiGetOrUndefined<LeveattestStartKontrollResponse[]>(
        `/api/behandling/leveattest/startkontroll`,
        request,
      )) ?? []
    return Response.json({ startkontroller } satisfies StartKontrollPollResponse)
  }

  const latestGrunnlag = await apiGetOrUndefined<LeveattestGrunnlagResultat>(
    `/api/behandling/leveattest/grunnlag`,
    request,
  )

  const sok = latestGrunnlag
    ? ((await apiGetOrUndefined<LeveattestSokResultat[]>(
        `/api/behandling/leveattest/${latestGrunnlag.grunnlagBehandlingId}`,
        request,
      )) ?? [])
    : []

  const startkontroller =
    (await apiGetOrUndefined<LeveattestStartKontrollResponse[]>(`/api/behandling/leveattest/startkontroll`, request)) ??
    []

  return Response.json({
    latestGrunnlag: latestGrunnlag ?? null,
    sok,
    startkontroller,
  } satisfies LoaderData)
}

export async function action({ request }: Route.ActionArgs) {
  const fd = await request.formData()
  const intent = String(fd.get('_intent') ?? '')

  if (intent === 'hentGrunnlag') {
    const behandlingId = await apiPost<number>('/api/behandling/leveattest/grunnlag', {}, request)
    if (typeof behandlingId !== 'number') {
      return Response.json({ error: 'Mangler behandlingId fra backend' }, { status: 500 })
    }
    return Response.json({ behandlingId } satisfies StartGrunnlagResponse)
  }

  if (intent === 'kjorSok') {
    const grunnlagBehandlingId = Number(fd.get('grunnlagBehandlingId'))
    if (!Number.isFinite(grunnlagBehandlingId) || grunnlagBehandlingId <= 0) {
      return Response.json({ error: 'Ugyldig grunnlagBehandlingId' }, { status: 400 })
    }

    const alderRaw = String(fd.get('alder') ?? '')
    const alder = Number(alderRaw)
    if (!Number.isFinite(alder) || alder < 0 || alder > 120) {
      return Response.json({ error: 'Ugyldig minstealder' }, { status: 400 })
    }

    const filtrerPaSakstypeUfore = String(fd.get('filtrerPaSakstypeUfore') ?? 'false') === 'true'
    const sokPaaLand = fd
      .getAll('sokPaaLand')
      .map((v) => String(v))
      .filter(Boolean)

    if (sokPaaLand.length === 0) {
      return Response.json({ error: 'Mangler sokPaaLand' }, { status: 400 })
    }

    const sokBehandlingId = await apiPost<number>(
      '/api/behandling/leveattest/sok',
      { grunnlagBehandlingId, alder, sokPaaLand, filtrerPaSakstypeUfore },
      request,
    )

    if (typeof sokBehandlingId !== 'number') {
      return Response.json({ error: 'Mangler sokBehandlingId fra backend' }, { status: 500 })
    }

    return Response.json({ sokBehandlingId } satisfies StartSokResponse)
  }

  if (intent === 'startKontroll') {
    const sokBehandlingId = fd
      .getAll('valgteSok')
      .map((v) => Number(v))
      .filter((n) => Number.isFinite(n))

    if (sokBehandlingId.length === 0) {
      return Response.json({ error: 'Ingen søk valgt' }, { status: 400 })
    }

    await apiPost<void>('/api/behandling/leveattest/startkontroll', { sokBehandlingId }, request)

    return Response.json({ ok: true } satisfies StartKontrollActionResponse)
  }

  return null
}

export default function LeveattestKontrollStartside({ loaderData }: Route.ComponentProps) {
  const { latestGrunnlag, sok: initialSok, startkontroller: initialStartkontroller } = loaderData as LoaderData

  const startFetcher = useFetcher<StartGrunnlagResponse>()
  const pollFetcher = useFetcher<PollResponse>()
  const sokStartFetcher = useFetcher<StartSokResponse>()
  const sokListFetcher = useFetcher<SokPollResponse>()
  const startKontrollFetcher = useFetcher<StartKontrollActionResponse>()
  const startKontrollListFetcher = useFetcher<StartKontrollPollResponse>()

  const [grunnlagBehandlingId, setGrunnlagBehandlingId] = useState<number | null>(null)
  const [grunnlagStatus, setGrunnlagStatus] = useState<'IDLE' | 'KJØRER' | 'FERDIG'>('IDLE')
  const [grunnlagResultat, setGrunnlagResultat] = useState<LeveattestGrunnlagResultat | null>(null)

  const [sokListe, setSokListe] = useState<LeveattestSokResultat[]>(initialSok ?? [])
  const [startkontroller, setStartkontroller] = useState<LeveattestStartKontrollResponse[]>(
    initialStartkontroller ?? [],
  )

  const pollTimerRef = useRef<number | null>(null)
  const sokPollTimerRef = useRef<number | null>(null)
  const sokBackgroundPollRef = useRef<number | null>(null)
  const startKontrollPollRef = useRef<number | null>(null)
  const initializedRef = useRef(false)

  const [valgteSokIds, setValgteSokIds] = useState<number[]>([])

  const stoppInterval = useCallback((ref: React.MutableRefObject<number | null>) => {
    if (ref.current != null) {
      window.clearInterval(ref.current)
      ref.current = null
    }
  }, [])

  const pollGrunnlag = useCallback(() => {
    pollFetcher.load(`?poll=grunnlag`)
  }, [pollFetcher])

  const pollSokListe = useCallback(
    (grunnlagId: number) => {
      sokListFetcher.load(`?poll=sok&grunnlagId=${grunnlagId}`)
    },
    [sokListFetcher],
  )

  const pollStartKontroller = useCallback(() => {
    startKontrollListFetcher.load(`?poll=startkontroll`)
  }, [startKontrollListFetcher])

  const sendtTilKontrollSet = useMemo(() => {
    return new Set(startkontroller.map((k) => k.sokBehandlingId))
  }, [startkontroller])

  useEffect(() => {
    setValgteSokIds((prev) => prev.filter((id) => !sendtTilKontrollSet.has(id)))
  }, [sendtTilKontrollSet])

  // init from loaderData
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    setStartkontroller(initialStartkontroller ?? [])

    if (!latestGrunnlag) {
      setGrunnlagStatus('IDLE')
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

  // start grunnlag
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

  // handle grunnlag polling result
  useEffect(() => {
    const data = pollFetcher.data
    if (!data) return

    if (data.status === 'IKKE_FUNNET') {
      setGrunnlagStatus('IDLE')
      stoppInterval(pollTimerRef)
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

  // handle søk list response
  useEffect(() => {
    if (!sokListFetcher.data) return
    setSokListe(sokListFetcher.data.sok ?? [])
  }, [sokListFetcher.data])

  // background poll søk while any non-terminal
  useEffect(() => {
    const grunnlagId = grunnlagBehandlingId ?? grunnlagResultat?.grunnlagBehandlingId ?? null
    if (!grunnlagId) return
    if (grunnlagStatus !== 'FERDIG') return

    const hasNonTerminal = sokListe.some((s) => !isTerminal(s.status))
    if (!hasNonTerminal) {
      stoppInterval(sokBackgroundPollRef)
      return
    }

    if (sokBackgroundPollRef.current != null) return
    sokBackgroundPollRef.current = window.setInterval(() => pollSokListe(grunnlagId), 10_000)

    return () => stoppInterval(sokBackgroundPollRef)
  }, [grunnlagBehandlingId, grunnlagResultat, grunnlagStatus, sokListe, pollSokListe, stoppInterval])

  // tight poll after starting a new søk
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

  // handle startkontroll list response
  useEffect(() => {
    if (!startKontrollListFetcher.data) return
    setStartkontroller(startKontrollListFetcher.data.startkontroller ?? [])
  }, [startKontrollListFetcher.data])

  // poll startkontroll after POST
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

  // background poll startkontroll while any non-terminal
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

  // Step 2 state
  const disableStart = grunnlagStatus === 'KJØRER'
  const disableSok = !(grunnlagBehandlingId ?? grunnlagResultat?.grunnlagBehandlingId) || grunnlagStatus !== 'FERDIG'

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

  const valgtGrunnlagId = grunnlagBehandlingId ?? grunnlagResultat?.grunnlagBehandlingId ?? null

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
          tagColorKey: `KONTROLL:${String(k.sokBehandlingId)}`,
          selected: false,
        }
      })
  }, [startkontroller])

  const disableStartKontroll = valgteSokIds.length === 0

  return (
    <VStack gap="space-24" style={{ padding: '1rem' }}>
      <Heading size="large" level="1">
        Opprett leveattestkontroll
      </Heading>

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
              if (v === 'eu') setSokPaaLand(['DEU', 'FRA', 'ESP', 'PRT', 'ITA', 'NLD', 'BEL', 'AUT', 'CHE', 'IRL'])
              else if (v === 'na') setSokPaaLand(['USA', 'CAN'])
              else if (v === 'asia') setSokPaaLand(['THA', 'IND', 'KOR'])
              else if (v === 'reset') setSokPaaLand(['USA'])
            }}
            disabled={disableSok}
          >
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
          <Button type="button" variant="secondary" onClick={addFromQuery} disabled={disableSok || !canAddFromQuery}>
            Legg til kode
          </Button>
        </HStack>

        <div
          style={{
            maxHeight: '240px',
            overflow: 'auto',
            border: '1px solid var(--ax-border-subtle)',
            borderRadius: '12px',
            padding: '0.75rem',
            background: 'var(--ax-surface-default)',
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
  )
}
