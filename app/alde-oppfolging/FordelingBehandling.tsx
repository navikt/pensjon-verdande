import { VStack } from '@navikt/ds-react'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Data {
  behandlingType: string
  antall: number
}

interface AldeOppsummeringProps {
  data: Data[]
  title?: string
}

export const FordelingBehandlingStatus: React.FC<AldeOppsummeringProps> = ({ data }) => {
  // Find AldeBehandling and Behandling counts
  const aldeBehandling = data.find((item) => item.behandlingType === 'AldeBehandling')?.antall || 0
  const behandling = data.find((item) => item.behandlingType === 'Behandling')?.antall || 0
  const behandlingMinusAlde = behandling - aldeBehandling

  const parsedData = {
    labels: ['Alde behandling', 'Andre behandlinger'],
    datasets: [
      {
        data: [aldeBehandling, behandlingMinusAlde],
        backgroundColor: [
          'rgba(153, 222, 173, 0.5)', // green
          'rgba(255, 194, 194, 0.5)', // red
        ],
        borderColor: [
          'rgba(42, 167, 88, 1)', // green
          'rgba(195, 0, 0, 1)', // red
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
        display: false,
      },
      tooltip: {
        enabled: true,
      },
      title: {
        display: true,
        text: 'Alle behandlinger',
      },
    },
  }

  return (
    <VStack align="center" style={{ maxHeight: '300px' }}>
      <Pie data={parsedData} options={options} />
    </VStack>
  )
}

export default FordelingBehandlingStatus
