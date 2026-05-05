import { BodyShort, Box } from '@navikt/ds-react'
import type { ChartData, ChartOptions } from 'chart.js'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import type { ManuellOppgaveTidsserieDatapunkt } from '../types'
import { formaterPeriodeLabel, formaterTall } from '../utils/formattering'
import { ChartDataTable, formatPeriode, formatTall } from './ChartDataTable'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface Props {
  data: ManuellOppgaveTidsserieDatapunkt[]
  oppgaveKategori: string
}

const palette = [
  { bg: 'rgba(54, 162, 235, 0.5)', border: 'rgba(54, 162, 235, 1)' },
  { bg: 'rgba(255, 159, 64, 0.5)', border: 'rgba(255, 159, 64, 1)' },
  { bg: 'rgba(153, 102, 255, 0.5)', border: 'rgba(153, 102, 255, 1)' },
  { bg: 'rgba(75, 192, 192, 0.5)', border: 'rgba(75, 192, 192, 1)' },
  { bg: 'rgba(255, 99, 132, 0.5)', border: 'rgba(255, 99, 132, 1)' },
]

export default function ManuelleOppgaverTidsserieChart({ data, oppgaveKategori }: Props) {
  const chartData = useMemo(() => {
    if (data.length === 0) return null

    const periodeSet = new Set<string>()
    const grupper = new Map<string, Map<string, number>>()

    for (const dp of data) {
      periodeSet.add(dp.periodeFra)
      if (!grupper.has(dp.oppgaveKategori)) grupper.set(dp.oppgaveKategori, new Map())
      const m = grupper.get(dp.oppgaveKategori)
      m?.set(dp.periodeFra, (m.get(dp.periodeFra) ?? 0) + dp.antall)
    }

    const perioder = [...periodeSet].sort()
    const sortedGrupper = [...grupper.keys()].sort()

    const datasets = sortedGrupper.map((gruppe, i) => {
      const gruppeMap = grupper.get(gruppe) ?? new Map<string, number>()
      const colors = palette[i % palette.length]
      return {
        label: gruppe,
        data: perioder.map((p) => gruppeMap.get(p) ?? 0),
        backgroundColor: colors.bg,
        borderColor: colors.border,
        borderWidth: 1,
      }
    })

    return { labels: perioder, datasets } as ChartData<'bar'>
  }, [data])

  const options: ChartOptions<'bar'> = useMemo(
    () => ({
      responsive: true,
      plugins: {
        title: { display: true, text: `Manuelle oppgaver over tid – ${oppgaveKategori}` },
        legend: { position: 'bottom' },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
          callbacks: {
            title: (items) => formaterPeriodeLabel(items[0]?.label ?? ''),
            label: (item) => `${item.dataset.label}: ${formaterTall(item.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            callback: function (value) {
              return formaterPeriodeLabel(this.getLabelForValue(value as number))
            },
            maxTicksLimit: 12,
          },
        },
        y: {
          stacked: true,
          beginAtZero: true,
        },
      },
    }),
    [oppgaveKategori],
  )

  if (!chartData) {
    return (
      <Box padding="space-32" style={{ textAlign: 'center' }}>
        <BodyShort>Ingen data i valgt tidsrom for «{oppgaveKategori}»</BodyShort>
      </Box>
    )
  }

  return (
    <div>
      <div
        style={{ maxHeight: '400px' }}
        role="img"
        aria-label={`Søylediagram: Manuelle oppgaver over tid – ${oppgaveKategori}`}
      >
        <Bar options={options} data={chartData} />
      </div>
      <ChartDataTable
        data={data}
        columns={[
          { key: 'periodeFra', label: 'Periode', format: formatPeriode },
          { key: 'oppgaveKategori', label: 'Oppgavekategori' },
          { key: 'antall', label: 'Antall', format: formatTall },
        ]}
      />
    </div>
  )
}
