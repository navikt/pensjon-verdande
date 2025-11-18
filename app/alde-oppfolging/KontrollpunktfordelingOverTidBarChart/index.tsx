import { BodyShort } from '@navikt/ds-react'
import type { ChartData, ChartOptions } from 'chart.js'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import type {
  AldeFordelingKontrollpunktOverTidDto,
  AldeFordelingSamboerKontrollpunktBehandlingDto,
  KontrollpunktElement,
} from '../types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface KontrollpunktfordelingOverTidBarChartProps {
  data: AldeFordelingKontrollpunktOverTidDto
  fomDate: string
  tomDate: string
  height?: number
}

export const options: ChartOptions<'bar'> = {
  plugins: {
    title: {
      display: true,
      text: 'Kontrollpunktfordeling over tid',
    },
    legend: {
      display: false,
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      stacked: true,
      ticks: {
        callback: function (value) {
          const label = this.getLabelForValue(value as number)
          const [year, month, day] = label.split('-')
          return `${day}.${month}.${year}`
        },
      },
    },
    y: {
      stacked: true,
    },
  },
}

function safeGetItems(entry: AldeFordelingSamboerKontrollpunktBehandlingDto): KontrollpunktElement[] {
  return (entry.data || entry.data || []) as KontrollpunktElement[]
}

function parseKontrollpunktToChartData(data: AldeFordelingSamboerKontrollpunktBehandlingDto[]) {
  if (!data.length) return { labels: [], fordeling: {}, typeColors: {} }
  const labels = data.map((d) => d.dato).sort()
  const typesSet = new Set<string>()
  data.forEach((d) => {
    const items = safeGetItems(d)
    items.forEach((item) => {
      typesSet.add(item.type)
    })
  })
  const types = Array.from(typesSet)
  const typeColors: Record<string, { backgroundColor: string; borderColor: string }> = {}
  types.forEach((type, idx) => {
    typeColors[type] = {
      backgroundColor: `rgba(${60 + idx * 30},${140 + idx * 25},${210 - idx * 25},0.55)`,
      borderColor: `rgba(${60 + idx * 30},${140 + idx * 25},${210 - idx * 25},1)`,
    }
  })
  const fordeling: Record<string, number[]> = {}
  types.forEach((t) => {
    fordeling[t] = labels.map((label) => {
      const dag = data.find((d) => d.dato === label)
      const element = dag ? safeGetItems(dag).find((e) => e.type === t) : undefined
      return element?.antall ?? 0
    })
  })
  return { labels, fordeling, typeColors }
}

const KontrollpunktfordelingOverTidBarChart: React.FC<KontrollpunktfordelingOverTidBarChartProps> = ({
  data,
  height = 420,
}) => {
  const { labels, fordeling, typeColors } = useMemo(
    () => parseKontrollpunktToChartData(data.fordeling),
    [data.fordeling],
  )

  if (!labels.length) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <BodyShort>Ingen kontrollpunkter i tidsrommet</BodyShort>
      </div>
    )
  }
  const datasets = Object.entries(fordeling).map(([type, counts]) => ({
    label: type,
    data: counts,
    backgroundColor: typeColors[type]?.backgroundColor,
    borderColor: typeColors[type]?.borderColor,
    borderWidth: 1,
  }))
  const chartData: ChartData<'bar'> = { labels, datasets }

  return (
    <div style={{ height, width: '100%', marginBottom: '1.5rem' }}>
      <Bar options={options} data={chartData} />
    </div>
  )
}

export default KontrollpunktfordelingOverTidBarChart
