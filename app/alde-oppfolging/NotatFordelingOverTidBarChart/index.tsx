import { BodyShort } from '@navikt/ds-react'
import type { ChartData, ChartOptions } from 'chart.js'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import { statusColors, statusLabels } from '../StatusfordelingOverTidBarChart/utils'
import type { AktivitetStatusFordelingDto } from '../types'
import { byggNotatSerie } from './utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface NotatFordelingOverTidBarChartProps {
  data: AktivitetStatusFordelingDto[]
}

export const options: ChartOptions<'bar'> = {
  plugins: {
    title: {
      display: true,
      text: 'Opprettede notater per dag',
    },
    legend: {
      display: false,
    },
  },
  responsive: true,
  scales: {
    x: {
      ticks: {
        callback: function (value) {
          const label = this.getLabelForValue(value as number)
          const [year, month, day] = label.split('-')
          return `${day}.${month}.${year}`
        },
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0,
      },
    },
  },
}

/**
 * Viser antall ferdigstilte (FULLFORT) notat-aktiviteter per dag, dvs. antall faktisk opprettede
 * (journalførte) Alde-notater. Data kommer fra det generiske
 * GET /api/behandling/alde/oppfolging/aktivitet-status-fordeling, filtrert på
 * aktivitetCode=FleksibelApSak_AldeNotat.
 */
const NotatFordelingOverTidBarChart: React.FC<NotatFordelingOverTidBarChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const serie = byggNotatSerie(data)

    if (!serie) {
      return null
    }

    const colors = statusColors.FULLFORT

    const result: ChartData<'bar'> = {
      labels: serie.datoer,
      datasets: [
        {
          label: statusLabels.FULLFORT || 'Fullført',
          data: serie.antall,
          backgroundColor: colors?.backgroundColor || 'var(--ax-bg-neutral-soft)',
          borderColor: colors?.borderColor || 'var(--ax-border-neutral)',
          borderWidth: 1,
        },
      ],
    }

    return result
  }, [data])

  if (!chartData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <BodyShort>Ingen opprettede notater i valgt periode.</BodyShort>
      </div>
    )
  }

  return (
    <div style={{ maxHeight: '500px' }}>
      <Bar options={options} data={chartData} />
    </div>
  )
}

export default NotatFordelingOverTidBarChart
