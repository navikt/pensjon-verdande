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
  Tabs,
  useRangeDatepicker,
  VStack,
} from '@navikt/ds-react'
import { format, sub } from 'date-fns'
import React from 'react'
import { useNavigation, useRevalidator, useSearchParams } from 'react-router'
import KontrollpunktfordelingOverTidBarChart from '~/alde-oppfolging/KontrollpunktfordelingOverTidBarChart'
import KontrollpunktfordelingPieChart from '~/alde-oppfolging/KontrollpunktfordelingPieChart'
import type { DateRange } from '~/behandlingserie/seriekalenderUtils'
import { toIsoDate } from '~/common/date'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types'
import FordelingAldeStatus from './FordelingAldeStatus'
import FordelingBehandlingStatus from './FordelingBehandling'
import FordelingStatusMedAktivitet from './FordelingStatusMedAktivitet'
import css from './index.module.css'
import StatusfordelingOverTidBarChart from './StatusfordelingOverTidBarChart'
import { statusColors, statusLabels } from './StatusfordelingOverTidBarChart/utils'
import type {
  AldeAvbrutteBehandlingerDto,
  AldeBehandlingNavn,
  AldeFordelingKontrollpunktOverTidDto,
  AldeFordelingStatusDto,
  AldeFordelingStatusMedAktivitet,
  AldeFordelingStatusOverTidDto,
} from './types'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'ALDE oppfølging | Verdande' }]
}

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
    `/api/behandling/alde/oppfolging/status-fordeling?${dateRangeSearchParams.toString()}`,
    request,
  ).then((it) => it.statusFordeling)

  const behandlingFordeling = await apiGet<{ fordeling: { behandlingType: string; antall: number }[] }>(
    `/api/behandling/alde/oppfolging/behandling-fordeling?${dateRangeSearchParams.toString()}`,
    request,
  ).then((it) => it.fordeling)

  const avbrutteBehandlinger = await apiGet<AldeAvbrutteBehandlingerDto>(
    `/api/behandling/alde/oppfolging/avbrutte-behandlinger?${dateRangeSearchParams.toString()}`,
    request,
  ).then((response) =>
    response.avbrutteBehandlinger
      .sort((a, b) => b.opprettet.localeCompare(a.opprettet))
      .map((avbruttBehandling) => ({
        ...avbruttBehandling,
        opprettet: format(new Date(avbruttBehandling.opprettet), 'dd.MM.yyyy HH:mm'),
      })),
  )

  const aldeBehandlinger = await apiGet<AldeBehandlingNavn[]>(
    '/api/behandling/alde/oppfolging/behandling-typer',
    request,
  )

  const statusfordelingOverTid = await apiGet<AldeFordelingStatusOverTidDto[]>(
    `/api/behandling/alde/oppfolging/behandling-status?${dateRangeSearchParams.toString()}`,
    request,
  )

  const kontrollpunktFordelingOverTid = await apiGet<AldeFordelingKontrollpunktOverTidDto>(
    `/api/behandling/alde/oppfolging/behandling-samboer-kontrollpunkt-fordeling?kontrollpunktType=SAMBOER&${dateRangeSearchParams.toString()}`,
    request,
  )

  const statusfordelingAldeAktiviteter = await apiGet<{ statusFordeling: AldeFordelingStatusMedAktivitet[] }>(
    `/api/behandling/alde/oppfolging/status-fordeling-med-aktivitet?${dateRangeSearchParams.toString()}`,
    request,
  ).then((it) => it.statusFordeling)

  return {
    avbrutteBehandlinger,
    statusfordelingOverTid,
    aldeStatusFordeling,
    behandlingFordeling,
    aldeBehandlinger,
    fomDato,
    tomDato,
    behandlingstype,
    kontrollpunktFordelingOverTid,
    statusfordelingAldeAktiviteter,
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
    aldeBehandlinger,
    kontrollpunktFordelingOverTid,
    statusfordelingAldeAktiviteter,
  } = loaderData
  const [searchParams, setSearchParams] = useSearchParams()
  const navigation = useNavigation()
  const revalidator = useRevalidator()
  const [hiddenStatuses, setHiddenStatuses] = React.useState<string[]>([])
  const [debouncedLoading, setDebouncedLoading] = React.useState(false)
  const [autoReloadInterval, setAutoReloadInterval] = React.useState<number | null>(null)
  const [isAutoReloading, setIsAutoReloading] = React.useState(false)
  const allStatuses = ['FULLFORT', 'UNDER_BEHANDLING', 'AVBRUTT', 'DEBUG', 'FEILENDE', 'STOPPET']

  const isLoading = navigation.state === 'loading'

  React.useEffect(() => {
    if (isLoading && !isAutoReloading) {
      const timer = setTimeout(() => {
        setDebouncedLoading(true)
      }, 200)
      return () => clearTimeout(timer)
    } else {
      setDebouncedLoading(false)
    }
  }, [isLoading, isAutoReloading])

  React.useEffect(() => {
    if (autoReloadInterval) {
      const interval = setInterval(() => {
        // Trigger a reload by revalidating
        setIsAutoReloading(true)
        revalidator.revalidate()
      }, autoReloadInterval)
      return () => clearInterval(interval)
    }
  }, [autoReloadInterval, revalidator])

  React.useEffect(() => {
    if (!isLoading && isAutoReloading) {
      setIsAutoReloading(false)
    }
  }, [isLoading, isAutoReloading])

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
      <Bleed marginInline={'12 12'} marginBlock={'space-16'} asChild>
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

      <VStack gap="6" paddingBlock={'8'}>
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
                  {aldeBehandlinger.map((opt) => (
                    <option key={opt.behandlingType} value={opt.behandlingType}>
                      {opt.friendlyName}
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

              <Box style={{ minWidth: '150px' }}>
                <Select
                  size="small"
                  label="Auto-oppdatering"
                  value={autoReloadInterval?.toString() || 'off'}
                  onChange={(e) => setAutoReloadInterval(e.target.value === 'off' ? null : Number(e.target.value))}
                >
                  <option value="off">Av</option>
                  <option value="5000">5 sekunder</option>
                  <option value="60000">1 minutt</option>
                  <option value="600000">10 minutter</option>
                  <option value="1800000">30 minutter</option>
                </Select>
              </Box>
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

          <Tabs defaultValue="status-over-tid" fill>
            <Tabs.List>
              <Tabs.Tab value="status-over-tid" label="Statusfordeling over tid" />
              <Tabs.Tab value="kontrollpunkt" label="Kontrollpunkt" />
              <Tabs.Tab value="status-aktivitet" label="Status med aktivitet" />
              <Tabs.Tab value="avbrutte-behandlinger" label="Avbrutte behandlinger" />
            </Tabs.List>

            <Tabs.Panel value="status-over-tid">
              <VStack gap="6" padding="6">
                <StatusfordelingOverTidBarChart
                  data={statusfordelingOverTid}
                  fomDate={fomDato}
                  tomDate={tomDato}
                  hiddenStatuses={hiddenStatuses}
                />

                <HStack gap="6" wrap>
                  <FordelingAldeStatus data={aldeStatusFordeling} hiddenStatuses={hiddenStatuses} />
                  <FordelingBehandlingStatus data={behandlingFordeling} />
                </HStack>
              </VStack>
            </Tabs.Panel>

            <Tabs.Panel value="kontrollpunkt">
              <VStack gap="14" padding="6">
                <KontrollpunktfordelingOverTidBarChart
                  data={kontrollpunktFordelingOverTid}
                  fomDate={fomDato}
                  tomDate={tomDato}
                />

                <KontrollpunktfordelingPieChart data={kontrollpunktFordelingOverTid} />
              </VStack>
            </Tabs.Panel>

            <Tabs.Panel value="status-aktivitet">
              <Box padding="6">
                <FordelingStatusMedAktivitet data={statusfordelingAldeAktiviteter} />
              </Box>
            </Tabs.Panel>

            <Tabs.Panel value="avbrutte-behandlinger">
              <VStack gap="4" padding="6">
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
                  <Table.Body>
                    {avbrutteBehandlinger.map((avbruttBehandling, idx) => (
                      <Table.Row key={`${avbruttBehandling.opprettet}-${idx}`}>
                        <Table.DataCell>{avbruttBehandling.opprettet}</Table.DataCell>
                        <Table.DataCell>{avbruttBehandling.begrunnelse}</Table.DataCell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </VStack>
            </Tabs.Panel>
          </Tabs>
        </Box>
      </VStack>
    </Page.Block>
  )
}
