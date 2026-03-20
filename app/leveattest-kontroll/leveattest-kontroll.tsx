import {
  Alert,
  BodyShort,
  Button,
  Checkbox,
  CheckboxGroup,
  Heading,
  HStack,
  Modal,
  Select,
  Table,
  Tabs,
  TextField,
  VStack,
} from '@navikt/ds-react'
import { useEffect, useMemo, useRef, useState } from 'react'
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
  { value: 'DZA', label: 'Algerie' },
  { value: 'ARG', label: 'Argentina' },
  { value: 'AUS', label: 'Australia' },
  { value: 'BIH', label: 'Bosnia-Hercegovina' },
  { value: 'BRA', label: 'Brasil' },
  { value: 'CAN', label: 'Canada' },
  { value: 'CHL', label: 'Chile' },
  { value: 'COL', label: 'Colombia' },
  { value: 'CRI', label: 'Costa Rica' },
  { value: 'CUB', label: 'Cuba' },
  { value: 'ARE', label: 'De Forente Arabiske Emirater' },
  { value: 'DOM', label: 'Den Dominikanske Republikk' },
  { value: 'ECU', label: 'Ecuador' },
  { value: 'EGY', label: 'Egypt' },
  { value: 'ETH', label: 'Etiopia' },
  { value: 'PHL', label: 'Filippinene' },
  { value: 'FRO', label: 'Færøyene' },
  { value: 'GMB', label: 'Gambia' },
  { value: 'GHA', label: 'Ghana' },
  { value: 'GRL', label: 'Grønland' },
  { value: 'HKG', label: 'Hongkong' },
  { value: 'IND', label: 'India' },
  { value: 'IDN', label: 'Indonesia' },
  { value: 'IRN', label: 'Iran' },
  { value: 'IRQ', label: 'Irak' },
  { value: 'ISR', label: 'Israel' },
  { value: 'JPN', label: 'Japan' },
  { value: 'JOR', label: 'Jordan' },
  { value: 'CPV', label: 'Kapp Verde' },
  { value: 'KHM', label: 'Kambodsja' },
  { value: 'KEN', label: 'Kenya' },
  { value: 'CHN', label: 'Kina' },
  { value: 'XKX', label: 'Kosovo' },
  { value: 'LAO', label: 'Laos' },
  { value: 'LBN', label: 'Libanon' },
  { value: 'MYS', label: 'Malaysia' },
  { value: 'MAR', label: 'Marokko' },
  { value: 'MUS', label: 'Mauritius' },
  { value: 'MEX', label: 'Mexico' },
  { value: 'MNE', label: 'Montenegro' },
  { value: 'MMR', label: 'Myanmar' },
  { value: 'NZL', label: 'New Zealand' },
  { value: 'PAK', label: 'Pakistan' },
  { value: 'PER', label: 'Peru' },
  { value: 'RUS', label: 'Russland' },
  { value: 'SRB', label: 'Serbia' },
  { value: 'SGP', label: 'Singapore' },
  { value: 'SOM', label: 'Somalia' },
  { value: 'GBR', label: 'Storbritannia' },
  { value: 'ZAF', label: 'Sør-Afrika' },
  { value: 'KOR', label: 'Sør-Korea' },
  { value: 'LKA', label: 'Sri Lanka' },
  { value: 'CHE', label: 'Sveits' },
  { value: 'TZA', label: 'Tanzania' },
  { value: 'THA', label: 'Thailand' },
  { value: 'TTO', label: 'Trinidad og Tobago' },
  { value: 'TUN', label: 'Tunisia' },
  { value: 'TUR', label: 'Tyrkia' },
  { value: 'UGA', label: 'Uganda' },
  { value: 'UKR', label: 'Ukraina' },
  { value: 'URY', label: 'Uruguay' },
  { value: 'USA', label: 'USA' },
  { value: 'VNM', label: 'Vietnam' },
  { value: 'BEL', label: 'Belgia' },
  { value: 'BGR', label: 'Bulgaria' },
  { value: 'CZE', label: 'Den Tsjekkiske Rep.' },
  { value: 'EST', label: 'Estland' },
  { value: 'FRA', label: 'Frankrike' },
  { value: 'GRC', label: 'Hellas' },
  { value: 'IRL', label: 'Irland' },
  { value: 'ISL', label: 'Island' },
  { value: 'ITA', label: 'Italia' },
  { value: 'HRV', label: 'Kroatia' },
  { value: 'CYP', label: 'Kypros' },
  { value: 'LVA', label: 'Latvia' },
  { value: 'LIE', label: 'Liechtenstein' },
  { value: 'LTU', label: 'Litauen' },
  { value: 'LUX', label: 'Luxembourg' },
  { value: 'MLT', label: 'Malta' },
  { value: 'NLD', label: 'Nederland' },
  { value: 'POL', label: 'Polen' },
  { value: 'PRT', label: 'Portugal' },
  { value: 'ROU', label: 'Romania' },
  { value: 'SVK', label: 'Slovakia' },
  { value: 'SVN', label: 'Slovenia' },
  { value: 'ESP', label: 'Spania' },
  { value: 'DEU', label: 'Tyskland' },
  { value: 'HUN', label: 'Ungarn' },
  { value: 'AUT', label: 'Østerrike' },
]

function validerLandkode(code: string) {
  return BOSTEDLAND_OPTIONS.find((o) => o.value === code)?.value ?? `${code} (ukjent)`
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

  const [openHentGrunnlagDialog, setOpenHentGrunnlagDialog] = useState(false)
  const [openPurrDialog, setOpenPurrDialog] = useState(false)
  const [openOppgaveDialog, setOpenOppgaveDialog] = useState(false)

  const initializedRef = useRef(false)
  const lastLoadedSokForGrunnlagRef = useRef<number | null>(null)
  const handledGrunnlagStartIdRef = useRef<number | null>(null)
  const handledSokStartIdRef = useRef<number | null>(null)
  const handledStartKontrollResponseRef = useRef<StartKontrollActionResponse | null>(null)

  const [valgteSokIds, setValgteSokIds] = useState<number[]>([])

  const valgtGrunnlagId = useMemo(
    () => grunnlagBehandlingId ?? grunnlagResultat?.grunnlagBehandlingId ?? null,
    [grunnlagBehandlingId, grunnlagResultat?.grunnlagBehandlingId],
  )

  const refreshGrunnlag = () => {
    if (pollFetcher.state !== 'idle') return
    pollFetcher.load('?poll=grunnlag')
  }

  const refreshSokListe = (grunnlagId: number) => {
    if (sokListFetcher.state !== 'idle') return
    sokListFetcher.load(`?poll=sok&grunnlagId=${grunnlagId}`)
  }

  const refreshStartKontroller = () => {
    if (startKontrollListFetcher.state !== 'idle') return
    startKontrollListFetcher.load('?poll=startkontroll')
  }

  const pollStatistikk = (grunnlagId: number) => {
    statistikkFetcher.load(`?poll=statistikk&grunnlagId=${grunnlagId}`)
  }

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
    setGrunnlagStatus(isFerdig(latestGrunnlag.status) ? 'FERDIG' : 'KJØRER')
  }, [latestGrunnlag, initialSok, initialStartkontroller])

  useEffect(() => {
    const behandlingId = startFetcher.data?.behandlingId
    if (!behandlingId) return
    if (handledGrunnlagStartIdRef.current === behandlingId) return

    handledGrunnlagStartIdRef.current = behandlingId
    setGrunnlagBehandlingId(behandlingId)
    setGrunnlagStatus('KJØRER')
    setGrunnlagResultat({
      grunnlagBehandlingId: behandlingId,
      status: 'UNDER_BEHANDLING',
      antallSPKPersoner: null,
      kjoredatoGrunnlag: null,
      behandlingSistKjort: null,
    })
    lastLoadedSokForGrunnlagRef.current = null

    if (pollFetcher.state === 'idle') {
      pollFetcher.load('?poll=grunnlag')
    }
  }, [startFetcher.data?.behandlingId, pollFetcher.state, pollFetcher.load])

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
      const ferdigGrunnlagId = data.resultat.grunnlagBehandlingId
      setGrunnlagStatus('FERDIG')
      setGrunnlagResultat(data.resultat)
      setGrunnlagBehandlingId(ferdigGrunnlagId)

      if (lastLoadedSokForGrunnlagRef.current !== ferdigGrunnlagId) {
        lastLoadedSokForGrunnlagRef.current = ferdigGrunnlagId
        if (sokListFetcher.state === 'idle') {
          sokListFetcher.load(`?poll=sok&grunnlagId=${ferdigGrunnlagId}`)
        }
      }
    }
  }, [pollFetcher.data, sokListFetcher.state, sokListFetcher.load])

  useEffect(() => {
    if (!sokListFetcher.data) return
    setSokListe(sokListFetcher.data.sok ?? [])
  }, [sokListFetcher.data])

  useEffect(() => {
    const grunnlagId = grunnlagBehandlingId ?? grunnlagResultat?.grunnlagBehandlingId ?? null
    const sokId = sokStartFetcher.data?.sokBehandlingId
    if (!grunnlagId || !sokId) return
    if (handledSokStartIdRef.current === sokId) return

    handledSokStartIdRef.current = sokId
    if (sokListFetcher.state === 'idle') {
      sokListFetcher.load(`?poll=sok&grunnlagId=${grunnlagId}`)
    }
  }, [
    sokStartFetcher.data?.sokBehandlingId,
    grunnlagBehandlingId,
    grunnlagResultat?.grunnlagBehandlingId,
    sokListFetcher.state,
    sokListFetcher.load,
  ])

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
    const oppgave = oppgaveFetcher.data
    if (oppgave) {
      setModusStatus(oppgave.type)
      return
    }

    const purr = purreFetcher.data
    if (purr) {
      setModusStatus(purr.type)
    }
  }, [oppgaveFetcher.data, purreFetcher.data])

  useEffect(() => {
    const data = startKontrollFetcher.data
    if (!data?.ok) {
      handledStartKontrollResponseRef.current = null
      return
    }
    if (handledStartKontrollResponseRef.current === data) return

    handledStartKontrollResponseRef.current = data
    if (startKontrollListFetcher.state === 'idle') {
      startKontrollListFetcher.load('?poll=startkontroll')
    }
  }, [startKontrollFetcher.data, startKontrollListFetcher.state, startKontrollListFetcher.load])

  useEffect(() => {
    const id = window.setInterval(() => {
      const grunnlagId = grunnlagBehandlingId ?? grunnlagResultat?.grunnlagBehandlingId ?? null

      if (grunnlagStatus === 'KJØRER' && pollFetcher.state === 'idle') {
        pollFetcher.load('?poll=grunnlag')
      }

      if (grunnlagId && sokListFetcher.state === 'idle') {
        sokListFetcher.load(`?poll=sok&grunnlagId=${grunnlagId}`)
      }

      if (startKontrollListFetcher.state === 'idle') {
        startKontrollListFetcher.load('?poll=startkontroll')
      }
    }, 20_000)

    return () => window.clearInterval(id)
  }, [
    grunnlagStatus,
    grunnlagBehandlingId,
    grunnlagResultat?.grunnlagBehandlingId,
    pollFetcher.state,
    pollFetcher.load,
    sokListFetcher.state,
    sokListFetcher.load,
    startKontrollListFetcher.state,
    startKontrollListFetcher.load,
  ])
  const disableStart = grunnlagStatus === 'KJØRER'
  const disableSok = !valgtGrunnlagId || grunnlagStatus !== 'FERDIG'
  const disableModus = disableSok || purreFetcher.state !== 'idle' || oppgaveFetcher.state !== 'idle'
  useEffect(() => {
    void valgtGrunnlagId
    autoStatistikkLastetRef.current = false
    setStatistikk(null)
    setModusStatus(null)
  }, [valgtGrunnlagId])

  useEffect(() => {
    if (!valgtGrunnlagId) return
    if (grunnlagStatus !== 'FERDIG') return
    if (autoStatistikkLastetRef.current) return
    if (statistikkFetcher.state !== 'idle') return

    autoStatistikkLastetRef.current = true
    statistikkFetcher.load(`?poll=statistikk&grunnlagId=${valgtGrunnlagId}`)
  }, [valgtGrunnlagId, grunnlagStatus, statistikkFetcher.state, statistikkFetcher.load])

  const [minstAlder, setMinstAlder] = useState<string>('67')
  const [kunUfore, setKunUfore] = useState<boolean>(false)
  const [sokPaaLand, setSokPaaLand] = useState<string[]>([])
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

  function resetSokValg() {
    setMinstAlder('67')
    setKunUfore(false)
    setSokPaaLand([])
    setLandQuery('')
  }

  function resetValgteSok() {
    setValgteSokIds([])
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

    return allLandOptions
      .filter((o) => !selected.has(o.value))
      .filter(matchesQuery)
      .slice()
      .sort((a, b) => a.label.localeCompare(b.label, 'no-NO'))
  }, [allLandOptions, landQuery, sokPaaLand])

  const selectedLandOptions = useMemo(() => {
    const selected = new Set(sokPaaLand)

    return allLandOptions
      .filter((o) => selected.has(o.value))
      .slice()
      .sort((a, b) => a.label.localeCompare(b.label, 'no-NO'))
  }, [allLandOptions, sokPaaLand])

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

        const landCodes = s.sokPaaLand.map(validerLandkode).join(', ')

        const sendt = sendtTilKontrollSet.has(s.sokBehandlingId)

        const baseTag = `SøkId: ${s.sokBehandlingId} · ${landCodes} · ${s.alder}+${s.filtrerPaSakstypeUfore ? ' · Kun uføre' : ''}`
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
                <Button
                  type="button"
                  loading={startFetcher.state !== 'idle'}
                  disabled={disableStart || startFetcher.state !== 'idle'}
                  onClick={() => setOpenHentGrunnlagDialog(true)}
                >
                  Hent grunnlag
                </Button>

                {grunnlagStatus === 'KJØRER' && <div style={{ opacity: 0.85 }}>Kjører…</div>}

                {grunnlagStatus === 'FERDIG' && grunnlagResultat && (
                  <div style={{ opacity: 0.9 }}>
                    Ferdig: <strong>{grunnlagResultat.antallSPKPersoner ?? 0}</strong> personer
                  </div>
                )}
              </HStack>

              <KjoringerPreview title="Grunnlagkjøring" items={grunnlagItems} emptyText="Ingen grunnlag funnet ennå." />

              <Modal
                open={openHentGrunnlagDialog}
                onClose={() => setOpenHentGrunnlagDialog(false)}
                header={{ heading: 'Hent nytt grunnlag', size: 'small' }}
              >
                <Modal.Body>
                  <BodyShort>
                    Er du sikker på at du vil hente nytt grunnlag? Søkeresultatene i visningen hører til siste grunnlag,
                    og kan bli erstattet når nytt grunnlag er klart.
                  </BodyShort>
                </Modal.Body>
                <Modal.Footer>
                  <startFetcher.Form method="post">
                    <input type="hidden" name="_intent" value="hentGrunnlag" />
                    <Button
                      type="submit"
                      loading={startFetcher.state !== 'idle'}
                      disabled={disableStart || startFetcher.state !== 'idle'}
                      onClick={() => setOpenHentGrunnlagDialog(false)}
                    >
                      Ja, hent nytt grunnlag
                    </Button>
                  </startFetcher.Form>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={startFetcher.state !== 'idle'}
                    onClick={() => setOpenHentGrunnlagDialog(false)}
                  >
                    Avbryt
                  </Button>
                </Modal.Footer>
              </Modal>

              <HStack align="center" gap="space-2">
                <Button
                  size="small"
                  variant="secondary"
                  onClick={refreshGrunnlag}
                  disabled={pollFetcher.state !== 'idle'}
                >
                  Refresh grunnlag
                </Button>
              </HStack>
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
                    if (v === 'sorostasia') {
                      setSokPaaLand(['IDN', 'KHM', 'LAO', 'MMR', 'MYS', 'PHL', 'SGP', 'THA', 'VNM'])
                    } else if (v === 'utenfor-sorostasia') {
                      setSokPaaLand(['MAR', 'PAK', 'IND'])
                    } else if (v === 'usa') {
                      setSokPaaLand(['USA'])
                    } else if (v === 'utenfor-usa') {
                      setSokPaaLand(['CAN', 'TUR', 'AUS', 'CHL', 'BIH', 'ESP'])
                    } else if (v === 'reset') {
                      setSokPaaLand([])
                    }
                  }}
                  disabled={disableSok}
                >
                  <option value="tom" disabled>
                    Velg…
                  </option>
                  <option value="valgt">Egendefinert</option>
                  <option value="sorostasia">Sør-øst Asia</option>
                  <option value="utenfor-sorostasia">Utenfor sør-øst Asia</option>
                  <option value="usa">USA</option>
                  <option value="utenfor-usa">Utenfor USA</option>
                  <option value="reset">Nullstill land</option>
                </Select>

                <Button type="button" variant="secondary" onClick={resetSokValg} disabled={disableSok}>
                  Nullstill valg
                </Button>
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
                  maxHeight: '320px',
                  overflow: 'auto',
                  border: '1px solid var(--ax-border-neutral-subtleA)',
                  borderRadius: '12px',
                  background: 'var(--ax-bg-raised)',
                }}
              >
                <div
                  style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    padding: '0.75rem',
                    borderBottom: '1px solid var(--ax-border-neutral-subtleA)',
                    background: 'var(--ax-bg-raised)',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Valgte land</div>
                  {selectedLandOptions.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {selectedLandOptions.map((o) => (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() => setSokPaaLand((prev) => prev.filter((code) => code !== o.value))}
                          disabled={disableSok}
                          style={{
                            border: '1px solid var(--ax-border-focus)',
                            borderRadius: '999px',
                            padding: '0.35rem 0.7rem',
                            background: 'var(--ax-border-focus)',
                            color: 'white',
                            fontWeight: 600,
                            cursor: disableSok ? 'default' : 'pointer',
                          }}
                        >
                          {o.label} ({o.value}) ×
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div style={{ opacity: 0.75, fontSize: '0.9rem' }}>Ingen land valgt</div>
                  )}
                </div>

                <div style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                  <CheckboxGroup
                    legend="Søk på land"
                    value={sokPaaLand}
                    onChange={(v) => setSokPaaLand(v as string[])}
                    disabled={disableSok}
                    hideLegend
                  >
                    <div style={{ columnCount: 3, columnGap: '1rem' }}>
                      {visibleLandOptions.map((o) => (
                        <div key={o.value} style={{ breakInside: 'avoid', padding: '2px 0' }}>
                          <Checkbox value={o.value}>
                            {o.label} ({o.value})
                          </Checkbox>
                        </div>
                      ))}
                    </div>
                  </CheckboxGroup>
                </div>
              </div>

              <div style={{ opacity: 0.85 }}>
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

              <HStack align="center" gap="space-2">
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => {
                    if (!valgtGrunnlagId) return
                    refreshSokListe(valgtGrunnlagId)
                  }}
                  disabled={!valgtGrunnlagId || sokListFetcher.state !== 'idle'}
                >
                  Refresh søkeresultater
                </Button>
              </HStack>
            </VStack>

            <VStack gap="space-12">
              <Heading size="medium" level="2">
                Steg 3: Start kontroll
              </Heading>

              <HStack align="center" gap="space-8">
                <div style={{ opacity: 0.85 }}>
                  Valgte søk: <strong>{valgteSokIds.length}</strong>
                  {valgteSokIds.length > 0 ? ` (${valgteSokIds.join(', ')})` : ''}
                </div>
                <Button
                  type="button"
                  size="small"
                  variant="secondary"
                  onClick={resetValgteSok}
                  disabled={valgteSokIds.length === 0}
                >
                  Nullstill valg
                </Button>
              </HStack>

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

              <HStack align="center" gap="space-2">
                <Button
                  size="small"
                  variant="secondary"
                  onClick={refreshStartKontroller}
                  disabled={startKontrollListFetcher.state !== 'idle'}
                >
                  Refresh startkontroller
                </Button>
              </HStack>
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
                      onClick={() => {
                        if (statistikkFetcher.state !== 'idle') return
                        pollStatistikk(valgtGrunnlagId)
                      }}
                      disabled={statistikkFetcher.state !== 'idle'}
                    >
                      Refresh
                    </Button>

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
                      onClick={() => {
                        setModusStatus(null)
                        setOpenPurrDialog(true)
                      }}
                      disabled={disableModus}
                    >
                      Purr
                    </Button>

                    <Button
                      size="small"
                      variant="danger"
                      type="button"
                      onClick={() => {
                        setModusStatus(null)
                        setOpenOppgaveDialog(true)
                      }}
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
                        Er du sikker på at du vil gjøre purring av leveattester? Brev med påminnelse om leveattest vil
                        bli sendt til alle brukere som ikke har levert leveattest.
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
                          setModusStatus(null)
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
                        Er du sikker på at du vil gjøre oppfølging av leveattester? Dette oppretter oppgave til
                        saksbehandler for alle brukere som ikke har levert leveattest.
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
                          setModusStatus(null)
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
