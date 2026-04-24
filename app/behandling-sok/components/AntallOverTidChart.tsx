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
import { Bar, Line } from 'react-chartjs-2'
import { formaterBucketLabel, tidsdimensjonLabel } from '../lib/formatters'
import type { Aggregering, Tidsdimensjon } from '../lib/url-state'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

export type Bucket = { periodeStart: string; antall: number }

type Props = {
  buckets: Bucket[]
  aggregering: Aggregering
  tidsdimensjon: Tidsdimensjon
}

const COLOR = 'rgba(0, 96, 165, 0.7)'

export function AntallOverTidChart({ buckets, aggregering, tidsdimensjon }: Props) {
  const useLine = buckets.length > 60
  const chartData = useMemo(() => {
    const labels = buckets.map((b) => formaterBucketLabel(b.periodeStart, aggregering))
    const data = buckets.map((b) => b.antall)
    const ds = {
      label: `Antall behandlinger (${tidsdimensjonLabel(tidsdimensjon).toLowerCase()})`,
      data,
      backgroundColor: COLOR,
      borderColor: COLOR,
      borderWidth: 1,
    }
    return { labels, datasets: [ds] } as ChartData<'bar' | 'line', number[], string>
  }, [buckets, aggregering, tidsdimensjon])

  const options: ChartOptions<'bar' | 'line'> = {
    plugins: {
      title: { display: true, text: `Antall over tid — aggregert per ${aggregering.toLowerCase()}` },
      legend: { position: 'bottom' },
    },
    responsive: true,
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  }

  if (useLine) {
    return <Line data={chartData as ChartData<'line', number[], string>} options={options as ChartOptions<'line'>} />
  }
  return <Bar data={chartData as ChartData<'bar', number[], string>} options={options as ChartOptions<'bar'>} />
}
