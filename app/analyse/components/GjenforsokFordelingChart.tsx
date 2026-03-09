import { BodyShort, Box } from '@navikt/ds-react'
import type { ChartData, ChartOptions } from 'chart.js'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import type { GjenforsokFordelingPunkt } from '../types'
import { ChartDataTable, formatTall } from './ChartDataTable'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const options: ChartOptions<'bar'> = {
  plugins: {
    title: { display: true, text: 'Fordeling: antall kjøringer per aktivitet' },
    legend: { display: false },
  },
  responsive: true,
  scales: {
    x: { title: { display: true, text: 'Antall kjøringer' } },
    y: { beginAtZero: true, title: { display: true, text: 'Antall aktiviteter' } },
  },
}

interface Props {
  data: GjenforsokFordelingPunkt[]
}

export default function GjenforsokFordelingChart({ data }: Props) {
  const chartData = useMemo(() => {
    if (data.length === 0) return null

    const result: ChartData<'bar'> = {
      labels: data.map((d) => `${d.antallKjoringer}x`),
      datasets: [
        {
          label: 'Aktiviteter',
          data: data.map((d) => d.antallAktiviteter),
          backgroundColor: 'rgba(130, 105, 162, 0.5)',
          borderColor: 'rgba(130, 105, 162, 1)',
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
      <div style={{ maxHeight: '400px' }} role="img" aria-label="Søylediagram: Fordeling av gjenforsøk">
        <Bar options={options} data={chartData} />
      </div>
      <ChartDataTable
        data={data}
        columns={[
          { key: 'antallKjoringer', label: 'Antall kjøringer', format: (v) => `${v}x` },
          { key: 'antallAktiviteter', label: 'Antall aktiviteter', format: formatTall },
        ]}
      />
    </div>
  )
}
