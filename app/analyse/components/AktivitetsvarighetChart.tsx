import { BodyShort, Box } from '@navikt/ds-react'
import type { ChartData, ChartOptions } from 'chart.js'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import type { AktivitetsvarighetStatistikk } from '../types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`
  return `${(seconds / 3600).toFixed(1)}t`
}

interface Props {
  data: AktivitetsvarighetStatistikk[]
}

export default function AktivitetsvarighetChart({ data }: Props) {
  const chartData = useMemo(() => {
    if (data.length === 0) return null

    const sorted = [...data].sort((a, b) => b.gjennomsnittSekunder - a.gjennomsnittSekunder)

    const result: ChartData<'bar'> = {
      labels: sorted.map((d) => d.aktivitetType),
      datasets: [
        {
          label: 'Gjennomsnitt',
          data: sorted.map((d) => d.gjennomsnittSekunder),
          backgroundColor: 'rgba(51, 134, 224, 0.7)',
          borderColor: 'rgba(51, 134, 224, 1)',
          borderWidth: 1,
        },
        {
          label: 'Median',
          data: sorted.map((d) => d.medianSekunder),
          backgroundColor: 'rgba(42, 167, 88, 0.7)',
          borderColor: 'rgba(42, 167, 88, 1)',
          borderWidth: 1,
        },
        {
          label: 'P90',
          data: sorted.map((d) => d.p90Sekunder),
          backgroundColor: 'rgba(199, 115, 0, 0.5)',
          borderColor: 'rgba(199, 115, 0, 1)',
          borderWidth: 1,
        },
      ],
    }
    return result
  }, [data])

  const options: ChartOptions<'bar'> = useMemo(
    () => ({
      indexAxis: 'y' as const,
      plugins: {
        title: { display: true, text: 'Varighet per aktivitetssteg (sekunder)' },
        legend: { display: true, position: 'top' as const },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${formatDuration(ctx.parsed.x ?? 0)}`,
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true,
          title: { display: true, text: 'Sekunder' },
          ticks: {
            callback: (value) => formatDuration(Number(value)),
          },
        },
      },
    }),
    [],
  )

  if (!chartData) {
    return (
      <Box padding="space-32" style={{ textAlign: 'center' }}>
        <BodyShort>Ingen data i valgt tidsrom</BodyShort>
      </Box>
    )
  }

  return (
    <div
      style={{ height: `${Math.max(300, data.length * 60)}px` }}
      role="img"
      aria-label="Horisontalt søylediagram: Varighet per aktivitetssteg"
    >
      <Bar options={options} data={chartData} />
    </div>
  )
}
