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
  useRangeDatepicker,
  VStack,
} from '@navikt/ds-react'
import { sub } from 'date-fns'
import React from 'react'
import { useSearchParams } from 'react-router'
import type { DateRange } from '~/behandlingserie/seriekalenderUtils'
import { toIsoDate } from '~/common/date'
import type { Route } from './+types/alderspensjon-layout'
import SectionTabLayout from './SectionTabLayout'
import { formaterTimestamp, normalizePeriodToDate } from './utils/formattering'
import { parseAlderspensjonParams } from './utils/parseAlderspensjonParams'

const faner = [{ value: 'mottakere', label: 'Mottakere' }] as const

/**
 * Velg passende aggregeringsnivå for alderspensjon-mottakere ut fra periodelengde.
 * Endepunktet støtter DAG, UKE, MAANED, KVARTAL og AAR. MAANED er primær bruk.
 */
function velgAggregering(fom: string, tom: string): string {
  const diffDays = (new Date(tom).getTime() - new Date(fom).getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays <= 31) return 'DAG'
  if (diffDays <= 180) return 'UKE'
  if (diffDays <= 1825) return 'MAANED'
  if (diffDays <= 3650) return 'KVARTAL'
  return 'AAR'
}

export async function loader({ request }: Route.LoaderArgs) {
  const { fom, tom, aggregering } = parseAlderspensjonParams(request)
  return { fom, tom, aggregering }
}

export function shouldRevalidate({ currentUrl, nextUrl }: { currentUrl: URL; nextUrl: URL }) {
  return currentUrl.search !== nextUrl.search
}

export default function AlderspensjonLayout({ loaderData }: Route.ComponentProps) {
  const { fom, tom, aggregering } = loaderData
  const [searchParams, setSearchParams] = useSearchParams()

  function updateSearchParams(updates: Record<string, string>) {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value)
      else next.delete(key)
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
    const fromDate = normalizePeriodToDate(nextFrom, 'start')
    const toDate = normalizePeriodToDate(nextTo, 'end')
    setSelectedRef.current({ from: new Date(fromDate), to: new Date(toDate) })
    const updates: Record<string, string> = { fom: fromDate, tom: toDate }
    if (autoAggregering) updates.aggregering = velgAggregering(fromDate, toDate)
    updateSearchParams(updates)
  }

  function presetLastNMonths(n: number) {
    const now = new Date()
    applyPeriod(toIsoDate(sub(now, { months: n })), toIsoDate(now))
  }

  function presetThisYear() {
    const now = new Date()
    applyPeriod(`${now.getFullYear()}-01-01`, toIsoDate(now))
  }

  function presetAllTime() {
    applyPeriod('2010-01-01', toIsoDate(new Date()))
  }

  return (
    <VStack gap="space-24">
      <VStack gap="space-8">
        <Heading level="2" size="medium">
          Alderspensjon
        </Heading>
        <BodyShort size="small" textColor="subtle">
          Tidsserier for tilvekst og avgang av alderspensjon-mottakere, med snitt utbetaling for nye mottakere. Bruk
          filtrene under for å velge tidsrom og aggregeringsnivå.
        </BodyShort>
      </VStack>

      <Box>
        <VStack gap="space-16">
          <Heading level="3" size="small">
            Søkekriterier
          </Heading>
          <HStack gap="space-16" wrap align="end">
            <DatePicker {...datepickerProps}>
              <HStack gap="space-16">
                <DatePicker.Input size="small" {...fromInputProps} label="Fra dato" />
                <DatePicker.Input size="small" {...toInputProps} label="Til dato" />
              </HStack>
            </DatePicker>

            <VStack gap="space-8">
              <Label size="small">Hurtigvalg</Label>
              <HStack gap="space-8">
                <Button size="small" variant="secondary" onClick={() => presetLastNMonths(12)}>
                  12 mnd
                </Button>
                <Button size="small" variant="secondary" onClick={() => presetLastNMonths(24)}>
                  24 mnd
                </Button>
                <Button size="small" variant="secondary" onClick={() => presetLastNMonths(60)}>
                  5 år
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

      <SectionTabLayout sectionPath="alderspensjon" faner={faner} />
    </VStack>
  )
}
