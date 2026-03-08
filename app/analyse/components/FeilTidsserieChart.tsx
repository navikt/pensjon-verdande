import { BodyShort, Box } from '@navikt/ds-react'
import type { ChartData, ChartOptions } from 'chart.js'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import type { FeilTidsserieDatapunkt } from '../types'
import { formaterPeriodeLabel } from '../utils/formattering'
import { ChartDataTable, formatPeriode, formatTall } from './ChartDataTable'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const options: ChartOptions<'bar'> = {
  plugins: {
    title: { display: true, text: 'Feilede kjøringer over tid' },
    legend: { position: 'bottom' },
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
    y: { beginAtZero: true },
  },
}

interface Props {
  data: FeilTidsserieDatapunkt[]
}

export default function FeilTidsserieChart({ data }: Props) {
  const chartData = useMemo(() => {
    if (data.length === 0) return null

    const perioder = data.map((d) => d.periodeFra)

    const result: ChartData<'bar'> = {
      labels: perioder,
      datasets: [
        {
          label: 'Feilede kjøringer',
          data: perioder.map((_, i) => data[i].antallFeil),
          backgroundColor: 'rgba(195, 0, 0, 0.5)',
          borderColor: 'rgba(195, 0, 0, 1)',
          borderWidth: 1,
        },
      ],
    }
    return result
  }, [data])

  if (!chartData) {
    return (
      <Box padding="space-32" style={{ textAlign: 'center' }}>
        <BodyShort>Ingen feil i valgt tidsrom</BodyShort>
      </Box>
    )
  }

  return (
    <div>
      <div style={{ maxHeight: '500px' }} role="img" aria-label="Søylediagram: Feilede kjøringer over tid">
        <Bar options={options} data={chartData} />
      </div>
      <ChartDataTable
        data={data}
        columns={[
          { key: 'periodeFra', label: 'Periode', format: formatPeriode },
          { key: 'antallFeil', label: 'Antall feil', format: formatTall },
          { key: 'antallUnikeFeilmeldinger', label: 'Unike feilmeldinger', format: formatTall },
        ]}
      />
    </div>
  )
}
