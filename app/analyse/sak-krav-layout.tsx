import {
  BodyShort,
  Box,
  Button,
  DatePicker,
  Detail,
  Heading,
  HStack,
  Label,
  Select,
  Skeleton,
  UNSAFE_Combobox,
  useDatepicker,
  VStack,
} from '@navikt/ds-react'
import { sub } from 'date-fns'
import React, { Suspense } from 'react'
import { useSearchParams } from 'react-router'
import { toIsoDate } from '~/common/date'
import type { Route } from './+types/sak-krav-layout'
import SectionTabLayout from './SectionTabLayout'
import type { KravTidsserieResponse, TidsserieDatapunkt } from './types'
import { formaterTimestamp, normalizePeriodToDate } from './utils/formattering'
import { parseSakAnalyseParams } from './utils/parseSakAnalyseParams'

const OpprettetChart = React.lazy(() => import('./components/OpprettetChart'))

import { apiGet } from '~/services/api.server'
import { logger } from '~/services/logger.server'

const sakTypeOptions = ['ALDER', 'UFOREP', 'GJENL', 'BARNEP'] as const
const kravGjelderOptions = [
  'FORSTEGANGSKRAV',
  'F_BH_MED_FORELDET',
  'F_BH_BO_UTL',
  'REVURDERING',
  'FORSTEG_BH',
  'REVURD',
  'NY_RETT',
  'ENDRING',
] as const
const behandlingTypeOptions = ['AUTO', 'DEL_AUTO', 'MAN'] as const
const behandlingTypeLabels: Record<string, string> = {
  AUTO: 'Automatisk',
  DEL_AUTO: 'Del-automatisk',
  MAN: 'Manuell',
}

const faner = [
  { value: 'krav', label: 'Kravstatistikk' },
  { value: 'behandlingstid', label: 'Behandlingstid' },
] as const

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

export async function loader({ request }: Route.LoaderArgs) {
  const { fom, tom, aggregering, sakTyper, kravGjelderListe, behandlingstyper, paramsAgg } =
    parseSakAnalyseParams(request)

  let kravTidsserie: KravTidsserieResponse | null = null
  try {
    kravTidsserie = await apiGet<KravTidsserieResponse>(`/api/sak/analyse/krav-tidsserie?${paramsAgg}`, request)
  } catch (e) {
    logger.warn(`Sak-krav tidsserie feilet: ${String(e)}`)
  }

  return { fom, tom, aggregering, sakTyper, kravGjelderListe, behandlingstyper, kravTidsserie }
}

export function shouldRevalidate({ currentUrl, nextUrl }: { currentUrl: URL; nextUrl: URL }) {
  return currentUrl.search !== nextUrl.search
}

export default function SakKravLayout({ loaderData }: Route.ComponentProps) {
  const { fom, tom, aggregering, sakTyper, kravGjelderListe, behandlingstyper, kravTidsserie } = loaderData
  const [searchParams, setSearchParams] = useSearchParams()

  function updateSearchParams(updates: Record<string, string | string[]>) {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(updates)) {
      next.delete(key)
      if (Array.isArray(value)) {
        for (const v of value) next.append(key, v)
      } else if (value) {
        next.set(key, value)
      }
    }
    setSearchParams(next)
  }

  function onFomChange(date: Date | undefined) {
    if (date) {
      const newFom = toIsoDate(date)
      if (newFom !== (searchParams.get('fom') || '').split('T')[0]) {
        updateSearchParams({ fom: newFom })
      }
    }
  }

  function onTomChange(date: Date | undefined) {
    if (date) {
      const newTom = toIsoDate(date)
      if (newTom !== (searchParams.get('tom') || '').split('T')[0]) {
        updateSearchParams({ tom: newTom })
      }
    }
  }

  const fomPicker = useDatepicker({
    defaultSelected: new Date(fom),
    onDateChange: onFomChange,
  })

  const tomPicker = useDatepicker({
    defaultSelected: new Date(tom),
    onDateChange: onTomChange,
  })

  const fomSetSelected = React.useRef(fomPicker.setSelected)
  fomSetSelected.current = fomPicker.setSelected
  const tomSetSelected = React.useRef(tomPicker.setSelected)
  tomSetSelected.current = tomPicker.setSelected
  const prevFomTom = React.useRef(`${fom}|${tom}`)
  React.useEffect(() => {
    const key = `${fom}|${tom}`
    if (key !== prevFomTom.current) {
      prevFomTom.current = key
      fomSetSelected.current(new Date(fom.split('T')[0]))
      tomSetSelected.current(new Date(tom.split('T')[0]))
    }
  }, [fom, tom])

  function applyPeriod(nextFrom: string, nextTo: string, autoAggregering = true) {
    const fromDate = normalizePeriodToDate(nextFrom, 'start')
    const toDate = normalizePeriodToDate(nextTo, 'end')
    fomSetSelected.current(new Date(fromDate))
    tomSetSelected.current(new Date(toDate))
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

  // Map krav-tidsserie til data per behandlingstype for stacked area chart
  const chartData: TidsserieDatapunkt[] = React.useMemo(
    () =>
      (kravTidsserie?.datapunkter ?? []).map((d) => ({
        periodeFra: d.periodeFra,
        status: d.behandlingType,
        antall: d.antall,
      })),
    [kravTidsserie],
  )

  return (
    <VStack gap="space-24">
      <VStack gap="space-8">
        <Heading level="2" size="medium">
          Sak & Krav
        </Heading>
        <BodyShort size="small" textColor="subtle">
          Analyser basert på saker, krav og vedtak. Bruk filtrene under for å velge sakstype, kravtype, tidsrom og
          aggregeringsnivå.
        </BodyShort>
      </VStack>

      <Box>
        <VStack gap="space-16">
          <Heading level="3" size="small">
            Søkekriterier
          </Heading>
          <HStack gap="space-16" wrap align="end">
            <Box style={{ minWidth: '220px' }}>
              <UNSAFE_Combobox
                label="Sakstype"
                size="small"
                options={[...sakTypeOptions]}
                isMultiSelect
                selectedOptions={sakTyper}
                onToggleSelected={(option, isSelected) => {
                  const next = isSelected ? [...sakTyper, option] : sakTyper.filter((s) => s !== option)
                  updateSearchParams({ sakType: next })
                }}
              />
            </Box>

            <Box style={{ minWidth: '260px' }}>
              <UNSAFE_Combobox
                label="Kravtype"
                size="small"
                options={[...kravGjelderOptions]}
                isMultiSelect
                selectedOptions={kravGjelderListe}
                onToggleSelected={(option, isSelected) => {
                  const next = isSelected ? [...kravGjelderListe, option] : kravGjelderListe.filter((k) => k !== option)
                  updateSearchParams({ kravGjelder: next })
                }}
              />
            </Box>

            <Box style={{ minWidth: '220px' }}>
              <UNSAFE_Combobox
                label="Behandlingstype"
                size="small"
                options={[...behandlingTypeOptions]}
                isMultiSelect
                selectedOptions={behandlingstyper}
                onToggleSelected={(option, isSelected) => {
                  const next = isSelected ? [...behandlingstyper, option] : behandlingstyper.filter((b) => b !== option)
                  updateSearchParams({ behandlingType: next })
                }}
              />
            </Box>

            <DatePicker {...fomPicker.datepickerProps}>
              <DatePicker.Input size="small" {...fomPicker.inputProps} label="Fra dato" />
            </DatePicker>
            <DatePicker {...tomPicker.datepickerProps}>
              <DatePicker.Input size="small" {...tomPicker.inputProps} label="Til dato" />
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

      <Detail textColor="subtle">
        Valgt periode: {formaterTimestamp(fom)} – {formaterTimestamp(tom)}
      </Detail>

      {chartData.length > 0 && (
        <VStack gap="space-8">
          <Heading level="3" size="small">
            Opprettede krav over tid
          </Heading>
          <HStack gap="space-8" align="center" justify="space-between">
            <BodyShort size="small" textColor="subtle">
              Antall krav mottatt per periode, gruppert etter behandlingstype.
            </BodyShort>
            <BodyShort size="small" textColor="subtle" style={{ whiteSpace: 'nowrap' }}>
              Dra i grafen for å velge tidsperiode
            </BodyShort>
          </HStack>
          <Suspense fallback={<Skeleton variant="rounded" width="100%" height={200} />}>
            <OpprettetChart data={chartData} onRangeSelect={applyPeriod} labelMap={behandlingTypeLabels} />
          </Suspense>
        </VStack>
      )}

      <SectionTabLayout sectionPath="sak-krav" faner={faner} />
    </VStack>
  )
}
