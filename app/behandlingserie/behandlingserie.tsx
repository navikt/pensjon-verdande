import {
  Alert,
  Button,
  Checkbox,
  DatePicker,
  Heading,
  HStack,
  Modal,
  Radio,
  RadioGroup,
  Select,
  VStack,
} from '@navikt/ds-react'
import {useCallback, useEffect, useId, useMemo, useState} from 'react'
import {
    type ActionFunctionArgs,
    type LoaderFunctionArgs,
    redirect,
    useFetcher,
    useLoaderData,
    useNavigate,
    useSearchParams,
} from 'react-router'
import 'chart.js/auto'
import {ExternalLinkIcon} from '@navikt/aksel-icons'
import type {DateRange} from 'react-day-picker'
import {
  endrePlanlagtStartet,
  getBehandlingSerier,
  getTillateBehandlinger,
  hentSerieValg,
  opprettBehandlingSerie,
} from '~/behandlingserie/behandlingserie.server'
import PlanlagteDatoerPreview, {type PlannedItem} from '~/behandlingserie/planlagteDatoerPreview'
import ValgteDatoerPreview from '~/behandlingserie/valgteDatoerPreview'
import {requireAccessToken} from '~/services/auth.server'
import type {BehandlingInfoDTO, BehandlingSerieDTO} from '~/types'
import type { Route } from './+types/behandlingserie'
import {byggRegelAdvarsler, filtrerDatoerMedRegler, type SerieValg, tellDatoerPerMaaned,} from './serieValg'
import {
  addMonths,
  allWeekdaysInRange,
  buildDisabledDates,
  buildValgteDatoer,
  byggHelligdagsdata,
  firstPossibleDayOnOrAfter,
  firstWeekdayOnOrAfter,
  getWeekdayNumber,
  monthlyAnchoredStartDates,
  quarterlyStartDates,
  tertialStartDates,
  toYearMonthDay,
} from './seriekalenderUtils'

type RegelmessighetModus = 'range' | 'multiple'
type Utvalg = Date[] | DateRange | undefined
type IntervallModus = '' | 'quarterly' | 'tertial'
type DagvalgModus = 'fixed-weekday' | 'first-weekday'
type ReglerVerdi = {
  regelmessighet: RegelmessighetModus
  dagvalgModus: DagvalgModus
  valgtUkedag: string
  maanedsSteg: string
  intervallModus: IntervallModus
}
type ReglerPatch = Partial<ReglerVerdi>
type AlternativerVerdi = {
  inkluderNesteAar: boolean
  ekskluderHelligdager: boolean
  ekskluderHelg: boolean
  ekskluderSondag: boolean
}
type AlternativerPatch = Partial<AlternativerVerdi>
type BuildValgteDatoerParams = Parameters<typeof buildValgteDatoer>

const TIDER: string[] = Array.from({ length: 24 * 4 }, (_, i) => {
  const h = Math.floor(i / 4)
  const m = (i % 4) * 15
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
})

function getTilgjengeligeTider(forhandsvisDatoer: string[]): string[] {
  // Hvis ingen datoer er valgt, vis alle tider
  if (forhandsvisDatoer.length === 0) return TIDER

  const now = new Date()
  const todayYmd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const harValgtIDagEllerTidligere = forhandsvisDatoer.some((ymd) => ymd <= todayYmd)
  if (!harValgtIDagEllerTidligere) return TIDER

  // Hvis i dag eller tidligere er valgt, kun vis valg frem i tid (minst en time margin)
  const minTime = new Date(now.getTime() + 60 * 60 * 1000)
  const minHour = minTime.getHours()
  const minMinute = Math.ceil(minTime.getMinutes() / 15) * 15

  return TIDER.filter((tid) => {
    const [h, m] = tid.split(':').map(Number)
    return h > minHour || (h === minHour && m >= minMinute)
  })
}

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Behandlingserier | Verdande' }]
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { searchParams } = new URL(request.url)
  const behandlingType = searchParams.get('behandlingType') ?? ''
  const accessToken = await requireAccessToken(request)
  const [behandlingSerier, serieValg, tillateBehandlinger] = await Promise.all([
    getBehandlingSerier(accessToken, behandlingType),
    hentSerieValg(accessToken, behandlingType),
    getTillateBehandlinger(accessToken)
  ])
  return { behandlingSerier, serieValg, tillateBehandlinger }
}

export const action = async ({ request }: Route.ActionArgs) => {
  const accessToken = await requireAccessToken(request)
  const formData = await request.formData()
  const intent = String(formData.get('_intent') ?? '')
  if (intent === 'updatePlanlagtStartet') {
    const behandlingId = String(formData.get('behandlingId') ?? '')
    const behandlingCode = String(formData.get('behandlingCode') ?? '')
    const ymd = String(formData.get('ymd') ?? '')
    const time = String(formData.get('time') ?? '')
    const isoLocalDatetime = `${ymd}T${time}:00`
    await endrePlanlagtStartet(accessToken, behandlingId, isoLocalDatetime)
    return redirect(`/behandlingserie?behandlingType=${behandlingCode}`)
  }
  const behandlingCode = String(formData.get('behandlingCode') ?? '')
  const regelmessighet = String(formData.get('regelmessighet') ?? '')
  const startTid = String(formData.get('startTid') ?? '')
  const opprettetAv = String(formData.get('opprettetAv') ?? 'VERDANDE')
  const valgteDatoerRaw = String(formData.get('valgteDatoer') ?? '[]')
  const valgteDatoer = JSON.parse(valgteDatoerRaw) as string[]
  await opprettBehandlingSerie(accessToken, behandlingCode, regelmessighet, valgteDatoer, startTid, opprettetAv)
  return redirect(`/behandlingserie?behandlingType=${behandlingCode}`)
}

function byggBookedeDatoer(serier: BehandlingSerieDTO[]) {
  const bookedeDatoer: Date[] = []
  const ymdSet = new Set<string>()
  for (const serie of serier || []) {
    for (const beh of (serie.behandlinger || []) as BehandlingInfoDTO[]) {
      if (!beh?.planlagtStartet) continue
      const dt = new Date(beh.planlagtStartet)
      const dato = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
      bookedeDatoer.push(dato)
      ymdSet.add(toYearMonthDay(dato))
    }
  }

  return {
    bookedeDatoer,
    ymdSet,
    antallPerMaaned: tellDatoerPerMaaned([...ymdSet]),
  }
}

export function erDateRange(x: unknown): x is DateRange {
  if (x == null || typeof x !== 'object') return false
  const obj = x as { from?: unknown; to?: unknown }
  const erDato = (v: unknown) => v === undefined || v instanceof Date
  return ('from' in obj || 'to' in obj) && erDato(obj.from) && erDato(obj.to)
}

function SerieVelger({behandlingType, onChange, tillateBehandlinger}: { behandlingType: string; onChange: (value: string) => void; tillateBehandlinger: string[]}) {
  return (
    <HStack>
      <Select label="Velg behandling" value={behandlingType} onChange={(e) => onChange(e.target.value)}>
        <option value="">Velg behandlingstype</option>
        {tillateBehandlinger.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </Select>
    </HStack>
  )
}

function RegelKontroller({ verdi, onChange, serieValg }: { verdi: ReglerVerdi; onChange: (patch: ReglerPatch) => void , serieValg: SerieValg}) {
  const maanedLabel = verdi.dagvalgModus === 'first-weekday' ? 'Hver N. måned (første virkedag)' : 'i antall måneder'
  return (
    <VStack>
      <RadioGroup
        legend="Velg regelmessighet"
        value={verdi.regelmessighet}
        onChange={(v) => onChange({ regelmessighet: v as RegelmessighetModus })}
      >
        {serieValg.enableRangeVelger && (<Radio value="range">Velg en range fra og til</Radio>)}
        <Radio value="multiple">Velg diverse datoer</Radio>
      </RadioGroup>
      {verdi.regelmessighet === 'multiple' && (
        <HStack wrap gap="space-16">
          <Select
            label="Dagvalg"
            value={verdi.dagvalgModus}
            onChange={(e) => {
              const next = e.target.value as DagvalgModus
              onChange({
                dagvalgModus: next,
                valgtUkedag: next === 'first-weekday' ? '' : verdi.valgtUkedag,
              })
            }}
          >
            <option value="fixed-weekday">Fast ukedag</option>
            <option value="first-weekday">Første mulige dag i periode</option>
          </Select>

          {verdi.dagvalgModus === 'fixed-weekday' && (
            <Select
              label="Velg fast ukedag"
              value={verdi.valgtUkedag}
              onChange={(event) => onChange({ valgtUkedag: event.target.value })}
            >
              <option value="">Velg ukedag</option>
              <option value="monday">Mandager</option>
              <option value="tuesday">Tirsdager</option>
              <option value="wednesday">Onsdager</option>
              <option value="thursday">Torsdager</option>
              <option value="friday">Fredager</option>
            </Select>
          )}

          <Select
            label={maanedLabel}
            value={verdi.maanedsSteg}
            onChange={(event) => onChange({ maanedsSteg: event.target.value })}
            disabled={verdi.intervallModus !== ''}
          >
            {verdi.dagvalgModus === 'first-weekday' ? (
              <>
                <option value="">Velg</option>
                <option value="1">Hver måned</option>
                <option value="3">Hver 3. måned</option>
                <option value="6">Hver 6. måned</option>
                <option value="12">Hver 12. måned</option>
              </>
            ) : (
              <>
                <option value="">Velg</option>
                <option value="1">1 måned</option>
                <option value="3">3 måneder</option>
                <option value="6">6 måneder</option>
                <option value="12">12 måneder</option>
              </>
            )}
          </Select>

          <Select
            label="Intervall"
            value={verdi.intervallModus}
            onChange={(e) => onChange({ intervallModus: e.target.value as IntervallModus })}
          >
            <option value="">Ingen</option>
            <option value="quarterly">Hvert kvartal</option>
            <option value="tertial">Hvert tertial</option>
          </Select>
        </HStack>
      )}
    </VStack>
  )
}

function AlternativerRad({
  verdi,
  onChange,
  synlig,
}: {
  verdi: AlternativerVerdi
  onChange: (patch: AlternativerPatch) => void
  synlig: boolean
}) {
  if (!synlig) return null
  return (
    <HStack gap="space-24">
      <Checkbox checked={verdi.inkluderNesteAar} onChange={(e) => onChange({ inkluderNesteAar: e.target.checked })}>
        Inkluder neste år
      </Checkbox>
      <Checkbox
        checked={verdi.ekskluderHelligdager}
        onChange={(e) => onChange({ ekskluderHelligdager: e.target.checked })}
      >
        Ekskluder helligdager
      </Checkbox>
      <Checkbox checked={verdi.ekskluderHelg} onChange={(e) => onChange({ ekskluderHelg: e.target.checked })}>
        Ekskluder helg
      </Checkbox>
      <Checkbox checked={verdi.ekskluderSondag} onChange={(e) => onChange({ ekskluderSondag: e.target.checked })}>
        Ekskluder søndager
      </Checkbox>
    </HStack>
  )
}

function KalenderSeksjon({
  regelmessighet,
  valgtForKalender,
  na,
  horisontSlutt,
  ekskluderHelg,
  deaktiverteDatoer,
  regelAdvarsler,
  onSelect,
  onClear,
  kanTomme,
}: {
  regelmessighet: RegelmessighetModus
  valgtForKalender: Date[] | DateRange | undefined
  na: Date
  horisontSlutt: Date
  ekskluderHelg: boolean
  deaktiverteDatoer: Date[]
  regelAdvarsler: string[]
  onSelect: (v: Utvalg) => void
  onClear: () => void
  kanTomme: boolean
}) {
  return (
    <VStack gap="4">
      {regelAdvarsler.length > 0 && (
        <Alert variant="info" size="small">
          {regelAdvarsler.length === 1 ? (
            regelAdvarsler[0]
          ) : (
            <ul style={{ margin: 0, paddingLeft: '1rem' }}>
              {regelAdvarsler.map((advarsel) => (
                <li key={advarsel}>{advarsel}</li>
              ))}
            </ul>
          )}
        </Alert>
      )}
      {regelmessighet === 'multiple' ? (
        <DatePicker.Standalone
          key={`multiple-${horisontSlutt.getFullYear()}`}
          mode="multiple"
          selected={valgtForKalender as Date[] | undefined}
          fromDate={na}
          toDate={horisontSlutt}
          dropdownCaption
          showWeekNumber
          disableWeekends={ekskluderHelg}
          disabled={deaktiverteDatoer}
          onSelect={(v) => onSelect(v as Date[] | undefined)}
        />
      ) : (
        <DatePicker.Standalone
          key={`range-${horisontSlutt.getFullYear()}`}
          mode="range"
          selected={valgtForKalender as DateRange | undefined}
          fromDate={na}
          toDate={horisontSlutt}
          dropdownCaption
          showWeekNumber
          disableWeekends={ekskluderHelg}
          disabled={deaktiverteDatoer}
          onSelect={(v) => onSelect(v as DateRange | undefined)}
        />
      )}
      <Button
        variant="secondary"
        size="small"
        onClick={onClear}
        disabled={!kanTomme}
        style={{ alignSelf: 'flex-start' }}
      >
        Avvelg alle datoer
      </Button>
    </VStack>
  )
}

function EndreDialog({
  apen,
  lukk,
  element,
  horisontSlutt,
  ekskluderHelg,
  deaktiverteDatoer,
  onSave,
}: {
  apen: boolean
  lukk: () => void
  element: PlannedItem | null
  horisontSlutt: Date
  ekskluderHelg: boolean
  deaktiverteDatoer: Date[]
  onSave: (ymd: string, time: string) => void
}) {
  const [dato, setDato] = useState<Date | undefined>()
  const [tid, setTid] = useState<string>('')
  const [input, setInput] = useState('')
  const headingId = useId()
  const navigate = useNavigate()

  const tilgjengeligeTiderDialog = useMemo(() => {
    if (!dato) return TIDER
    return getTilgjengeligeTider([toYearMonthDay(dato)])
  }, [dato])

  useEffect(() => {
    if (!element) return
    const [year, month, day] = element.yearMonthDay.split('-').map(Number)
    const d = new Date(year, (month ?? 1) - 1, day ?? 1)
    setDato(d)
    setTid(element.time ?? '10:00')
  }, [element])

  useEffect(() => {
    if (tid && !tilgjengeligeTiderDialog.includes(tid)) {
      setTid(tilgjengeligeTiderDialog[0] ?? '')
    }
  }, [tilgjengeligeTiderDialog, tid])

  useEffect(() => {
    setInput(
      dato ? new Intl.DateTimeFormat('no-NO', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(dato) : '',
    )
  }, [dato])

  function parseNoDate(value: string): Date | undefined {
    const match = value.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
    if (!match) return undefined
    const day = Number(match[1]),
      month = Number(match[2]),
      year = Number(match[3])
    const date = new Date(year, month - 1, day)
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return undefined
    return date
  }

  return (
    <Modal open={apen} onClose={lukk} aria-labelledby={headingId}>
      <Modal.Header>
        <Heading size="small" level="2" id={headingId}>
          {(() => {
            if (!element) return 'Endre planlagt kjøring'
            const [year, month, day] = element.yearMonthDay.split('-').map(Number)
            const d = new Date(year, (month ?? 1) - 1, day ?? 1)
            const dateStr = new Intl.DateTimeFormat('no-NO', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }).format(d)
            const timeStr = element.time ? ` kl ${element.time}` : ''
            return `Planlagt kjøring ${dateStr}${timeStr}`
          })()}
        </Heading>
      </Modal.Header>
      <Modal.Body>
        <VStack gap="space-16">
          <HStack gap="space-16" wrap>
            <DatePicker
              mode="single"
              selected={dato}
              fromDate={new Date()}
              toDate={horisontSlutt}
              disableWeekends={ekskluderHelg}
              disabled={deaktiverteDatoer}
              onSelect={(d) => setDato(d ?? undefined)}
            >
              <DatePicker.Input
                label="Ny dato"
                value={input}
                onChange={(e) => {
                  const v = e.target.value
                  setInput(v)
                  setDato(parseNoDate(v))
                }}
              />
            </DatePicker>

            <Select label="Tid" value={tid} onChange={(e) => setTid(e.target.value)}>
              {tilgjengeligeTiderDialog.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </HStack>

          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {element?.behandlingId} {element?.behandlingCode ? `• ${element?.behandlingCode}` : ''}{' '}
            {element?.serieId ? ` • Serie ${element.serieId}` : ''}
          </div>
        </VStack>
      </Modal.Body>
      <Modal.Footer>
        <HStack gap="space-8">
          <Button onClick={() => dato && tid && onSave(toYearMonthDay(dato), tid)} disabled={!dato || !tid}>
            Lagre dato
          </Button>
          <Button variant="secondary" onClick={lukk}>
            Lukk
          </Button>
          <Button
            variant="tertiary"
            icon={<ExternalLinkIcon aria-hidden />}
            onClick={() => navigate(`/behandling/${element?.behandlingId}`)}
          >
            Gå til behandling
          </Button>
        </HStack>
      </Modal.Footer>
    </Modal>
  )
}

export default function BehandlingOpprett_index({ loaderData }: Route.ComponentProps) {
  const [now] = useState(() => new Date())
  const [inkluderNesteAar, setInkluderNesteAar] = useState(false)
  const horisontSlutt = useMemo(() => {
    const year = new Date().getFullYear() + (inkluderNesteAar ? 1 : 0)
    return new Date(year, 11, 31)
  }, [inkluderNesteAar])

  const [regelmessighet, setRegelmessighet] = useState<RegelmessighetModus>('range')
  const [utvalg, setUtvalg] = useState<Utvalg>(undefined)
  const [valgtTid, setValgtTid] = useState('')
  const [dagvalgModus, setDagvalgModus] = useState<DagvalgModus>('fixed-weekday')
  const [valgtUkedag, setValgtUkedag] = useState('')
  const [maanedsSteg, setMaanedsSteg] = useState('')
  const [intervallModus, setIntervallModus] = useState<IntervallModus>('')
  const [ekskluderHelg, setEkskluderHelg] = useState(true)
  const [ekskluderHelligdager, setEkskluderHelligdager] = useState(true)
  const [ekskluderSondag, setEkskluderSondag] = useState(true)

  const createFetcher = useFetcher()
  const [searchParams, setSearchParams] = useSearchParams()
  const [behandlingType, setBehandlingType] = useState(searchParams.get('behandlingType') || '')
  const { behandlingSerier, serieValg, tillateBehandlinger } = loaderData

  const helligdagsdata = useMemo(() => byggHelligdagsdata(inkluderNesteAar), [inkluderNesteAar])
  const booketData = useMemo(() => byggBookedeDatoer(behandlingSerier || []), [behandlingSerier])

  useEffect(() => {
    if (regelmessighet !== 'multiple') return
    const idag = new Date()
    idag.setHours(0, 0, 0, 0)

    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

    const timeAfterNowToday = (timeHHmm: string): boolean => {
      if (!timeHHmm) return false
      const [hh, mm] = timeHHmm.split(':').map(Number)
      const candidate = new Date(idag.getFullYear(), idag.getMonth(), idag.getDate(), hh || 0, mm || 0, 0, 0)
      return candidate.getTime() > Date.now()
    }

    const monthStart = new Date(idag.getFullYear(), idag.getMonth(), 1)
    const firstBusinessThisMonth = firstPossibleDayOnOrAfter(
      monthStart,
      helligdagsdata.yearMonthDaySet,
      ekskluderHelg,
      ekskluderHelligdager,
      ekskluderSondag,
    )
    const includeCurrentMonth = isSameDay(idag, firstBusinessThisMonth) && timeAfterNowToday(valgtTid)
    const nextMonthStart = new Date(idag.getFullYear(), idag.getMonth() + 1, 1)

    const quarterStart = new Date(idag.getFullYear(), Math.floor(idag.getMonth() / 3) * 3, 1)
    const firstBusinessThisQuarter = firstPossibleDayOnOrAfter(
      quarterStart,
      helligdagsdata.yearMonthDaySet,
      ekskluderHelg,
      ekskluderHelligdager,
      ekskluderSondag,
    )
    const includeCurrentQuarter = isSameDay(idag, firstBusinessThisQuarter) && timeAfterNowToday(valgtTid)
    const nextQuarterStart = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 1)

    const tertialAnchorMonths = [0, 4, 8]
    const currentTertialMonth = tertialAnchorMonths.reduce((p, m) => (idag.getMonth() >= m ? m : p), 0)
    const tertialStart = new Date(idag.getFullYear(), currentTertialMonth, 1)
    const firstBusinessThisTertial = firstPossibleDayOnOrAfter(
      tertialStart,
      helligdagsdata.yearMonthDaySet,
      ekskluderHelg,
      ekskluderHelligdager,
      ekskluderSondag,
    )
    const includeCurrentTertial = isSameDay(idag, firstBusinessThisTertial) && timeAfterNowToday(valgtTid)
    const nextTertialStart = new Date(tertialStart.getFullYear(), tertialStart.getMonth() + 4, 1)

    let datoer: Date[] = []

    if (dagvalgModus === 'first-weekday') {
      if (intervallModus === 'quarterly') {
        const base = includeCurrentQuarter ? quarterStart : nextQuarterStart
        datoer = quarterlyStartDates(base, horisontSlutt).map((start) =>
          firstPossibleDayOnOrAfter(
            start,
            helligdagsdata.yearMonthDaySet,
            ekskluderHelg,
            ekskluderHelligdager,
            ekskluderSondag,
          ),
        )
      } else if (intervallModus === 'tertial') {
        const base = includeCurrentTertial ? tertialStart : nextTertialStart
        datoer = tertialStartDates(base, horisontSlutt).map((start) =>
          firstPossibleDayOnOrAfter(
            start,
            helligdagsdata.yearMonthDaySet,
            ekskluderHelg,
            ekskluderHelligdager,
            ekskluderSondag,
          ),
        )
      } else if (maanedsSteg) {
        const m = parseInt(maanedsSteg, 10)
        if (m > 0) {
          const base = includeCurrentMonth ? monthStart : nextMonthStart
          const starts = monthlyAnchoredStartDates(base, m, horisontSlutt)
          datoer = starts.map((start) =>
            firstPossibleDayOnOrAfter(
              start,
              helligdagsdata.yearMonthDaySet,
              ekskluderHelg,
              ekskluderHelligdager,
              ekskluderSondag,
            ),
          )
        }
      }
    } else {
      if (!valgtUkedag) return
      const ukedagNummer = getWeekdayNumber(valgtUkedag)
      if (ukedagNummer == null) return
      if (intervallModus === 'quarterly') {
        datoer = quarterlyStartDates(quarterStart, horisontSlutt).map((start) => firstWeekdayOnOrAfter(start, ukedagNummer))
      } else if (intervallModus === 'tertial') {
        datoer = tertialStartDates(tertialStart, horisontSlutt).map((start) => firstWeekdayOnOrAfter(start, ukedagNummer))
      } else if (maanedsSteg) {
        const m = parseInt(maanedsSteg, 10)
        if (m > 0) {
          const slutt = addMonths(idag, m)
          const klippetSlutt = slutt > horisontSlutt ? horisontSlutt : slutt
          datoer = allWeekdaysInRange(ukedagNummer, idag, klippetSlutt)
        }
      }
    }

    const endeligeDatoer =
      dagvalgModus === 'fixed-weekday' && !intervallModus && ekskluderHelg
        ? datoer.filter((d) => d.getDay() !== 0 && d.getDay() !== 6)
        : datoer

    setUtvalg(endeligeDatoer)
  }, [
    regelmessighet,
    dagvalgModus,
    valgtUkedag,
    maanedsSteg,
    intervallModus,
    ekskluderHelg,
    horisontSlutt,
    valgtTid,
    helligdagsdata.yearMonthDaySet,
    ekskluderHelligdager,
    ekskluderSondag,
  ])

  useEffect(() => {
    if (!serieValg.enableRangeVelger && regelmessighet === 'range') {
      setRegelmessighet('multiple')
    }
  }, [serieValg.enableRangeVelger, regelmessighet])

  const oppdaterBehandlingType = useCallback(
    (value: string) => {
      setBehandlingType(value)
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev)
        if (value) params.set('behandlingType', value)
        else params.delete('behandlingType')
        return params
      })
    },
    [setSearchParams],
  )

  const valgtForKalender = useMemo<Date[] | DateRange | undefined>(() => {
    if (regelmessighet === 'multiple') return Array.isArray(utvalg) ? utvalg : []
    return erDateRange(utvalg) ? utvalg : undefined
  }, [regelmessighet, utvalg])

  const forhandsvisDatoer = useMemo(() => {
    const base = buildValgteDatoer(
      utvalg as BuildValgteDatoerParams[0],
      regelmessighet as BuildValgteDatoerParams[1],
      {
        ekskluderHelg,
        ekskluderHelligdager,
        ekskluderSondag,
        endOfHorizon: horisontSlutt,
        helligdagerYearMonthDaySet: helligdagsdata.yearMonthDaySet,
      } as BuildValgteDatoerParams[2],
    )

    return filtrerDatoerMedRegler({
      datoer: base,
      booketYmdSet: booketData.ymdSet,
      antallPerMaaned: booketData.antallPerMaaned,
      serieValg: serieValg,
    })
  }, [
    utvalg,
    regelmessighet,
    ekskluderHelg,
    horisontSlutt,
    helligdagsdata.yearMonthDaySet,
    ekskluderHelligdager,
    booketData.ymdSet,
    booketData.antallPerMaaned,
    ekskluderSondag,
    serieValg,
  ])

  const tilgjengeligeTider = useMemo(() => getTilgjengeligeTider(forhandsvisDatoer), [forhandsvisDatoer])

  useEffect(() => {
    if (valgtTid && !tilgjengeligeTider.includes(valgtTid)) {
      setValgtTid('')
    }
  }, [tilgjengeligeTider, valgtTid])

  const kanLagre = Boolean(behandlingType && valgtTid && forhandsvisDatoer.length > 0)

  const lagreSerie = useCallback(() => {
    const formData = new FormData()
    formData.set('behandlingCode', behandlingType ?? '')
    formData.set('regelmessighet', regelmessighet)
    formData.set('valgteDatoer', JSON.stringify(forhandsvisDatoer))
    formData.set('startTid', valgtTid)
    formData.set('opprettetAv', 'VERDANDE')
    createFetcher.submit(formData, { method: 'post' })
  }, [behandlingType, regelmessighet, forhandsvisDatoer, valgtTid, createFetcher])

  const toemAlt = useCallback(() => {
    if (regelmessighet === 'multiple') setUtvalg([])
    else setUtvalg(undefined)
  }, [regelmessighet])

  const totaltPerMaaned = useMemo(
    () => tellDatoerPerMaaned(forhandsvisDatoer, booketData.antallPerMaaned),
    [booketData.antallPerMaaned, forhandsvisDatoer],
  )

  const deaktiverteDatoer = useMemo(() => {
    const disabled = buildDisabledDates({
      fromDate: now,
      toDate: horisontSlutt,
      bookedDates: booketData.bookedeDatoer,
      helligdagsdatoer: helligdagsdata.holidayDates,
      serieValg: serieValg,
      antallPerMaaned: totaltPerMaaned,
      ekskluderHelg,
      ekskluderHelligdager,
      ekskluderSondag,
    })

    const selectedYmdSet = new Set(forhandsvisDatoer)
    return disabled.filter((date) => !selectedYmdSet.has(toYearMonthDay(date)))
  }, [
    now,
    horisontSlutt,
    booketData.bookedeDatoer,
    totaltPerMaaned,
    helligdagsdata.holidayDates,
    serieValg,
    ekskluderHelg,
    ekskluderHelligdager,
    ekskluderSondag,
    forhandsvisDatoer,
  ])

  const planlagteElementer: PlannedItem[] = useMemo(() => {
    const items: PlannedItem[] = []
    for (const serie of behandlingSerier ?? []) {
      for (const behandling of serie.behandlinger ?? []) {
        if (!behandling?.planlagtStartet) continue
        const dt = new Date(behandling.planlagtStartet)
        const yearMonthDay = toYearMonthDay(dt)
        const time = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`
        items.push({
          id: behandling.behandlingId?.toString() ?? `${yearMonthDay}-${time}`,
          yearMonthDay,
          time,
          status: behandling.status,
          behandlingId: behandling.behandlingId?.toString(),
          behandlingCode: behandling.behandlingCode,
          serieId: serie.behandlingSerieId?.toString(),
        })
      }
    }
    return items.sort((a, b) => (a.yearMonthDay + (a.time ?? '') < b.yearMonthDay + (b.time ?? '') ? -1 : 1))
  }, [behandlingSerier])

  const [dialogApen, setDialogApen] = useState(false)
  const [redigeres, setRedigeres] = useState<PlannedItem | null>(null)
  const oppdaterFetcher = useFetcher()

  const apneEndre = useCallback((item: PlannedItem) => {
    setRedigeres(item)
    setDialogApen(true)
  }, [])

  const lagreEndring = useCallback(
    (ymd: string, time: string) => {
      if (!redigeres) return
      const formData = new FormData()
      formData.set('_intent', 'updatePlanlagtStartet')
      formData.set('behandlingId', redigeres.behandlingId ?? '')
      formData.set('behandlingCode', redigeres.behandlingCode ?? '')
      formData.set('ymd', ymd)
      formData.set('time', time)
      oppdaterFetcher.submit(formData, { method: 'post' })
      setDialogApen(false)
    },
    [redigeres, oppdaterFetcher],
  )

  return (
    <VStack gap="space-24">
      <Heading size="medium" level="1">
        Behandlingserie
      </Heading>
      <SerieVelger behandlingType={behandlingType} tillateBehandlinger={tillateBehandlinger} onChange={oppdaterBehandlingType} />
      {behandlingType !== '' && (
        <>
          <Heading size="medium" level="1">
            Eksisterende planlagte behandlinger
          </Heading>
          <PlanlagteDatoerPreview items={planlagteElementer} onClickItem={apneEndre} />

          <Heading size="medium" level="1">
            Opprett ny serie
          </Heading>

          <HStack>
            <Select
              label="Velg når på døgnet behandlingen skal kjøres"
              value={valgtTid}
              onChange={(e) => setValgtTid(e.target.value)}
            >
              <option value="">Velg tid</option>
              {tilgjengeligeTider.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </HStack>

          <RegelKontroller
            verdi={{ regelmessighet, dagvalgModus, valgtUkedag, maanedsSteg, intervallModus }}
            serieValg={serieValg}
            onChange={(patch) => {
              if (patch.regelmessighet !== undefined) {
                setRegelmessighet(patch.regelmessighet)
                setUtvalg(patch.regelmessighet === 'multiple' ? [] : undefined)
              }
              if (patch.dagvalgModus !== undefined) setDagvalgModus(patch.dagvalgModus)
              if (patch.valgtUkedag !== undefined) setValgtUkedag(patch.valgtUkedag)
              if (patch.maanedsSteg !== undefined) setMaanedsSteg(patch.maanedsSteg)
              if (patch.intervallModus !== undefined) setIntervallModus(patch.intervallModus)
            }}
          />

          <AlternativerRad
            verdi={{ inkluderNesteAar, ekskluderHelligdager, ekskluderHelg, ekskluderSondag }}
            onChange={(patch) => {
              if (patch.inkluderNesteAar !== undefined) setInkluderNesteAar(patch.inkluderNesteAar)
              if (patch.ekskluderHelligdager !== undefined) setEkskluderHelligdager(patch.ekskluderHelligdager)
              if (patch.ekskluderHelg !== undefined) setEkskluderHelg(patch.ekskluderHelg)
              if (patch.ekskluderSondag !== undefined) setEkskluderSondag(patch.ekskluderSondag)
            }}
            synlig={regelmessighet === 'range' || regelmessighet === 'multiple'}
          />

          <KalenderSeksjon
            regelmessighet={regelmessighet}
            valgtForKalender={valgtForKalender}
            na={now}
            horisontSlutt={horisontSlutt}
            ekskluderHelg={ekskluderHelg}
            deaktiverteDatoer={deaktiverteDatoer}
            regelAdvarsler={byggRegelAdvarsler(serieValg)}
            onSelect={setUtvalg}
            onClear={toemAlt}
            kanTomme={
              (regelmessighet === 'multiple' && Array.isArray(utvalg) && utvalg.length > 0) ||
              (regelmessighet === 'range' && erDateRange(utvalg))
            }
          />

          <ValgteDatoerPreview yearMonthDayDates={forhandsvisDatoer} time={valgtTid} />

          <HStack>
            <Button
              type="button"
              onClick={lagreSerie}
              loading={createFetcher.state === 'submitting'}
              disabled={!kanLagre}
            >
              Lagre serie
            </Button>
          </HStack>

          <EndreDialog
            apen={dialogApen}
            lukk={() => setDialogApen(false)}
            element={redigeres}
            horisontSlutt={horisontSlutt}
            ekskluderHelg={ekskluderHelg}
            deaktiverteDatoer={deaktiverteDatoer}
            onSave={lagreEndring}
          />
        </>
      )}
    </VStack>
  )
}
