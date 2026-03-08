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
import type { KoDatapunkt } from '../types'
import { formaterPeriodeLabel } from '../utils/formattering'
import { ChartDataTable, formatPeriode, formatSekunder, formatTall } from './ChartDataTable'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

const options: ChartOptions<'bar'> = {
  plugins: {
    title: { display: true, text: 'Gjennomstrømning: opprettet vs. fullført' },
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
  data: KoDatapunkt[]
}

export default function KoChart({ data }: Props) {
  const chartData = useMemo(() => {
    if (data.length === 0) return null

    const perioder = data.map((d) => d.periodeFra)

    const result: ChartData<'bar'> = {
      labels: perioder,
      datasets: [
        {
          label: 'Opprettet',
          data: data.map((d) => d.opprettet),
          backgroundColor: 'rgba(51, 134, 224, 0.5)',
          borderColor: 'rgba(51, 134, 224, 1)',
          borderWidth: 1,
        },
        {
          label: 'Fullført',
          data: data.map((d) => d.fullfort),
          backgroundColor: 'rgba(42, 167, 88, 0.5)',
          borderColor: 'rgba(42, 167, 88, 1)',
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
        aria-label="Søylediagram: Gjennomstrømning – opprettet vs. fullført"
      >
        <Bar options={options} data={chartData} />
      </div>
      <ChartDataTable
        data={data}
        columns={[
          { key: 'periodeFra', label: 'Periode', format: formatPeriode },
          { key: 'opprettet', label: 'Opprettet', format: formatTall },
          { key: 'fullfort', label: 'Fullført', format: formatTall },
          { key: 'gjennomsnittVentetidSekunder', label: 'Snitt ventetid', format: formatSekunder },
        ]}
      />
    </div>
  )
}
