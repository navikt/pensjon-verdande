import { BodyShort } from '@navikt/ds-react'
import type { ChartData, ChartOptions } from 'chart.js'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { useMemo } from 'react'
import { Pie } from 'react-chartjs-2'
import type {
  AldeFordelingKontrollpunktOverTidDto,
  AldeFordelingSamboerKontrollpunktBehandlingDto,
  KontrollpunktElement,
} from '../types'

ChartJS.register(ArcElement, Tooltip, Legend)

interface KontrollpunktfordelingPieChartProps {
  // Aksepterer enten responsobjektet eller allerede ekstrahert array
  data: AldeFordelingKontrollpunktOverTidDto | AldeFordelingSamboerKontrollpunktBehandlingDto[]
  height?: number
  title?: string
}

const generateColors = (types: string[]) => {
  return types.reduce<Record<string, { backgroundColor: string; borderColor: string }>>((acc, type, idx) => {
    acc[type] = {
      backgroundColor: `rgba(${60 + idx * 30},${140 + idx * 25},${210 - idx * 25},0.55)`,
      borderColor: `rgba(${60 + idx * 30},${140 + idx * 25},${210 - idx * 25},1)`,
    }
    return acc
  }, {})
}

function safeGetItems(entry: AldeFordelingSamboerKontrollpunktBehandlingDto): KontrollpunktElement[] {
  if (entry.data) return entry.data as KontrollpunktElement[]
  const maybeData = (entry as unknown as { data?: KontrollpunktElement[] }).data
  return maybeData || []
}

function aggregate(data: AldeFordelingSamboerKontrollpunktBehandlingDto[]): Record<string, number> {
  const totals: Record<string, number> = {}
  data.forEach((entry) => {
    safeGetItems(entry).forEach((item) => {
      totals[item.type] = (totals[item.type] || 0) + item.antall
    })
  })
  return totals
}

export const pieOptions: ChartOptions<'pie'> = {
  plugins: {
    title: {
      display: true,
      text: 'Total kontrollpunktfordeling',
    },
    legend: {
      position: 'right',
    },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const total = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const val = ctx.parsed
          const pct = total ? ((val / total) * 100).toFixed(1) : '0.0'
          return `${ctx.label}: ${val} (${pct}%)`
        },
      },
    },
  },
  responsive: true,
  maintainAspectRatio: false,
}

const KontrollpunktfordelingPieChart: React.FC<KontrollpunktfordelingPieChartProps> = ({
  data,
  height = 340,
  title,
}) => {
  const chartData = useMemo<ChartData<'pie'> | null>(() => {
    const array: AldeFordelingSamboerKontrollpunktBehandlingDto[] = Array.isArray(data)
      ? data
      : Array.isArray(data.fordeling)
        ? data.fordeling
        : []
    if (!array.length) return null
    const totals = aggregate(array)
    const types = Object.keys(totals).sort()
    if (!types.length) return null
    const colors = generateColors(types)

    return {
      labels: types,
      datasets: [
        {
          label: 'Antall',
          data: types.map((t) => totals[t]),
          backgroundColor: types.map((t) => colors[t].backgroundColor),
          borderColor: types.map((t) => colors[t].borderColor),
          borderWidth: 1,
        },
      ],
    }
  }, [data])

  if (!chartData) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <BodyShort>Ingen kontrollpunkter totalt</BodyShort>
      </div>
    )
  }

  const localOptions = { ...pieOptions }
  if (title) {
    localOptions.plugins = { ...localOptions.plugins, title: { display: true, text: title } }
  }

  return (
    <div style={{ width: '100%', height }}>
      <Pie data={chartData} options={localOptions} />
    </div>
  )
}

export default KontrollpunktfordelingPieChart
