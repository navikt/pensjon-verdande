import { Heading, HStack, VStack } from '@navikt/ds-react'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Data {
  status: string
  antall: number
}

interface AldeOppsummeringProps {
  data: Data[]
  title: string
}

export const AldePieChart: React.FC<AldeOppsummeringProps> = ({ data, title }) => {
  const parsedData = {
    labels: data.map((item) => item.status),
    datasets: [
      {
        label: title,
        data: data.map((item) => item.antall),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        enabled: true,
      },
    },
  }

  return (
    <HStack>
      <VStack align="center">
        <Heading size="small">{title}</Heading>
        <Pie data={parsedData} options={options} />
      </VStack>
    </HStack>
  )
}

export default AldePieChart
