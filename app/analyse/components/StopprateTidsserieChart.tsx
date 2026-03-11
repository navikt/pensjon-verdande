import { BodyShort, Box } from '@navikt/ds-react'
import type { ChartData, ChartOptions } from 'chart.js'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import type { StoppetDatapunkt } from '../types'
import { formaterPeriodeLabel } from '../utils/formattering'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

const options: ChartOptions<'bar'> = {
  plugins: {
    title: { display: true, text: 'Stopprate over tid' },
    legend: { position: 'bottom' },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          if (ctx.dataset.yAxisID === 'yRate') {
            return `${ctx.dataset.label}: ${(ctx.parsed.y ?? 0).toFixed(1)}%`
          }
          return `${ctx.dataset.label}: ${(ctx.parsed.y ?? 0).toLocaleString('nb-NO')}`
        },
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
      beginAtZero: true,
      position: 'left',
      title: { display: true, text: 'Antall stoppet' },
    },
    yRate: {
      beginAtZero: true,
      position: 'right',
      min: 0,
      max: 100,
      title: { display: true, text: 'Stopprate (%)' },
      grid: { drawOnChartArea: false },
    },
  },
}

interface Props {
  data: StoppetDatapunkt[]
}

export default function StopprateTidsserieChart({ data }: Props) {
  // ChartData untyped because mixed bar+line datasets aren't supported by ChartData<'bar'>
  const chartData = useMemo(() => {
    if (data.length === 0) return null

    const sorted = [...data].sort((a, b) => a.periodeFra.localeCompare(b.periodeFra))
    const perioder = sorted.map((d) => d.periodeFra)

    const result: ChartData = {
      labels: perioder,
      datasets: [
        {
          type: 'bar' as const,
          label: 'Antall stoppet',
          data: sorted.map((d) => d.antallStoppet),
          backgroundColor: 'rgba(195, 0, 0, 0.3)',
          borderColor: 'rgba(195, 0, 0, 0.6)',
          borderWidth: 1,
          yAxisID: 'y',
          order: 2,
        },
        {
          type: 'line' as const,
          label: 'Stopprate (%)',
          data: sorted.map((d) => (d.stopprate != null ? d.stopprate * 100 : null)),
          borderColor: 'rgba(0, 103, 197, 1)',
          backgroundColor: 'rgba(0, 103, 197, 0.1)',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: 'rgba(0, 103, 197, 1)',
          tension: 0.3,
          fill: false,
          yAxisID: 'yRate',
          order: 1,
        },
      ],
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
    <div style={{ maxHeight: '500px' }} role="img" aria-label="Diagram: Stopprate over tid">
      <Bar options={options} data={chartData as ChartData<'bar'>} />
    </div>
  )
}
