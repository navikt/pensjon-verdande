import { Heading, HStack, VStack } from '@navikt/ds-react'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Pie } from 'react-chartjs-2'
import type { AldeOppsummeringDto } from './types'

ChartJS.register(ArcElement, Tooltip, Legend)

interface AldeOppsummeringProps {
  data: AldeOppsummeringDto
  fomDato: string
  tomDato: string
}

export const AldeOppsummeringVisning: React.FC<AldeOppsummeringProps> = ({ data }) => {
  const statusChartData = {
    labels: ['Under behandling', 'Fullførte', 'Avbrutte'],
    datasets: [
      {
        label: 'Alde behandlinger',
        data: [data.aldeBehandlingerUnderBehandling, data.fullforteAldeBehandlinger, data.avbrutteAldeBehandlingr],
        backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  }

  const treatmentTypeChartData = {
    labels: ['Alde behandlinger', 'Andre behandlinger'],
    datasets: [
      {
        label: 'Behandlinger',
        data: [data.antallAldeBehandlinger, data.antallBehandlinger - data.antallAldeBehandlinger],
        backgroundColor: ['rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)'],
        borderColor: ['rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
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
    <div>
      <p>Antall behandlinger: {data.antallBehandlinger}</p>
      <p>Antall alde behandlinger: {data.antallAldeBehandlinger}</p>
      <p>Antall alde behandlinger under behandling: {data.aldeBehandlingerUnderBehandling}</p>
      <p>Antall alde fullførte behandlinger: {data.fullforteAldeBehandlinger}</p>
      <p>Antall alde avbrutte behandlinger: {data.avbrutteAldeBehandlingr}</p>

      <HStack>
        <VStack align="center">
          <Heading size="small">Behandlingstyper</Heading>
          <Pie data={treatmentTypeChartData} options={options} />
        </VStack>
        <VStack align="center">
          <Heading size="small">Alde behandlinger status</Heading>
          <Pie data={statusChartData} options={options} />
        </VStack>
      </HStack>
    </div>
  )
}
