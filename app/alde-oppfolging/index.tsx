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
  Table,
  useRangeDatepicker,
  VStack,
} from '@navikt/ds-react'
import { format, sub } from 'date-fns'
import React from 'react'
import { useNavigation, useSearchParams } from 'react-router'
import type { DateRange } from '~/behandlingserie/seriekalenderUtils'
import { toIsoDate } from '~/common/date'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types'
import FordelingAldeStatus from './FordelingAldeStatus'
import FordelingBehandlingStatus from './FordelingBehandling'
import css from './index.module.css'
import StatusfordelingOverTidBarChart from './StatusfordelingOverTidBarChart '
import { statusColors, statusLabels } from './StatusfordelingOverTidBarChart /utils'
import type { AldeAvbrutteBehandlingerDto, AldeFordelingStatusDto, AldeFordelingStatusOverTidDto } from './types'

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

  const fomDato = url.searchParams.get('fomDato') || toIsoDate(sub(now, { days: 7 }))
  const tomDato = url.searchParams.get('tomDato') || toIsoDate(now)
  const behandlingstype = url.searchParams.get('behandlingstype') || 'FleksibelApSak'

  const dateRangeSearchParams = new URLSearchParams()
  dateRangeSearchParams.set('fomDato', fomDato)
  dateRangeSearchParams.set('tomDato', tomDato)
  dateRangeSearchParams.set('behandlingType', behandlingstype)

  const aldeStatusFordeling = await apiGet<AldeFordelingStatusDto>(
    `/api/saksbehandling/alde/status-fordeling?${dateRangeSearchParams.toString()}`,
    request,
  ).then((it) => it.statusFordeling)

  const behandlingFordeling = await apiGet<{ fordeling: { behandlingType: string; antall: number }[] }>(
    `/api/saksbehandling/alde/behandling-fordeling?${dateRangeSearchParams.toString()}`,
    request,
  ).then((it) => it.fordeling)

  const avbrutteBehandlinger = await apiGet<AldeAvbrutteBehandlingerDto>(
    `/api/saksbehandling/alde/avbrutte-behandlinger?${dateRangeSearchParams.toString()}`,
    request,
  ).then((response) =>
    response.avbrutteBehandlinger
      .sort((a, b) => b.opprettet.localeCompare(a.opprettet))
      .map((avbruttBehandling) => ({
        ...avbruttBehandling,
        opprettet: format(new Date(avbruttBehandling.opprettet), 'dd.MM.yyyy HH:mm'),
      })),
  )

  const statusfordelingOverTid = await apiGet<AldeFordelingStatusOverTidDto[]>(
    `/api/saksbehandling/alde/behandling-status?${dateRangeSearchParams.toString()}`,
    request,
  )

  return {
    avbrutteBehandlinger,
    statusfordelingOverTid,
    aldeStatusFordeling,
    behandlingFordeling,
    fomDato,
    tomDato,
    behandlingstype,
    nowIso: now.toISOString(),
  }
}

export default function AldeOppfolging({ loaderData }: Route.ComponentProps) {
  const {
    aldeStatusFordeling,
    fomDato,
    tomDato,
    behandlingstype,
    avbrutteBehandlinger,
    statusfordelingOverTid,
    behandlingFordeling,
  } = loaderData
  const [searchParams, setSearchParams] = useSearchParams()
  const navigation = useNavigation()
  const [hiddenStatuses, setHiddenStatuses] = React.useState<string[]>([])
  const [debouncedLoading, setDebouncedLoading] = React.useState(false)

  const allStatuses = ['FULLFORT', 'UNDER_BEHANDLING', 'AVBRUTT', 'DEBUG', 'FEILENDE', 'STOPPET']

  const isLoading = navigation.state === 'loading'

  React.useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setDebouncedLoading(true)
      }, 200)
      return () => clearTimeout(timer)
    } else {
      setDebouncedLoading(false)
    }
  }, [isLoading])

  function handleStatusClick(status: string, ctrlOrMeta: boolean) {
    if (ctrlOrMeta) {
      // Ctrl-click (Win/Linux) or Cmd-click (Mac): show only this status
      setHiddenStatuses(allStatuses.filter((s) => s !== status))
    } else {
      // Normal click: toggle this status
      setHiddenStatuses((prev) => {
        const newHidden = prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]

        // If all statuses are hidden, reset to show all
        if (newHidden.length === allStatuses.length) {
          return []
        }

        return newHidden
      })
    }
  }

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

        <Box style={{ position: 'relative' }}>
          {debouncedLoading && (
            <Box
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
            >
              <Loader size="xlarge" />
            </Box>
          )}
          <VStack gap="4">
            <HStack gap="4" wrap>
              {allStatuses.map((status) => {
                const statusData = aldeStatusFordeling.find((item) => item.status === status)
                const antall = statusData?.antall || 0
                const colors = statusColors[status]
                const isHidden = hiddenStatuses.includes(status)
                return (
                  <Box.New
                    key={status}
                    borderWidth="2"
                    padding="4"
                    borderRadius="medium"
                    style={{
                      borderColor: colors?.borderColor || 'var(--a-border-default)',
                      backgroundColor: colors?.backgroundColor || 'transparent',
                      opacity: isHidden ? 0.3 : 1,
                      transition: 'opacity 0.2s',
                      minWidth: '140px',
                      cursor: 'pointer',
                    }}
                    onClick={(e) => handleStatusClick(status, e.ctrlKey || e.metaKey)}
                  >
                    <VStack gap="2">
                      <BodyShort size="small" weight="semibold">
                        {statusLabels[status] || status}
                      </BodyShort>
                      <Heading level="3" size="large">
                        {antall}
                      </Heading>
                    </VStack>
                  </Box.New>
                )
              })}
            </HStack>
          </VStack>
          <Box>
            <StatusfordelingOverTidBarChart
              data={statusfordelingOverTid}
              fomDate={fomDato}
              tomDate={tomDato}
              hiddenStatuses={hiddenStatuses}
            />
          </Box>
          <HStack maxHeight="300px">
            <FordelingAldeStatus data={aldeStatusFordeling} hiddenStatuses={hiddenStatuses} />
            <FordelingBehandlingStatus data={behandlingFordeling} />
          </HStack>
          <Heading as="h2" size="medium">
            Avbrutte behandlinger
          </Heading>
          <Table size="medium" zebraStripes>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader style={{ width: '10rem' }}>Tid</Table.ColumnHeader>
                <Table.ColumnHeader>Begrunnelse</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            {avbrutteBehandlinger.map((avbruttBehandling) => (
              <Table.Row key={avbruttBehandling.begrunnelse}>
                <Table.DataCell>{avbruttBehandling.opprettet}</Table.DataCell>
                <Table.DataCell>{avbruttBehandling.begrunnelse}</Table.DataCell>
              </Table.Row>
            ))}
          </Table>
        </Box>
      </VStack>
    </Page.Block>
  )
}
