import {
  BodyShort,
  Box,
  Button,
  DatePicker,
  Detail,
  Heading,
  HStack,
  Label,
  Page,
  Select,
  Skeleton,
  useRangeDatepicker,
  VStack,
} from '@navikt/ds-react'
import { sub } from 'date-fns'
import React, { Suspense } from 'react'
import { isRouteErrorResponse, Outlet, useSearchParams } from 'react-router'
import type { DateRange } from '~/behandlingserie/seriekalenderUtils'
import { toIsoDate } from '~/common/date'
import { decodeBehandling } from '~/common/decodeBehandling'
import type { Route } from './+types/route'

const OpprettetChart = React.lazy(() => import('./components/OpprettetChart'))

import { apiGet } from '~/services/api.server'
import { env as serverEnv } from '~/services/env.server'
import { logger } from '~/services/logger.server'
import type { TidsserieResponse } from './types'
import { formaterTimestamp, normalizePeriodToDate } from './utils/formattering'
import { parseAnalyseParams } from './utils/parseAnalyseParams'

const behandlingstyper = [
  'FleksibelApSak',
  'OppdaterFodselsnummer',
  'ForelderBarnMelding',
  'OppdaterFoedselsdato',
  'SivilstandAnnulleringMelding',
  'AldersovergangOverforBruker',
  'VarselUtsending',
  'OpptjeningArligOppdaterPerson',
  'VurderRelevanse',
  'SivilstandsMelding',
  'AldersovergangBehandleBruker',
  'AldersovergangDistribuerOrienteringsbrev',
  'IverksettVedtak',
  'Dodsmelding',
  'HaandterSkattehendelse',
  'ReguleringFamilie',
  'OpptjeningsendringAarligAlder',
]

/** Velg passende aggregeringsnivå basert på tidsperioden */
function velgAggregering(fom: string, tom: string): string {
  const from = new Date(fom)
  const to = new Date(tom)
  const diffMs = to.getTime() - from.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffHours / 24

  if (diffHours <= 3) return 'MINUTT'
  if (diffDays <= 3) return 'TIME'
  if (diffDays <= 31) return 'DAG'
  if (diffDays <= 180) return 'UKE'
  if (diffDays <= 730) return 'MAANED'
  if (diffDays <= 1825) return 'KVARTAL'
  return 'AAR'
}

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Behandlingsanalyse | Verdande' }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const { behandlingType, fom, tom, aggregering, paramsAgg } = parseAnalyseParams(request)

  let tidsserie: TidsserieResponse | null = null
  try {
    tidsserie = await apiGet<TidsserieResponse>(`/api/behandling/analyse/tidsserie?${paramsAgg}`, request)
  } catch (e) {
    logger.warn(`Analyse tidsserie feilet: ${String(e)}`)
  }

  return { behandlingType, fom, tom, aggregering, tidsserie, erProd: serverEnv.env === 'p' }
}

export function shouldRevalidate({ currentUrl, nextUrl }: { currentUrl: URL; nextUrl: URL }) {
  return currentUrl.search !== nextUrl.search
}

export default function AnalyseLayout({ loaderData }: Route.ComponentProps) {
  const { behandlingType, fom, tom, aggregering, tidsserie, erProd } = loaderData
  const [searchParams, setSearchParams] = useSearchParams()

  // Sørg for at behandlingType alltid er i URL-parametere
  React.useEffect(() => {
    if (!searchParams.has('behandlingType')) {
      const next = new URLSearchParams(searchParams)
      next.set('behandlingType', behandlingType)
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, behandlingType, setSearchParams])

  function updateSearchParams(updates: Record<string, string>) {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(updates)) {
      next.set(key, value)
    }
    setSearchParams(next)
  }

  function onRangeChange(val?: DateRange) {
    if (val?.from && val.to) {
      const newFom = toIsoDate(val.from)
      const newTom = toIsoDate(val.to)
      const currentFomDate = (searchParams.get('fom') || '').split('T')[0]
      const currentTomDate = (searchParams.get('tom') || '').split('T')[0]
      if (newFom !== currentFomDate || newTom !== currentTomDate) {
        updateSearchParams({ fom: newFom, tom: newTom })
      }
    }
  }

  const { datepickerProps, fromInputProps, toInputProps, setSelected } = useRangeDatepicker({
    defaultSelected: { from: new Date(fom), to: new Date(tom) },
    required: true,
    onRangeChange,
  })

  // Sync datepicker when fom/tom changes from outside (chart drag, presets)
  const setSelectedRef = React.useRef(setSelected)
  setSelectedRef.current = setSelected
  const prevFomTom = React.useRef(`${fom}|${tom}`)
  React.useEffect(() => {
    const key = `${fom}|${tom}`
    if (key !== prevFomTom.current) {
      prevFomTom.current = key
      setSelectedRef.current({ from: new Date(fom.split('T')[0]), to: new Date(tom.split('T')[0]) })
    }
  }, [fom, tom])

  function applyPeriod(nextFrom: string, nextTo: string, autoAggregering = true) {
    // Normalize partial period strings (YYYY-MM, YYYY) to full YYYY-MM-DD
    const fromDate = normalizePeriodToDate(nextFrom, 'start')
    const toDate = normalizePeriodToDate(nextTo, 'end')
    setSelectedRef.current({ from: new Date(fromDate), to: new Date(toDate) })
    const updates: Record<string, string> = { fom: fromDate, tom: toDate }
    if (autoAggregering) {
      updates.aggregering = velgAggregering(fromDate, toDate)
    }
    updateSearchParams(updates)
  }

  function presetLastNDays(n: number) {
    const now = new Date()
    applyPeriod(toIsoDate(sub(now, { days: n - 1 })), toIsoDate(now))
  }

  function presetThisYear() {
    const now = new Date()
    applyPeriod(`${now.getFullYear()}-01-01`, toIsoDate(now))
  }

  function presetAllTime() {
    applyPeriod('2000-01-01', toIsoDate(new Date()))
  }

  return (
    <Page.Block>
      <VStack gap="space-24" paddingBlock="space-32">
        <VStack gap="space-8">
          <Heading level="1" size="large">
            Behandlingsanalyse – {decodeBehandling(`${behandlingType}Behandling`)}
          </Heading>
          <BodyShort size="small" textColor="subtle">
            Oversikt over behandlingsforløp, ytelse og kvalitet. Bruk filtrene under for å velge behandlingstype,
            tidsrom og aggregeringsnivå.
          </BodyShort>
        </VStack>

        <Box>
          <VStack gap="space-16">
            <Heading level="2" size="small">
              Søkekriterier
            </Heading>
            <HStack gap="space-16" wrap align="end">
              <Box style={{ minWidth: '220px' }}>
                <Select
                  label="Behandlingstype"
                  size="small"
                  value={behandlingType}
                  onChange={(e) => updateSearchParams({ behandlingType: e.target.value })}
                >
                  {behandlingstyper.map((bt) => (
                    <option key={bt} value={bt}>
                      {decodeBehandling(`${bt}Behandling`)}
                    </option>
                  ))}
                </Select>
              </Box>

              <Box style={{ minWidth: '180px' }}>
                <Select
                  label="Kravbehandlingstype"
                  size="small"
                  value={searchParams.get('kravBehandlingType') || ''}
                  onChange={(e) => {
                    const next = new URLSearchParams(searchParams)
                    if (e.target.value) {
                      next.set('kravBehandlingType', e.target.value)
                    } else {
                      next.delete('kravBehandlingType')
                    }
                    setSearchParams(next)
                  }}
                >
                  <option value="">Alle</option>
                  <option value="AUTO">Automatisk</option>
                  <option value="DEL_AUTO">Del-automatisk</option>
                  <option value="MAN">Manuell</option>
                </Select>
              </Box>

              <DatePicker {...datepickerProps}>
                <HStack gap="space-16">
                  <DatePicker.Input size="small" {...fromInputProps} label="Fra dato" />
                  <DatePicker.Input size="small" {...toInputProps} label="Til dato" />
                </HStack>
              </DatePicker>

              <VStack gap="space-8">
                <Label size="small">Hurtigvalg</Label>
                <HStack gap="space-8">
                  <Button size="small" variant="secondary" onClick={() => presetLastNDays(7)}>
                    7 dager
                  </Button>
                  <Button size="small" variant="secondary" onClick={() => presetLastNDays(30)}>
                    30 dager
                  </Button>
                  <Button size="small" variant="secondary" onClick={() => presetLastNDays(90)}>
                    90 dager
                  </Button>
                  <Button size="small" variant="secondary" onClick={() => presetLastNDays(365)}>
                    1 år
                  </Button>
                  <Button size="small" variant="secondary" onClick={presetThisYear}>
                    Hittil i år
                  </Button>
                  <Button size="small" variant="secondary" onClick={presetAllTime}>
                    Hele historikken
                  </Button>
                </HStack>
              </VStack>

              <Box style={{ minWidth: '140px' }}>
                <Select
                  label="Tidsintervall"
                  size="small"
                  value={aggregering}
                  onChange={(e) => updateSearchParams({ aggregering: e.target.value })}
                >
                  <option value="MINUTT">Minutt</option>
                  <option value="TIME">Time</option>
                  <option value="DAG">Dag</option>
                  <option value="UKE">Uke</option>
                  <option value="MAANED">Måned</option>
                  <option value="KVARTAL">Kvartal</option>
                  <option value="AAR">År</option>
                </Select>
              </Box>
            </HStack>
          </VStack>
        </Box>

        {(fom.includes('T') || tom.includes('T')) && (
          <Detail textColor="subtle">
            Valgt periode: {formaterTimestamp(fom)} – {formaterTimestamp(tom)}
          </Detail>
        )}

        {tidsserie?.datapunkter && tidsserie.datapunkter.length > 0 && (
          <VStack gap="space-8">
            <Heading level="2" size="small">
              Opprettede behandlinger over tid
            </Heading>
            <HStack gap="space-8" align="center" justify="space-between">
              <BodyShort size="small" textColor="subtle">
                Antall behandlinger opprettet per periode, uavhengig av status.
              </BodyShort>
              <BodyShort size="small" textColor="subtle" style={{ whiteSpace: 'nowrap' }}>
                Dra i grafen for å velge tidsperiode
              </BodyShort>
            </HStack>
            <Suspense fallback={<Skeleton variant="rounded" width="100%" height={200} />}>
              <OpprettetChart data={tidsserie.datapunkter} onRangeSelect={applyPeriod} />
            </Suspense>
          </VStack>
        )}

        <Outlet context={{ erProd }} />
      </VStack>
    </Page.Block>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let status = 500
  let statusText = 'Ukjent feil'
  let message: string | undefined
  let detail: string | undefined

  if (isRouteErrorResponse(error)) {
    status = error.status
    statusText = error.statusText
    const d = typeof error.data === 'object' && error.data ? (error.data as Record<string, unknown>) : null
    message = typeof d?.message === 'string' ? d.message : undefined
    detail = typeof d?.detail === 'string' ? d.detail : undefined
    if (!message && typeof error.data === 'string') {
      detail = error.data
    }
  } else if (error instanceof Error) {
    statusText = 'Feil'
    message = error.message
  }

  return (
    <Page.Block>
      <Box paddingBlock="space-32">
        <VStack gap="space-16">
          <Heading level="1" size="large">
            {status} {statusText}
          </Heading>
          {message && <BodyShort>{message}</BodyShort>}
          {detail && <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto' }}>{detail}</pre>}
        </VStack>
      </Box>
    </Page.Block>
  )
}
