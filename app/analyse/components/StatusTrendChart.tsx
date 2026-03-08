import { BodyShort, Box } from '@navikt/ds-react'
import type { ChartData, ChartOptions } from 'chart.js'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import type { TidsserieDatapunkt } from '../types'
import { statusColors, statusLabels } from '../utils/chartColors'
import { formaterPeriodeLabel } from '../utils/formattering'
import { ChartDataTable, formatPeriode, formatTall } from './ChartDataTable'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const options: ChartOptions<'bar'> = {
  plugins: {
    title: { display: true, text: 'Statusfordeling over tid' },
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

interface Props {
  data: TidsserieDatapunkt[]
}

export default function StatusTrendChart({ data }: Props) {
  const chartData = useMemo(() => {
    if (data.length === 0) return null

    const perioder = [...new Set(data.map((d) => d.periodeFra))].sort()
    const statuser = [...new Set(data.map((d) => d.status))]

    const dataMap = new Map<string, Map<string, number>>()
    for (const dp of data) {
      if (!dataMap.has(dp.periodeFra)) dataMap.set(dp.periodeFra, new Map())
      dataMap.get(dp.periodeFra)?.set(dp.status, dp.antall)
    }

    const result: ChartData<'bar'> = {
      labels: perioder,
      datasets: statuser.map((status) => {
        const colors = statusColors[status] || { backgroundColor: 'rgba(0,0,0,0.5)', borderColor: 'rgb(0,0,0)' }
        return {
          label: statusLabels[status] || status,
          data: perioder.map((p) => dataMap.get(p)?.get(status) || 0),
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          borderWidth: 1,
        }
      }),
    }
    return result
  }, [data])

  if (!chartData) {
    return (
      <Box padding="space-32" style={{ textAlign: 'center' }}>
        <BodyShort>Ingen data i valgt tidsrom</BodyShort>
      </Box>
    )
  }

  return (
    <div>
      <div style={{ maxHeight: '500px' }} role="img" aria-label="Stablet søylediagram: Statusfordeling over tid">
        <Bar options={options} data={chartData} />
      </div>
      <ChartDataTable
        data={data}
        columns={[
          { key: 'periodeFra', label: 'Periode', format: formatPeriode },
          { key: 'status', label: 'Status', format: (v) => statusLabels[String(v)] || String(v) },
          { key: 'antall', label: 'Antall', format: formatTall },
        ]}
      />
    </div>
  )
}
