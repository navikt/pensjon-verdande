import { BodyShort, Box, Heading, HStack, Select, VStack } from '@navikt/ds-react'
import type { ChartData, ChartOptions } from 'chart.js'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import React, { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import type { EndeTilEndeAnalyseResponse } from '../types'
import { faseColors } from '../utils/chartColors'
import { formaterPeriodeLabel, formaterVarighetDager } from '../utils/formattering'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface Props {
  data: EndeTilEndeAnalyseResponse
}

export default function EndeTilEndeChart({ data }: Props) {
  const kravStatuser = useMemo(() => {
    const set = new Set<string>()
    for (const fs of data.faseStatistikkPerKravStatus) set.add(fs.kravStatus)
    for (const dp of data.datapunkter) set.add(dp.kravStatus)
    return ['Alle', ...Array.from(set).sort()]
  }, [data])

  const [valgtKravStatus, setValgtKravStatus] = React.useState('Alle')

  const filteredDatapunkter = useMemo(
    () =>
      valgtKravStatus === 'Alle'
        ? data.datapunkter
        : data.datapunkter.filter((dp) => dp.kravStatus === valgtKravStatus),
    [data.datapunkter, valgtKravStatus],
  )

  const filteredFaseStatistikk = useMemo(
    () =>
      valgtKravStatus === 'Alle'
        ? data.faseStatistikkPerKravStatus
        : data.faseStatistikkPerKravStatus.filter((fs) => fs.kravStatus === valgtKravStatus),
    [data.faseStatistikkPerKravStatus, valgtKravStatus],
  )

  const chartData = useMemo(() => {
    if (filteredDatapunkter.length === 0) return null

    // Aggregate per periode — weighted average when showing all kravStatuser
    const periodeSum = new Map<string, number>()
    const periodeCount = new Map<string, number>()
    for (const dp of filteredDatapunkter) {
      periodeSum.set(
        dp.periodeFra,
        (periodeSum.get(dp.periodeFra) ?? 0) + dp.totalVarighetDager.gjennomsnittDager * dp.antall,
      )
      periodeCount.set(dp.periodeFra, (periodeCount.get(dp.periodeFra) ?? 0) + dp.antall)
    }
    const perioder = [...periodeSum.keys()].sort()

    const result: ChartData<'bar'> = {
      labels: perioder,
      datasets: [
        {
          label: 'Total varighet (snitt dager)',
          data: perioder.map((p) => {
            const count = periodeCount.get(p) ?? 1
            return count > 0 ? (periodeSum.get(p) ?? 0) / count : 0
          }),
          backgroundColor: faseColors.mottakTilOpprettet.backgroundColor,
          borderColor: faseColors.mottakTilOpprettet.borderColor,
          borderWidth: 1,
        },
      ],
    }
    return result
  }, [filteredDatapunkter])

  const barOptions: ChartOptions<'bar'> = {
    plugins: {
      title: { display: true, text: 'Ende-til-ende varighet per periode (dager)' },
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${formaterVarighetDager(ctx.parsed.y)}`,
        },
      },
    },
    responsive: true,
    scales: {
      x: {
        ticks: {
          callback: function (value) {
            return formaterPeriodeLabel(this.getLabelForValue(value as number))
          },
        },
      },
      y: {
        ticks: { callback: (value) => `${value} dg` },
      },
    },
  }

  // Build KPI cards from filtered faseStatistikk
  const kpis = useMemo(() => {
    if (filteredFaseStatistikk.length === 0) return []
    if (filteredFaseStatistikk.length === 1) {
      const fs = filteredFaseStatistikk[0]
      return [
        { label: `Antall (${fs.kravStatus})`, value: String(fs.antall) },
        { label: 'Snitt total', value: formaterVarighetDager(fs.totalVarighetDager.gjennomsnittDager) },
        { label: 'Median total', value: formaterVarighetDager(fs.totalVarighetDager.medianDager) },
        { label: 'P90 total', value: formaterVarighetDager(fs.totalVarighetDager.p90Dager) },
        { label: 'Mottak → Opprettet', value: formaterVarighetDager(fs.mottakTilOpprettetDager.gjennomsnittDager) },
        { label: 'Opprettet → Ferdig', value: formaterVarighetDager(fs.opprettetTilFerdigDager.gjennomsnittDager) },
        { label: 'Ferdig → Iverksatt', value: formaterVarighetDager(fs.ferdigTilIverksattDager.gjennomsnittDager) },
      ]
    }
    // Multiple kravStatuser — show summary per kravStatus
    const totaltAntall = filteredFaseStatistikk.reduce((sum, fs) => sum + fs.antall, 0)
    const result = [{ label: 'Antall totalt', value: String(totaltAntall) }]
    for (const fs of filteredFaseStatistikk) {
      result.push({
        label: `${fs.kravStatus} (snitt)`,
        value: formaterVarighetDager(fs.totalVarighetDager.gjennomsnittDager),
      })
    }
    return result
  }, [filteredFaseStatistikk])

  if (data.faseStatistikkPerKravStatus.length === 0 && data.datapunkter.length === 0) {
    return (
      <Box padding="space-32" style={{ textAlign: 'center' }}>
        <BodyShort>Ingen ende-til-ende data i valgt tidsrom</BodyShort>
      </Box>
    )
  }

  return (
    <VStack gap="space-24">
      {kravStatuser.length > 2 && (
        <Select
          label="Kravstatus"
          size="small"
          value={valgtKravStatus}
          onChange={(e) => setValgtKravStatus(e.target.value)}
          style={{ maxWidth: '220px' }}
        >
          {kravStatuser.map((ks) => (
            <option key={ks} value={ks}>
              {ks}
            </option>
          ))}
        </Select>
      )}

      {chartData && (
        <div
          style={{ maxHeight: '500px' }}
          role="img"
          aria-label="Søylediagram: Ende-til-ende behandlingstider over tid"
        >
          <Bar options={barOptions} data={chartData} />
        </div>
      )}

      {kpis.length > 0 && (
        <>
          <Heading level="3" size="small">
            Fasestatistikk
          </Heading>
          <BodyShort size="small" textColor="subtle">
            Gjennomsnittlig varighet per fase i saksbehandlingsforløpet. Fasene er mottak → opprettet (ventetid),
            opprettet → ferdig (behandlingstid) og ferdig → iverksatt (vedtakseffektuering).
          </BodyShort>
          <HStack gap="space-16" wrap>
            {kpis.map((kpi) => (
              <Box
                key={kpi.label}
                borderWidth="2"
                padding="space-16"
                borderRadius="4"
                style={{ borderColor: 'var(--ax-border-neutral)', minWidth: '160px' }}
              >
                <VStack gap="space-8">
                  <BodyShort size="small" weight="semibold">
                    {kpi.label}
                  </BodyShort>
                  <Heading level="4" size="medium">
                    {kpi.value}
                  </Heading>
                </VStack>
              </Box>
            ))}
          </HStack>
        </>
      )}
    </VStack>
  )
}
