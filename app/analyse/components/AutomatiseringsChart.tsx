import { BodyShort, Box } from '@navikt/ds-react'
import type { ChartData, ChartOptions } from 'chart.js'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import type { AutomatiseringDatapunkt } from '../types'
import { formaterPeriodeLabel } from '../utils/formattering'
import { ChartDataTable, formatPeriode, formatRatio, formatTall } from './ChartDataTable'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const options: ChartOptions<'bar'> = {
  plugins: {
    title: { display: true, text: 'Automatiseringsgrad over tid' },
    legend: { position: 'bottom' },
    tooltip: {
      callbacks: {
        afterBody(tooltipItems) {
          const idx = tooltipItems[0]?.dataIndex
          if (idx == null) return ''
          const totalt = tooltipItems.reduce((sum, ti) => sum + (ti.raw as number), 0)
          const auto = tooltipItems.find((ti) => ti.dataset.label === 'Automatisk')?.raw as number | undefined
          if (auto != null && totalt > 0) {
            return `Automatiseringsgrad: ${((auto / totalt) * 100).toFixed(1)} %`
          }
          return ''
        },
      },
    },
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
  data: AutomatiseringDatapunkt[]
}

export default function AutomatiseringsChart({ data }: Props) {
  const chartData = useMemo(() => {
    if (data.length === 0) return null

    const perioder = data.map((d) => d.periodeFra)

    const result: ChartData<'bar'> = {
      labels: perioder,
      datasets: [
        {
          label: 'Automatisk',
          data: perioder.map((_, i) => data[i].automatisk),
          backgroundColor: 'rgba(42, 167, 88, 0.5)',
          borderColor: 'rgba(42, 167, 88, 1)',
          borderWidth: 1,
        },
        {
          label: 'Manuell',
          data: perioder.map((_, i) => data[i].manuell),
          backgroundColor: 'rgba(255, 163, 51, 0.5)',
          borderColor: 'rgba(199, 115, 0, 1)',
          borderWidth: 1,
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
    <div>
      <div
        style={{ maxHeight: '500px' }}
        role="img"
        aria-label="Stablet søylediagram: Automatisering vs. manuell behandling"
      >
        <Bar options={options} data={chartData} />
      </div>
      <ChartDataTable
        data={data}
        columns={[
          { key: 'periodeFra', label: 'Periode', format: formatPeriode },
          { key: 'totalt', label: 'Totalt', format: formatTall },
          { key: 'automatisk', label: 'Automatisk', format: formatTall },
          { key: 'manuell', label: 'Manuell', format: formatTall },
          { key: 'automatiseringsgrad', label: 'Grad', format: formatRatio },
        ]}
      />
    </div>
  )
}
