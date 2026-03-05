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
import type { TidspunktAntall } from '~/types'

type Props = {
  kjoringerPerTime: TidspunktAntall[]
  antallDager: number
}

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export function KjoringerPerTimeLineChart(props: Props) {
  const now = new Date()
  const cutoff = new Date()
  cutoff.setDate(now.getDate() - props.antallDager)

  const filtered = props.kjoringerPerTime.filter((it) => new Date(it.tidspunkt) >= cutoff)

  const labels = filtered.map((it) => {
    const d = new Date(it.tidspunkt)
    const dag = `${d.getDate()}.${d.getMonth() + 1}`
    const time = `${d.getHours().toString().padStart(2, '0')}:00`
    return `${dag} ${time}`
  })

  const data = filtered.map((it) => it.antall)

  return (
    <Line
      options={{
        responsive: true,
        plugins: {
          legend: {
            display: false,
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
            radius: props.antallDager > 1 ? 0 : 2,
          },
        },
      }}
      data={{
        labels: labels,
        datasets: [
          {
            label: 'Kjøringer',
            data: data,
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
            fill: {
              target: 'origin',
              above: 'rgb(255, 140, 0, 0.3)',
            },
            borderWidth: 1,
            backgroundColor: 'rgb(255, 140, 0, 0.3)',
            borderColor: 'rgb(255, 140, 0)',
          },
        ],
      }}
    />
  )
}
