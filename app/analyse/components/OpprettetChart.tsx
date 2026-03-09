import { BodyShort, VStack } from '@navikt/ds-react'
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
import { useCallback, useMemo, useRef } from 'react'
import { Line } from 'react-chartjs-2'
import type { TidsserieDatapunkt } from '../types'
import { formaterPeriodeLabel, formaterTall } from '../utils/formattering'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface Props {
  data: TidsserieDatapunkt[]
  onRangeSelect?: (fom: string, tom: string) => void
}

export default function OpprettetChart({ data, onRangeSelect }: Props) {
  const perioderRef = useRef<string[]>([])
  const onRangeSelectRef = useRef(onRangeSelect)
  onRangeSelectRef.current = onRangeSelect

  const perioder = useMemo(() => {
    if (data.length === 0) return []
    const periodeMap = new Map<string, number>()
    for (const dp of data) {
      periodeMap.set(dp.periodeFra, (periodeMap.get(dp.periodeFra) ?? 0) + dp.antall)
    }
    const sorted = [...periodeMap.keys()].sort()
    perioderRef.current = sorted
    return sorted
  }, [data])

  const chartData = useMemo(() => {
    if (perioder.length === 0) return null

    const periodeMap = new Map<string, number>()
    for (const dp of data) {
      periodeMap.set(dp.periodeFra, (periodeMap.get(dp.periodeFra) ?? 0) + dp.antall)
    }
    const antall = perioder.map((p) => periodeMap.get(p) ?? 0)
    const pointRadius = perioder.length > 30 ? 1 : 3

    const result: ChartData<'line'> = {
      labels: perioder,
      datasets: [
        {
          label: 'Antall opprettet',
          data: antall,
          cubicInterpolationMode: 'monotone',
          tension: 0.4,
          fill: { target: 'origin', above: 'rgba(53, 162, 235, 0.3)' },
          borderWidth: 1.5,
          backgroundColor: 'rgba(53, 162, 235, 0.3)',
          borderColor: 'rgb(53, 162, 235)',
          pointRadius,
        },
      ],
    }
    return result
  }, [data, perioder])

  const options: ChartOptions<'line'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: false },
        legend: { display: false },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
          callbacks: {
            title: (items) => formaterPeriodeLabel(items[0]?.label ?? ''),
            label: (item) => `Opprettet: ${formaterTall(item.parsed.y)}`,
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
          beginAtZero: true,
        },
      },
    }),
    [],
  )

  if (!chartData) {
    return (
      <VStack gap="space-4" align="center" padding="space-32" style={{ height: '200px', justifyContent: 'center' }}>
        <BodyShort weight="semibold">Ingen behandlinger funnet</BodyShort>
        <BodyShort size="small">
          Det finnes ingen opprettede behandlinger i valgt tidsrom. Prøv å velge en lengre periode.
        </BodyShort>
      </VStack>
    )
  }

  return (
    <div
      style={{ height: '200px', position: 'relative' }}
      role="img"
      aria-label="Linjediagram: Opprettede behandlinger over tid"
    >
      <Line options={options} data={chartData} />
      {onRangeSelect && <DragOverlay perioder={perioder} onRangeSelect={onRangeSelect} />}
    </div>
  )
}

/** Custom drag overlay — avoids chartjs-plugin-zoom SSR + infinite loop issues */
function DragOverlay({
  perioder,
  onRangeSelect,
}: {
  perioder: string[]
  onRangeSelect: (fom: string, tom: string) => void
}) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const dragState = useRef<{ startX: number; active: boolean }>({ startX: 0, active: false })
  const selectionRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = overlayRef.current?.getBoundingClientRect()
    if (!rect) return
    dragState.current = { startX: e.clientX - rect.left, active: true }
    if (selectionRef.current) {
      selectionRef.current.style.display = 'block'
      selectionRef.current.style.left = `${dragState.current.startX}px`
      selectionRef.current.style.width = '0px'
    }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.current.active || !overlayRef.current || !selectionRef.current) return
    const rect = overlayRef.current.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const left = Math.min(dragState.current.startX, currentX)
    const width = Math.abs(currentX - dragState.current.startX)
    selectionRef.current.style.left = `${left}px`
    selectionRef.current.style.width = `${width}px`
  }, [])

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!dragState.current.active || !overlayRef.current) return
      dragState.current.active = false
      if (selectionRef.current) {
        selectionRef.current.style.display = 'none'
      }

      const rect = overlayRef.current.getBoundingClientRect()
      const startX = dragState.current.startX
      const endX = e.clientX - rect.left
      const minFrac = Math.max(0, Math.min(startX, endX)) / rect.width
      const maxFrac = Math.min(1, Math.max(startX, endX) / rect.width)

      if (Math.abs(maxFrac - minFrac) < 0.02) return // too small

      const minIdx = Math.round(minFrac * (perioder.length - 1))
      const maxIdx = Math.round(maxFrac * (perioder.length - 1))
      const fom = perioder[minIdx]
      const tom = perioder[maxIdx]
      if (fom && tom && fom !== tom) {
        onRangeSelect(fom, tom)
      }
    },
    [perioder, onRangeSelect],
  )

  return (
    <div
      ref={overlayRef}
      role="application"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        dragState.current.active = false
        if (selectionRef.current) selectionRef.current.style.display = 'none'
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        cursor: 'crosshair',
        zIndex: 10,
      }}
    >
      <div
        ref={selectionRef}
        style={{
          display: 'none',
          position: 'absolute',
          top: 0,
          bottom: 0,
          backgroundColor: 'rgba(53, 162, 235, 0.15)',
          borderLeft: '1px solid rgba(53, 162, 235, 0.6)',
          borderRight: '1px solid rgba(53, 162, 235, 0.6)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
