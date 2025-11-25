import { VStack } from '@navikt/ds-react'
import type { ChartOptions, TooltipItem } from 'chart.js'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Pie } from 'react-chartjs-2'
import { statusColors, statusLabels } from './StatusfordelingOverTidBarChart/utils'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Data {
  status: string
  antall: number
}

interface AldeOppsummeringProps {
  data: Data[]
  title?: string
  hiddenStatuses?: string[]
}

export const FordelingAldeStatus: React.FC<AldeOppsummeringProps> = ({ data, hiddenStatuses = [] }) => {
  // Kopier data slik at vi kan justere UNDER_BEHANDLING for å trekke ut UNDER_ATTESTERING
  const underAttesteringAntall = data.find((d) => d.status === 'UNDER_ATTESTERING')?.antall || 0
  const underBehandling = data.find((d) => d.status === 'UNDER_BEHANDLING')?.antall || 0

  const adjustedData = data.map((item) => {
    if (item.status === 'UNDER_BEHANDLING') {
      const justert = Math.max(item.antall - underAttesteringAntall, 0)
      return { ...item, antall: justert }
    }
    return item
  })

  const parsedData = {
    labels: adjustedData.map((item) => statusLabels[item.status] || item.status),
    datasets: [
      {
        data: adjustedData.map((item) => (hiddenStatuses.includes(item.status) ? 0 : item.antall)),
        backgroundColor: adjustedData.map((item) => {
          const colors = statusColors[item.status]
          return colors?.backgroundColor || 'var(--a-surface-neutral-subtle)'
        }),
        borderColor: adjustedData.map((item) => {
          const colors = statusColors[item.status]
          return colors?.borderColor || 'var(--a-border-default)'
        }),
        borderWidth: 1,
      },
    ],
  }

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (ctx: TooltipItem<'pie'>) => {
            const label = ctx.label || ''
            const value = (ctx.parsed as number) || 0
            const dataArr = ctx.chart.data.datasets[ctx.datasetIndex].data as number[]
            const total = dataArr.reduce((a, b) => a + b, 0)
            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
            if (ctx.label === (statusLabels['UNDER_BEHANDLING'] || 'UNDER_BEHANDLING')) {
              return `${label}: ${value} (${percent}%) uten under attestering, totalt inkl: ${underBehandling}`
            }
            if (ctx.label === (statusLabels['UNDER_ATTESTERING'] || 'UNDER_ATTESTERING')) {
              return `${label}: ${value} (${percent}%) del av Under behandling`
            }
            return `${label}: ${value} (${percent}%)`
          },
        },
      },
      title: {
        display: true,
        text: 'Status på alde behandlinger',
      },
    },
  }

  return (
    <VStack align="center" style={{ maxHeight: '300px' }}>
      <Pie data={parsedData} options={options} />
    </VStack>
  )
}

export default FordelingAldeStatus
