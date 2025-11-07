import {
  Bleed,
  BodyShort,
  Box,
  Button,
  DatePicker,
  Heading,
  HStack,
  Label,
  Loader,
  Page,
  Select,
  Tag,
  useRangeDatepicker,
  VStack,
} from '@navikt/ds-react'
import { sub } from 'date-fns'
import { useLoaderData, useNavigation, useSearchParams } from 'react-router'
import type { DateRange } from '~/behandlingserie/seriekalenderUtils'
import { toIsoDate } from '~/common/date'
import { apiGet } from '~/services/api.server'
import AldePieChart from './AldePieChart'
import css from './index.module.css'
import type { AldeFordelingStatusDto } from './types'

const behandlingstypeOptions = [
  { value: 'alle', label: 'Alle behandlingstyper' },
  { value: 'alderspensjon', label: 'Alderspensjon' },
  { value: 'uforep', label: 'Uføretrygd' },
  { value: 'barnep', label: 'Barnepensjon' },
  { value: 'gjenlevendep', label: 'Gjenlevendepensjon' },
]

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url)
  const now = new Date()

  const fomDato = url.searchParams.get('fomDato') || toIsoDate(sub(now, { days: 30 }))
  const tomDato = url.searchParams.get('tomDato') || toIsoDate(now)
  const behandlingstype = url.searchParams.get('behandlingstype') || 'FleksibelApSak'

  const dateRangeSearchParams = new URLSearchParams()
  dateRangeSearchParams.set('fomDato', fomDato)
  dateRangeSearchParams.set('tomDato', tomDato)
  dateRangeSearchParams.set('behandlingType', behandlingstype)

  const aldeStatusFordeling = await apiGet<AldeFordelingStatusDto>(
    `/api/saksbehandling/alde/alde-status-fordeling?${dateRangeSearchParams.toString()}`,
    request,
  )

  return {
    aldeStatusFordeling: aldeStatusFordeling.statusFordeling,
    fomDato,
    tomDato,
    behandlingstype,
    nowIso: now.toISOString(),
  }
}

export default function AldeOppfolging() {
  const { aldeStatusFordeling, fomDato, tomDato, behandlingstype } = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigation = useNavigation()

  function updateSearchParams(updates: Record<string, string>) {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      next.set(key, value)
    })
    setSearchParams(next)
  }

  function onRangeChange(val?: DateRange) {
    if (val?.from && val.to) {
      updateSearchParams({
        fomDato: toIsoDate(val.from),
        tomDato: toIsoDate(val.to),
      })
    }
  }

  const { datepickerProps, fromInputProps, toInputProps, setSelected } = useRangeDatepicker({
    defaultSelected: {
      from: new Date(fomDato),
      to: new Date(tomDato),
    },
    required: true,
    onRangeChange: onRangeChange,
  })

  function applyPeriod(nextFrom: string, nextTo: string) {
    setSelected({
      from: new Date(nextFrom),
      to: new Date(nextTo),
    })
    updateSearchParams({ fomDato: nextFrom, tomDato: nextTo })
  }

  function presetLastNDays(n: number) {
    const now = new Date()
    const to = toIsoDate(now)
    const from = toIsoDate(sub(now, { days: n - 1 }))
    applyPeriod(from, to)
  }

  function presetThisYear() {
    const now = new Date()
    const from = `${now.getFullYear()}-01-01`
    const to = toIsoDate(now)
    applyPeriod(from, to)
  }

  const isLoading = navigation.state === 'loading'

  return (
    <Page.Block>
      <Bleed marginInline={'12 12'} asChild>
        <Box>
          <Heading className={css.topBanner} level={'1'} size={'large'} style={{ marginTop: 0 }}>
            <div className={css.topBannerContent}>
              <div className={css.topBannerText}>Alde oppfølging</div>
              <div className={css.topBannerImgContainer}>
                <img src="/alderspensjon.svg" className={css.illustration} alt="" />
              </div>
            </div>
          </Heading>
        </Box>
      </Bleed>

      <VStack gap="6">
        <Box.New>
          <VStack gap="4">
            <Heading level="2" size="small">
              Søkekriterier
            </Heading>

            <HStack gap="4" wrap align="end">
              <Box style={{ minWidth: '200px' }}>
                <Select
                  label="Behandlingstype"
                  size="small"
                  value={behandlingstype}
                  onChange={(e) => updateSearchParams({ behandlingstype: e.target.value })}
                >
                  {behandlingstypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </Box>

              <DatePicker {...datepickerProps}>
                <HStack gap="4">
                  <DatePicker.Input size="small" {...fromInputProps} label="Fra dato" />
                  <DatePicker.Input size="small" {...toInputProps} label="Til dato" />
                </HStack>
              </DatePicker>

              <VStack gap="2">
                <Label size="small">Hurtigvalg</Label>
                <HStack gap="2">
                  <Button size="small" variant="secondary" onClick={() => presetLastNDays(1)}>
                    1 dag
                  </Button>
                  <Button size="small" variant="secondary" onClick={() => presetLastNDays(7)}>
                    7 dager
                  </Button>
                  <Button size="small" variant="secondary" onClick={() => presetLastNDays(30)}>
                    30 dager
                  </Button>
                  <Button size="small" variant="secondary" onClick={presetThisYear}>
                    I år
                  </Button>
                </HStack>
              </VStack>
            </HStack>
          </VStack>
        </Box.New>

        {isLoading ? (
          <HStack justify="center" style={{ padding: '4rem 0' }}>
            <Loader size="xlarge" />
          </HStack>
        ) : (
          <AldePieChart title="Status på alde behandlinger" data={aldeStatusFordeling} />
        )}
      </VStack>
    </Page.Block>
  )
}

function _MetrikkCard({
  tittel,
  verdi,
  variant,
  prosent,
  ikon,
}: {
  tittel: string
  verdi: string
  variant: 'info' | 'success' | 'error' | 'warning' | 'alt1' | 'alt2' | 'neutral'
  prosent?: string
  ikon?: React.ReactNode
}) {
  return (
    <Box.New
      borderWidth="1"
      padding="5"
      borderRadius="large"
      borderColor="neutral-subtleA"
      style={{
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'default',
      }}
    >
      <VStack gap="3">
        <HStack justify="space-between" align="center">
          <BodyShort size="small" textColor="subtle">
            {tittel}
          </BodyShort>
          {ikon && <div style={{ color: 'var(--a-icon-subtle)' }}>{ikon}</div>}
        </HStack>
        <HStack align="end" gap="3">
          <Heading level="3" size="xlarge">
            {verdi}
          </Heading>
          {prosent && (
            <Tag size="small" variant={variant}>
              {prosent}%
            </Tag>
          )}
        </HStack>
      </VStack>
    </Box.New>
  )
}
