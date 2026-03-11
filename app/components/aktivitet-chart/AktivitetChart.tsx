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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

type TidsserieDatapunkt = {
  periodeFra: string
  status: string
  antall: number
}

type Props = {
  datapunkter: TidsserieDatapunkt[]
  antallDager: number
  maintainAspectRatio?: boolean
}

const statusConfig: Record<string, { label: string; borderColor: string; backgroundColor: string }> = {
  FULLFORT: {
    label: 'Fullført',
    borderColor: 'rgba(42, 167, 88, 1)',
    backgroundColor: 'rgba(42, 167, 88, 0.15)',
  },
  UNDER_BEHANDLING: {
    label: 'Under behandling',
    borderColor: 'rgba(51, 134, 224, 1)',
    backgroundColor: 'rgba(51, 134, 224, 0.15)',
  },
  STOPPET: {
    label: 'Stoppet',
    borderColor: 'rgba(195, 0, 0, 1)',
    backgroundColor: 'rgba(195, 0, 0, 0.15)',
  },
}

const statusOrder = ['FULLFORT', 'UNDER_BEHANDLING', 'STOPPET']

function formatDate(iso: string): string {
  const [, month, day] = iso.split('T')[0].split('-')
  return `${day}.${month}`
}

export function AktivitetChart({ datapunkter, antallDager, maintainAspectRatio }: Props) {
  const chartData = useMemo(() => {
    if (datapunkter.length === 0) return null

    const perioder = [...new Set(datapunkter.map((d) => d.periodeFra))].sort()

    const dataMap = new Map<string, Map<string, number>>()
    for (const dp of datapunkter) {
      if (!dataMap.has(dp.periodeFra)) dataMap.set(dp.periodeFra, new Map())
      dataMap.get(dp.periodeFra)?.set(dp.status, dp.antall)
    }

    const statuser = statusOrder.filter((s) => datapunkter.some((d) => d.status === s))

    return {
      labels: perioder.map(formatDate),
      datasets: statuser.map((status) => {
        const config = statusConfig[status] ?? {
          label: status,
          borderColor: 'rgba(0,0,0,0.5)',
          backgroundColor: 'rgba(0,0,0,0.1)',
        }
        return {
          label: config.label,
          data: perioder.map((p) => dataMap.get(p)?.get(status) ?? 0),
          borderColor: config.borderColor,
          backgroundColor: config.backgroundColor,
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointRadius: antallDager > 30 ? 1 : 3,
        }
      }),
    }
  }, [datapunkter, antallDager])

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
            position: 'bottom',
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
          },
        },
      }}
    />
  )
}
