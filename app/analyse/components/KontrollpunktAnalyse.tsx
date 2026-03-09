import { BodyShort, Box, Heading, HStack, Select, Table, VStack } from '@navikt/ds-react'
import type { ChartData, ChartOptions } from 'chart.js'
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import React, { useMemo } from 'react'
import { Bar, Pie } from 'react-chartjs-2'
import type { KontrollpunktTidsserieDatapunkt, KontrollpunktTypeStatistikk } from '../types'
import { getPaletteColor } from '../utils/chartColors'
import { formaterPeriodeLabel, formaterTall } from '../utils/formattering'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

interface Props {
  data: KontrollpunktTypeStatistikk[]
  tidsserie: KontrollpunktTidsserieDatapunkt[]
}

export default function KontrollpunktAnalyse({ data, tidsserie }: Props) {
  const kravStatuser = useMemo(() => {
    const set = new Set<string>()
    for (const kp of data) set.add(kp.kravStatus)
    for (const dp of tidsserie) set.add(dp.kravStatus)
    return ['Alle', ...Array.from(set).sort()]
  }, [data, tidsserie])

  const [valgtKravStatus, setValgtKravStatus] = React.useState('Alle')

  const filteredData = useMemo(
    () => (valgtKravStatus === 'Alle' ? data : data.filter((kp) => kp.kravStatus === valgtKravStatus)),
    [data, valgtKravStatus],
  )
  const filteredTidsserie = useMemo(
    () => (valgtKravStatus === 'Alle' ? tidsserie : tidsserie.filter((dp) => dp.kravStatus === valgtKravStatus)),
    [tidsserie, valgtKravStatus],
  )

  const top10 = useMemo(() => [...filteredData].sort((a, b) => b.antall - a.antall).slice(0, 10), [filteredData])
  const andre = useMemo(() => {
    const top10Keys = new Set(top10.map((k) => `${k.kontrollpunktType}|${k.kravStatus}`))
    return filteredData
      .filter((k) => !top10Keys.has(`${k.kontrollpunktType}|${k.kravStatus}`))
      .reduce((sum, k) => sum + k.antall, 0)
  }, [filteredData, top10])

  const tidsserieChart = useMemo(() => {
    if (filteredTidsserie.length === 0) return null

    const perioder = [...new Set(filteredTidsserie.map((d) => d.periodeFra))].sort()
    const typer = [...new Set(filteredTidsserie.map((d) => d.kontrollpunktType))]
    const top10Typer = typer.slice(0, 10)

    const dataMap = new Map<string, Map<string, number>>()
    for (const dp of filteredTidsserie) {
      if (!dataMap.has(dp.periodeFra)) dataMap.set(dp.periodeFra, new Map())
      const existing = dataMap.get(dp.periodeFra)?.get(dp.kontrollpunktType) ?? 0
      dataMap.get(dp.periodeFra)?.set(dp.kontrollpunktType, existing + dp.antall)
    }

    const result: ChartData<'bar'> = {
      labels: perioder,
      datasets: top10Typer.map((type, i) => {
        const color = getPaletteColor(i)
        return {
          label: type,
          data: perioder.map((p) => dataMap.get(p)?.get(type) || 0),
          backgroundColor: color.backgroundColor,
          borderColor: color.borderColor,
          borderWidth: 1,
        }
      }),
    }
    return result
  }, [filteredTidsserie])

  const statusPie = useMemo(() => {
    const statusTotals = new Map<string, number>()
    for (const kp of filteredData) {
      for (const [status, count] of Object.entries(kp.statusFordeling)) {
        statusTotals.set(status, (statusTotals.get(status) || 0) + count)
      }
    }

    const labels = [...statusTotals.keys()]
    const values = [...statusTotals.values()]
    if (values.length === 0) return null

    const colors = labels.map((_, i) => getPaletteColor(i))

    const result: ChartData<'pie'> = {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors.map((c) => c.backgroundColor),
          borderColor: colors.map((c) => c.borderColor),
          borderWidth: 1,
        },
      ],
    }
    return result
  }, [filteredData])

  const barOptions: ChartOptions<'bar'> = {
    plugins: {
      title: { display: true, text: 'Kontrollpunkter over tid' },
      legend: { position: 'bottom' },
    },
    responsive: true,
    scales: {
      x: {
        stacked: true,
        ticks: {
          callback: function (value) {
            return formaterPeriodeLabel(this.getLabelForValue(value as number))
          },
        },
      },
      y: { stacked: true },
    },
  }

  const pieOptions: ChartOptions<'pie'> = {
    plugins: {
      title: { display: true, text: 'Statusfordeling' },
      legend: { position: 'right' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const pct = total ? ((ctx.parsed / total) * 100).toFixed(1) : '0'
            return `${ctx.label}: ${ctx.parsed} (${pct}%)`
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: true,
  }

  if (data.length === 0) {
    return (
      <Box padding="space-32" style={{ textAlign: 'center' }}>
        <BodyShort>Ingen kontrollpunktdata i valgt tidsrom</BodyShort>
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

      <HStack gap="space-24" wrap>
        {tidsserieChart && (
          <div
            style={{ flex: 2, minWidth: '400px', maxHeight: '400px' }}
            role="img"
            aria-label="Søylediagram: Kontrollpunkter over tid"
          >
            <Bar options={barOptions} data={tidsserieChart} />
          </div>
        )}
        {statusPie && (
          <div
            style={{ flex: 1, minWidth: '300px', maxHeight: '400px' }}
            role="img"
            aria-label="Kakediagram: Fordeling av kontrollpunkttyper"
          >
            <Pie options={pieOptions} data={statusPie} />
          </div>
        )}
      </HStack>

      <Heading level="3" size="small">
        Topp 10 kontrollpunkttyper
      </Heading>
      <Table size="small" zebraStripes>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Type</Table.ColumnHeader>
            <Table.ColumnHeader>Kravstatus</Table.ColumnHeader>
            <Table.ColumnHeader align="right">Antall</Table.ColumnHeader>
            <Table.ColumnHeader align="right">Kritiske</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {top10.map((kp) => (
            <Table.Row key={`${kp.kontrollpunktType}|${kp.kravStatus}`}>
              <Table.DataCell>{kp.kontrollpunktType}</Table.DataCell>
              <Table.DataCell>{kp.kravStatus}</Table.DataCell>
              <Table.DataCell align="right">{formaterTall(kp.antall)}</Table.DataCell>
              <Table.DataCell align="right">{formaterTall(kp.antallKritiske)}</Table.DataCell>
            </Table.Row>
          ))}
          {andre > 0 && (
            <Table.Row>
              <Table.DataCell>
                <em>Andre ({filteredData.length - top10.length} rader)</em>
              </Table.DataCell>
              <Table.DataCell />
              <Table.DataCell align="right">{formaterTall(andre)}</Table.DataCell>
              <Table.DataCell align="right">–</Table.DataCell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </VStack>
  )
}
