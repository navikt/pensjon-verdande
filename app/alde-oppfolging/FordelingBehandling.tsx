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
          'rgba(147, 112, 219, 0.5)', // purple
          'rgba(66, 133, 244, 0.5)', // blue
        ],
        borderColor: [
          'rgba(102, 51, 153, 1)', // purple
          'rgba(25, 103, 210, 1)', // blue
        ],
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
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
