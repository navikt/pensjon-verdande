import { BodyShort, VStack } from '@navikt/ds-react'
import type { ChartData, ChartOptions } from 'chart.js'
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { useMemo } from 'react'
import { Chart } from 'react-chartjs-2'
import type { AlderspensjonMottakereDatapunkt } from '../types'
import { formaterPeriodeLabel, formaterTall } from '../utils/formattering'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend,
)

interface Props {
  data: AlderspensjonMottakereDatapunkt[]
}

const POSITIV_BG = 'rgba(6, 137, 84, 0.55)'
const POSITIV_BORDER = 'rgba(6, 137, 84, 1)'
const NEGATIV_BG = 'rgba(196, 48, 43, 0.55)'
const NEGATIV_BORDER = 'rgba(196, 48, 43, 1)'
const AKKUMULERT_COLOR = 'rgba(99, 102, 241, 1)'
const AKKUMULERT_BG = 'rgba(99, 102, 241, 0.15)'

/**
 * Visualiserer bestandsutvikling for alderspensjon-mottakere:
 * - Søyler per periode for netto endring (antallNye − antallOpphor),
 *   farget grønn ved vekst og rød ved nedgang.
 * - Linje for akkumulert netto over tidsrommet (sekundær y-akse).
 */
export default function NettoEndringChart({ data }: Props) {
  const chart = useMemo(() => {
    if (data.length === 0) return null

    const sorted = [...data].sort((a, b) => a.periodeFra.localeCompare(b.periodeFra))
    const labels = sorted.map((d) => d.periodeFra)
    const netto = sorted.map((d) => d.antallNye - d.antallOpphor)

    let lopende = 0
    const akkumulert = netto.map((n) => {
      lopende += n
      return lopende
    })

    const bgColors = netto.map((n) => (n >= 0 ? POSITIV_BG : NEGATIV_BG))
    const borderColors = netto.map((n) => (n >= 0 ? POSITIV_BORDER : NEGATIV_BORDER))

    const datasets: ChartData<'bar' | 'line'>['datasets'] = [
      {
        type: 'bar' as const,
        label: 'Netto pr. periode',
        data: netto,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'Akkumulert netto',
        data: akkumulert,
        borderColor: AKKUMULERT_COLOR,
        backgroundColor: AKKUMULERT_BG,
        borderWidth: 1.8,
        tension: 0.3,
        pointRadius: sorted.length > 30 ? 0 : 2,
        yAxisID: 'y1',
      },
    ]

    return { labels, datasets } as ChartData<'bar' | 'line'>
  }, [data])

  const options: ChartOptions<'bar' | 'line'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index' as const, intersect: false },
      plugins: {
        legend: { display: true, position: 'top' as const },
        tooltip: {
          callbacks: {
            title: (items) => formaterPeriodeLabel(items[0]?.label ?? ''),
            label: (item) => {
              const v = item.parsed.y
              if (v == null) return `${item.dataset.label}: –`
              const fortegn = v > 0 ? '+' : ''
              return `${item.dataset.label}: ${fortegn}${formaterTall(v)}`
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            callback: function (value) {
              return formaterPeriodeLabel(this.getLabelForValue(value as number))
            },
            maxTicksLimit: 12,
          },
        },
        y: {
          type: 'linear' as const,
          position: 'left' as const,
          title: { display: true, text: 'Netto pr. periode' },
        },
        y1: {
          type: 'linear' as const,
          position: 'right' as const,
          grid: { drawOnChartArea: false },
          title: { display: true, text: 'Akkumulert netto' },
        },
      },
    }),
    [],
  )

  if (!chart) {
    return (
      <VStack gap="space-4" align="center" padding="space-32" style={{ height: '300px', justifyContent: 'center' }}>
        <BodyShort weight="semibold">Ingen datapunkter</BodyShort>
        <BodyShort size="small">Ingen mottakere funnet i valgt tidsrom. Prøv å velge en lengre periode.</BodyShort>
      </VStack>
    )
  }

  return (
    <div
      style={{ height: '300px', position: 'relative' }}
      role="img"
      aria-label="Graf: Netto endring per periode (grønn ved vekst, rød ved nedgang) og akkumulert netto over tidsrommet"
    >
      <Chart type="bar" data={chart} options={options} />
    </div>
  )
}
