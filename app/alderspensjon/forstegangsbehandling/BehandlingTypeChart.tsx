import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip, type TooltipModel } from 'chart.js'
import { useRef, useState } from 'react'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface BehandlingTyper {
  auto: number
  manuell: number
  delAuto: number
  ikkeFullort: number
}

interface BehandlingTypeChartProps {
  behandlingTyper: BehandlingTyper
}

export function BehandlingTypeChart({ behandlingTyper }: BehandlingTypeChartProps) {
  const chartRef = useRef(null)
  const [tooltip, setTooltip] = useState<{
    visible: boolean
    x: number
    y: number
    label: string
    count: number
    percentage: string
  } | null>(null)

  const total = behandlingTyper.auto + behandlingTyper.manuell + behandlingTyper.delAuto + behandlingTyper.ikkeFullort

  if (total === 0) {
    return <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Ingen data</span>
  }

  // Calculate percentages for distribution
  const autoPercent = (behandlingTyper.auto / total) * 100
  const delAutoPercent = (behandlingTyper.delAuto / total) * 100
  const manuellPercent = (behandlingTyper.manuell / total) * 100
  const ikkeFullfortPercent = (behandlingTyper.ikkeFullort / total) * 100

  const data = {
    labels: [''],
    datasets: [
      {
        label: 'Ikke fullført',
        data: [ikkeFullfortPercent],
        backgroundColor: 'rgba(255, 194, 194, 0.5)', // red-100 with opacity
        borderColor: 'rgba(195, 0, 0, 1)', // red-500
        borderWidth: 1,
        borderSkipped: false,
        barThickness: 24,
      },
      {
        label: 'Manuell',
        data: [manuellPercent],
        backgroundColor: 'rgba(255, 193, 102, 0.5)', // orange-300 with opacity
        borderColor: 'rgba(199, 115, 0, 1)', // orange-600
        borderWidth: 1,
        borderSkipped: false,
        barThickness: 24,
      },
      {
        label: 'Delvis auto',
        data: [delAutoPercent],
        backgroundColor: 'rgba(204, 225, 255, 0.5)', // blue-100 with opacity
        borderColor: 'rgba(51, 134, 224, 1)', // blue-400
        borderWidth: 1,
        borderSkipped: false,
        barThickness: 24,
      },
      {
        label: 'Auto',
        data: [autoPercent],
        backgroundColor: 'rgba(153, 222, 173, 0.5)', // green-200 with opacity
        borderColor: 'rgba(42, 167, 88, 1)', // green-400
        borderWidth: 1,
        borderSkipped: false,
        barThickness: 24,
      },
    ],
  }

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
        external: (context: { chart: ChartJS; tooltip: TooltipModel<'bar'> }) => {
          const tooltipModel = context.tooltip

          if (tooltipModel.opacity === 0 || !tooltipModel.dataPoints?.[0]) {
            setTooltip(null)
            return
          }

          const dataPoint = tooltipModel.dataPoints[0]
          const datasetIndex = dataPoint.datasetIndex
          const percentage = (dataPoint.parsed.x ?? 0).toFixed(1)
          let count = 0
          let label = ''

          if (datasetIndex === 0) {
            count = behandlingTyper.ikkeFullort
            label = 'Ikke fullført'
          } else if (datasetIndex === 1) {
            count = behandlingTyper.manuell
            label = 'Manuell'
          } else if (datasetIndex === 2) {
            count = behandlingTyper.delAuto
            label = 'Delvis auto'
          } else if (datasetIndex === 3) {
            count = behandlingTyper.auto
            label = 'Auto'
          }

          const position = context.chart.canvas.getBoundingClientRect()

          setTooltip({
            visible: true,
            x: position.left + tooltipModel.caretX,
            y: position.top + window.scrollY - 40,
            label,
            count,
            percentage,
          })
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        display: false,
        min: 0,
        max: 100,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: true,
        display: false,
        grid: {
          display: false,
        },
      },
    },
  }

  return (
    <>
      <div style={{ height: '24px', width: '200px', minWidth: '200px', position: 'relative' }}>
        <Bar ref={chartRef} data={data} options={options} />
      </div>
      {tooltip?.visible && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          {tooltip.label}: {tooltip.count} ({tooltip.percentage}%)
        </div>
      )}
    </>
  )
}
