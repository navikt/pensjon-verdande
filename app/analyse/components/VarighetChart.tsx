import { BodyShort, Box } from '@navikt/ds-react'
import type { ChartData, ChartOptions } from 'chart.js'
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
import { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import type { VarighetTidsseriePunkt } from '../types'
import { varighetColors } from '../utils/chartColors'
import { formaterPeriodeLabel, formaterVarighet } from '../utils/formattering'
import { ChartDataTable, formatPeriode, formatSekunder, formatTall } from './ChartDataTable'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const options: ChartOptions<'line'> = {
  plugins: {
    title: { display: true, text: 'Varighetsutvikling over tid' },
    legend: { position: 'bottom' },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: ${formaterVarighet(ctx.parsed.y)}`,
      },
    },
  },
  responsive: true,
  scales: {
    x: {
      ticks: {
        callback: function (value) {
          return formaterPeriodeLabel(this.getLabelForValue(value as number))
        },
      },
    },
    y: {
      ticks: {
        callback: (value) => formaterVarighet(value as number),
      },
    },
  },
}

interface Props {
  data: VarighetTidsseriePunkt[]
}

export default function VarighetChart({ data }: Props) {
  const chartData = useMemo(() => {
    if (data.length === 0) return null

    const perioder = data.map((d) => d.periodeFra)

    const result: ChartData<'line'> = {
      labels: perioder,
      datasets: [
        {
          label: 'Gjennomsnitt',
          data: data.map((d) => d.varighet.gjennomsnittSekunder),
          borderColor: varighetColors.gjennomsnitt.borderColor,
          backgroundColor: varighetColors.gjennomsnitt.backgroundColor,
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 3,
        },
        {
          label: 'Median',
          data: data.map((d) => d.varighet.medianSekunder),
          borderColor: varighetColors.median.borderColor,
          backgroundColor: varighetColors.median.backgroundColor,
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.3,
          pointRadius: 3,
        },
        {
          label: 'P90',
          data: data.map((d) => d.varighet.p90Sekunder),
          borderColor: varighetColors.p90.borderColor,
          backgroundColor: varighetColors.p90.backgroundColor,
          borderWidth: 1,
          fill: true,
          tension: 0.3,
          pointRadius: 2,
        },
        {
          label: 'P95',
          data: data.map((d) => d.varighet.p95Sekunder),
          borderColor: varighetColors.p95.borderColor,
          backgroundColor: varighetColors.p95.backgroundColor,
          borderWidth: 1,
          fill: true,
          tension: 0.3,
          pointRadius: 2,
        },
      ],
    }
    return result
  }, [data])

  if (!chartData) {
    return (
      <Box padding="space-32" style={{ textAlign: 'center' }}>
        <BodyShort>Ingen varighetsdata i valgt tidsrom</BodyShort>
      </Box>
    )
  }

  const tableData = data.map((d) => ({
    periodeFra: d.periodeFra,
    antall: d.antall,
    gjennomsnittSekunder: d.varighet.gjennomsnittSekunder,
    medianSekunder: d.varighet.medianSekunder,
    p90Sekunder: d.varighet.p90Sekunder,
    p95Sekunder: d.varighet.p95Sekunder,
  }))

  return (
    <div>
      <div
        style={{ maxHeight: '500px' }}
        role="img"
        aria-label="Linjediagram: Varighetsstatistikk (snitt, median, P90, P95)"
      >
        <Line options={options} data={chartData} />
      </div>
      <ChartDataTable
        data={tableData}
        columns={[
          { key: 'periodeFra', label: 'Periode', format: formatPeriode },
          { key: 'antall', label: 'Antall', format: formatTall },
          { key: 'gjennomsnittSekunder', label: 'Gjennomsnitt', format: formatSekunder },
          { key: 'medianSekunder', label: 'Median', format: formatSekunder },
          { key: 'p90Sekunder', label: 'P90', format: formatSekunder },
          { key: 'p95Sekunder', label: 'P95', format: formatSekunder },
        ]}
      />
    </div>
  )
}
