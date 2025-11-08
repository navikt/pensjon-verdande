import { VStack } from '@navikt/ds-react'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Pie } from 'react-chartjs-2'
import { statusColors, statusLabels } from './StatusfordelingOverTidBarChart /utils'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Data {
  status: string
  antall: number
}

interface AldeOppsummeringProps {
  data: Data[]
  title?: string
  hiddenStatuses?: string[]
}

export const FordelingAldeStatus: React.FC<AldeOppsummeringProps> = ({ data, hiddenStatuses = [] }) => {
  const parsedData = {
    labels: data.map((item) => statusLabels[item.status] || item.status),
    datasets: [
      {
        data: data.map((item) => (hiddenStatuses.includes(item.status) ? 0 : item.antall)),
        backgroundColor: data.map((item) => {
          const colors = statusColors[item.status]
          return colors?.backgroundColor || 'var(--a-surface-neutral-subtle)'
        }),
        borderColor: data.map((item) => {
          const colors = statusColors[item.status]
          return colors?.borderColor || 'var(--a-border-default)'
        }),
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
      title: {
        display: true,
        text: 'Status på alde behandlinger',
      },
    },
  }

  return (
    <VStack align="center" style={{ maxHeight: '300px' }}>
      <Pie data={parsedData} options={options} />
    </VStack>
  )
}

export default FordelingAldeStatus
