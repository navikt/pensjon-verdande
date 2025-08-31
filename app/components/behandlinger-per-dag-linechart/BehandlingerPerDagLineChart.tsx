import type { DatoAntall } from '~/types'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

type Props = {
  opprettetPerDag: DatoAntall[]
  antallDager: number
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

export function BehandlingerPerDagLineChart(props: Props) {
  let now = new Date()
  let days: Date[] = []
  let d = new Date()
  d.setDate(now.getDate() - props.antallDager)
  for (; d <= now; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d))
  }

  let labels = days.map((value) => {
    return (
      value.getDate() + '.' + (value.getMonth() + 1) + '.' + value.getFullYear()
    )
  })

  let data = days.map((value) => {
    let dato =
      value.getFullYear() +
      '-' +
      (value.getMonth() + 1).toString().padStart(2, '0') +
      '-' +
      value.getDate().toString().padStart(2, '0')

    let datoAntall = props.opprettetPerDag.find((value) => value.dato === dato)
    return datoAntall ? datoAntall.antall : 0
  })

  const radius = props.antallDager > 30 ? 1 : 3

  return (
    <Line
      options={{
        responsive: true,
        plugins: {
          legend: {
            display: false,
            position: 'top' as const,
          },
          title: {
            display: false,
          },
          tooltip: {
            mode: 'point',
          },
        },
        scales: {
          x: {
            display: false,
          },
        },
        elements: {
          point: {
            radius: radius,
          },
        },
      }}
      data={{
        labels: labels,
        datasets: [
          {
            label: 'Antall opprettet',
            data: data,
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
            fill: {
              target: 'origin',
              above: 'rgb(53, 162, 235, 0.3)',
            },
            borderWidth: 1,
            backgroundColor: 'rgb(53, 162, 235, 0.3)',
            borderColor: 'rgb(53, 162, 235)',
          },
        ],
      }}
    />
  )
}
