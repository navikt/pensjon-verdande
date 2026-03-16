import type { ChartData, ChartOptions } from 'chart.js'
import {
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
import { Line } from 'react-chartjs-2'
import type { BehandlingstidPerTypeDatapunkt } from '../types'
import { formaterPeriodeLabel } from '../utils/formattering'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const defaultPalette: { border: string; bg: string }[] = [
  { border: 'rgba(54, 162, 235, 1)', bg: 'rgba(54, 162, 235, 0.15)' },
  { border: 'rgba(255, 159, 64, 1)', bg: 'rgba(255, 159, 64, 0.15)' },
  { border: 'rgba(255, 99, 132, 1)', bg: 'rgba(255, 99, 132, 0.15)' },
  { border: 'rgba(75, 192, 192, 1)', bg: 'rgba(75, 192, 192, 0.15)' },
  { border: 'rgba(153, 102, 255, 1)', bg: 'rgba(153, 102, 255, 0.15)' },
  { border: 'rgba(255, 205, 86, 1)', bg: 'rgba(255, 205, 86, 0.15)' },
  { border: 'rgba(201, 203, 207, 1)', bg: 'rgba(201, 203, 207, 0.15)' },
  { border: 'rgba(255, 99, 71, 1)', bg: 'rgba(255, 99, 71, 0.15)' },
  { border: 'rgba(46, 139, 87, 1)', bg: 'rgba(46, 139, 87, 0.15)' },
  { border: 'rgba(106, 90, 205, 1)', bg: 'rgba(106, 90, 205, 0.15)' },
]

interface Props {
  data: BehandlingstidPerTypeDatapunkt[]
  metric: 'gjennomsnittDager' | 'medianDager' | 'p90Dager' | 'p95Dager'
  title: string
  colorMap?: Record<string, { border: string; bg: string }>
  labelMap?: Record<string, string>
  sortOrder?: Record<string, number>
}

export default function BehandlingstidChart({ data, metric, title, colorMap, labelMap, sortOrder }: Props) {
  const chartData = useMemo((): ChartData<'line'> | null => {
    if (data.length === 0) return null

    const periodeSet = new Set<string>()
    const grupper = new Set<string>()
    for (const dp of data) {
      periodeSet.add(dp.periodeFra)
      grupper.add(dp.behandlingType)
    }
    const perioder = [...periodeSet].sort()
    const labels = perioder.map(formaterPeriodeLabel)

    const lookup = new Map<string, Map<string, number | null>>()
    for (const dp of data) {
      if (!lookup.has(dp.behandlingType)) lookup.set(dp.behandlingType, new Map())
      lookup.get(dp.behandlingType)?.set(dp.periodeFra, dp[metric])
    }

    const sortedGrupper = sortOrder
      ? [...grupper].sort((a, b) => (sortOrder[a] ?? 99) - (sortOrder[b] ?? 99))
      : [...grupper].sort()
    const pointRadius = perioder.length > 30 ? 1 : 3

    const datasets = sortedGrupper.map((gruppe, i) => {
      const gruppeData = lookup.get(gruppe) ?? new Map<string, number | null>()
      const colors = colorMap?.[gruppe] ?? defaultPalette[i % defaultPalette.length]
      return {
        label: labelMap?.[gruppe] ?? gruppe,
        data: perioder.map((p) => gruppeData.get(p) ?? null),
        borderColor: colors.border,
        backgroundColor: colors.bg,
        borderWidth: 2,
        pointRadius,
        tension: 0.3,
      }
    })

    return { labels, datasets }
  }, [data, metric, colorMap, labelMap, sortOrder])

  const options = useMemo(
    (): ChartOptions<'line'> => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: title, font: { size: 14 } },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = ctx.parsed.y
              if (v == null) return ''
              return `${ctx.dataset.label}: ${v < 1 ? `${(v * 24).toFixed(1)} timer` : `${v.toFixed(1)} dager`}`
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Dager' },
        },
      },
    }),
    [title],
  )

  if (!chartData) return null

  return (
    <div style={{ height: 280 }}>
      <Line data={chartData} options={options} />
    </div>
  )
}
