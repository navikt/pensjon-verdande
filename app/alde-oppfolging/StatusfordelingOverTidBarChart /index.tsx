import { BodyShort } from '@navikt/ds-react'
import type { ChartData, ChartOptions } from 'chart.js'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import type { AldeFordelingStatusOverTidDto } from '../types'
import { parseToChartData, statusColors, statusLabels } from './utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface StatusfordelingOverTidBarChartProps {
  data: AldeFordelingStatusOverTidDto[]
  fomDate: string
  tomDate: string
  hiddenStatuses?: string[]
}

export const options: ChartOptions<'bar'> = {
  plugins: {
    title: {
      display: true,
      text: 'Statusfordeling over tid',
    },
    legend: {
      display: false,
    },
  },
  responsive: true,
  scales: {
    x: {
      stacked: true,
      ticks: {
        callback: function (value) {
          const label = this.getLabelForValue(value as number)
          // Convert from yyyy-MM-dd to dd.MM.yyyy
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

const StatusfordelingOverTidBarChart: React.FC<StatusfordelingOverTidBarChartProps> = ({
  data,
  hiddenStatuses = [],
}) => {
  const chartData = useMemo(() => {
    const [labels, parsedData] = parseToChartData(data)

    // Handle empty data
    if (!parsedData || parsedData.length === 0 || !parsedData[0]) {
      return null
    }

    const result: ChartData<'bar'> = {
      labels,
      datasets: Object.entries(parsedData[0]).map(([status, counts]) => {
        const colors = statusColors[status] || {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderColor: 'rgb(0, 0, 0)',
        }

        return {
          label: statusLabels[status] || status,
          data: counts,
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          borderWidth: 1,
          hidden: hiddenStatuses.includes(status),
        }
      }),
    }

    return result
  }, [data, hiddenStatuses])

  if (!chartData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <BodyShort>Ingen behandlinger i tidsrommet</BodyShort>
      </div>
    )
  }

  return (
    <div style={{ maxHeight: '500px' }}>
      <Bar options={options} data={chartData} />
    </div>
  )
}

export default StatusfordelingOverTidBarChart
