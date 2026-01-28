import { BodyShort, UNSAFE_Combobox } from '@navikt/ds-react'
import type { ChartData, ChartOptions } from 'chart.js'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import { useMemo, useState } from 'react'
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
  // Collect all unique type+enhet combinations
  const typeEnhetSet = new Set<string>()
  data.forEach((d) => {
    const items = safeGetItems(d)
    items.forEach((item) => {
      typeEnhetSet.add(`${item.type}__${item.enhet}`)
    })
  })
  const typeEnhetArr = Array.from(typeEnhetSet)
  const typeColors: Record<string, { backgroundColor: string; borderColor: string }> = {}
  typeEnhetArr.forEach((typeEnhet, idx) => {
    typeColors[typeEnhet] = {
      backgroundColor: `rgba(${60 + idx * 30},${140 + idx * 25},${210 - idx * 25},0.55)`,
      borderColor: `rgba(${60 + idx * 30},${140 + idx * 25},${210 - idx * 25},1)`,
    }
  })
  const fordeling: Record<string, number[]> = {}
  typeEnhetArr.forEach((te) => {
    fordeling[te] = labels.map((label) => {
      const dag = data.find((d) => d.dato === label)
      const element = dag ? safeGetItems(dag).find((e) => `${e.type}__${e.enhet}` === te) : undefined
      return element?.antall ?? 0
    })
  })
  return { labels, fordeling, typeColors }
}

const KontrollpunktfordelingOverTidBarChart: React.FC<KontrollpunktfordelingOverTidBarChartProps> = ({
  data,
  height = 420,
}) => {
  // Finn alle unike enheter som array av {label, value}
  const allEnheter = useMemo(() => {
    const set = new Set<string>()
    data.fordeling.forEach((d) => {
      ;(d.data || []).forEach((item) => {
        if (item.enhet) set.add(item.enhet)
      })
    })

    return Array.from(set)
      .sort()
      .map((enhet) => ({ label: enhet, value: enhet }))
  }, [data.fordeling])

  const [selectedEnheter, setSelectedEnheter] = useState<string[]>([])

  // Filter data på valgte enheter (eller alle hvis ingen valgt)
  const filteredFordeling = useMemo(() => {
    if (!selectedEnheter.length) return data.fordeling
    return data.fordeling.map((d) => ({
      ...d,
      data: (d.data || []).filter((item) => selectedEnheter.includes(item.enhet)),
    }))
  }, [data.fordeling, selectedEnheter])

  const { labels, fordeling, typeColors } = useMemo(
    () => parseKontrollpunktToChartData(filteredFordeling),
    [filteredFordeling],
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
      <div style={{ maxWidth: 400, marginBottom: 8 }}>
        <UNSAFE_Combobox
          label="Filtrer på enhet"
          options={allEnheter}
          isMultiSelect
          selectedOptions={selectedEnheter}
          onToggleSelected={(enhet) => {
            setSelectedEnheter((prev) => (prev.includes(enhet) ? prev.filter((e) => e !== enhet) : [...prev, enhet]))
          }}
          size="small"
        />
      </div>
      <Bar options={options} data={chartData} />
    </div>
  )
}

export default KontrollpunktfordelingOverTidBarChart
