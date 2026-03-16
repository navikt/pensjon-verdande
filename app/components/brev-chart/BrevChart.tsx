import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import type { BrevTidsserieDatapunkt } from '~/analyse/types'
import { formatLabel } from '~/components/chart-utils/formatLabel'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

type Props = {
  datapunkter: BrevTidsserieDatapunkt[]
  antallTimer: number
  maintainAspectRatio?: boolean
}

export function BrevChart({ datapunkter, antallTimer, maintainAspectRatio }: Props) {
  const chartData = useMemo(() => {
    if (datapunkter.length === 0) return null

    const perioder = [...new Set(datapunkter.map((d) => d.periodeFra))].sort()

    const dataMap = new Map<string, number>()
    for (const dp of datapunkter) {
      dataMap.set(dp.periodeFra, (dataMap.get(dp.periodeFra) ?? 0) + dp.antall)
    }

    return {
      labels: perioder.map((p) => formatLabel(p, antallTimer)),
      datasets: [
        {
          label: 'Antall brev',
          data: perioder.map((p) => dataMap.get(p) ?? 0),
          borderColor: 'rgba(102, 51, 153, 1)',
          backgroundColor: 'rgba(102, 51, 153, 0.15)',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointRadius: antallTimer > 48 ? 1 : 3,
        },
      ],
    }
  }, [datapunkter, antallTimer])

  if (!chartData) return null

  return (
    <Line
      data={chartData}
      options={{
        responsive: true,
        maintainAspectRatio: maintainAspectRatio ?? true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: false,
          },
        },
        scales: {
          x: {
            display: true,
            ticks: {
              maxTicksLimit: 15,
              font: { size: 11 },
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
          },
        },
      }}
    />
  )
}
