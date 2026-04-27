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

const NYE_COLOR = 'rgba(54, 162, 235, 1)'
const NYE_BG = 'rgba(54, 162, 235, 0.15)'
const OPPHOR_COLOR = 'rgba(255, 99, 132, 1)'
const OPPHOR_BG = 'rgba(255, 99, 132, 0.15)'
const SNITT_COLOR = 'rgba(75, 192, 75, 0.55)'
const SNITT_BORDER = 'rgba(75, 192, 75, 1)'

/**
 * Combo-graf for alderspensjon-mottakere:
 * - Linjer for antall nye og antall opphør per periode (venstre Y-akse)
 * - Søyler for snitt månedlig brutto for nye mottakere (høyre Y-akse, NOK)
 */
export default function MottakereAlderChart({ data }: Props) {
  const chart = useMemo(() => {
    if (data.length === 0) return null

    const sorted = [...data].sort((a, b) => a.periodeFra.localeCompare(b.periodeFra))
    const labels = sorted.map((d) => d.periodeFra)
    const pointRadius = sorted.length > 30 ? 0 : 2

    const datasets: ChartData<'bar' | 'line'>['datasets'] = [
      {
        type: 'line' as const,
        label: 'Nye mottakere',
        data: sorted.map((d) => d.antallNye),
        borderColor: NYE_COLOR,
        backgroundColor: NYE_BG,
        borderWidth: 1.8,
        tension: 0.3,
        pointRadius,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'Opphør',
        data: sorted.map((d) => d.antallOpphor),
        borderColor: OPPHOR_COLOR,
        backgroundColor: OPPHOR_BG,
        borderWidth: 1.8,
        tension: 0.3,
        pointRadius,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: 'Snitt brutto/mnd (NOK, nye)',
        data: sorted.map((d) =>
          d.gjennomsnittBruttoPerAarNyeMottakere == null ? null : d.gjennomsnittBruttoPerAarNyeMottakere / 12,
        ),
        backgroundColor: SNITT_COLOR,
        borderColor: SNITT_BORDER,
        borderWidth: 1,
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
              if (item.dataset.yAxisID === 'y1') {
                return `${item.dataset.label}: ${v.toLocaleString('nb-NO', { maximumFractionDigits: 0 })} kr`
              }
              return `${item.dataset.label}: ${formaterTall(v)}`
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
          beginAtZero: true,
          title: { display: true, text: 'Antall' },
        },
        y1: {
          type: 'linear' as const,
          position: 'right' as const,
          beginAtZero: true,
          grid: { drawOnChartArea: false },
          title: { display: true, text: 'NOK / mnd' },
          ticks: {
            callback: (value) =>
              typeof value === 'number' ? value.toLocaleString('nb-NO', { maximumFractionDigits: 0 }) : String(value),
          },
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
      style={{ height: '320px', position: 'relative' }}
      role="img"
      aria-label="Combo-graf: Nye mottakere og opphør per periode, samt snitt månedlig brutto for nye mottakere"
    >
      <Chart type="bar" data={chart} options={options} />
    </div>
  )
}
