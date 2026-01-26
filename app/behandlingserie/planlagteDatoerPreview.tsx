import { Heading, VStack } from '@navikt/ds-react'
import styles from './css/previewBubbles.module.css'

type SerieTagStyle = React.CSSProperties & {
  '--serie-bg'?: string
  '--serie-fg'?: string
}

export type PlannedItem = {
  id: string
  yearMonthDay: string // YYYY-MM-DD
  time?: string // HH:mm
  status?: string
  behandlingId?: string
  behandlingCode?: string
  serieId?: string
}

type Props = {
  title?: string
  items: PlannedItem[]
  onClickItem?: (item: PlannedItem) => void
}

function hashSerieId(id?: string) {
  if (!id) return 0
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return Math.abs(h)
}

const PALETT = [
  '#0044CC', // klar blå
  '#FF3B30', // rød
  '#2DD36F', // grønn
  '#FFA500', // oransje
  '#8E44AD', // lilla
  '#00BFFF', // himmelblå
  '#FF69B4', // rosa
  '#32CD32', // limegrønn
  '#FFD700', // gul
  '#FF4500', // orangerød
  '#00CED1', // turkis
  '#9B870C', // gyllen brun
  '#1E90FF', // sterk blå
  '#AD1457', // mørk rosa
  '#20B2AA', // aquagrønn
  '#C71585', // magenta
  '#FF8C00', // mørk oransje
  '#6A5ACD', // blå-lilla
  '#2E8B57', // mørk grønn
  '#DC143C', // crimson
  '#4682B4', // stålblå
  '#FF6347', // tomato
  '#008B8B', // cyan-teal
  '#B8860B', // mørk gyllen
]

function fargeForSerie(serieId?: string) {
  const bg = PALETT[hashSerieId(serieId) % PALETT.length]
  const fg = '#fff'
  return { bg, fg }
}

function shortSerieId(id?: string) {
  if (!id) return ''
  return `***${id.slice(-4)}`
}

function weekdayFromyearMonthDay(yearMonthDay: string): number {
  const [y, m, d] = yearMonthDay.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1).getDay()
}
function dayLabel(weekday: number) {
  return ['SØN', 'MAN', 'TIR', 'ONS', 'TOR', 'FRE', 'LØR'][weekday] ?? ''
}

export default function PlanlagteDatoerPreview({ title, items, onClickItem }: Props) {
  if (!items || items.length === 0) {
    return (
      <VStack gap="space-2">
        {title && <Heading size="xsmall">{title}</Heading>}
        <span style={{ opacity: 0.7 }}>Ingen planlagte kjøringer.</span>
      </VStack>
    )
  }

  // grupper per måned (YYYY-MM)
  const groups = items.reduce<Record<string, PlannedItem[]>>((acc, it) => {
    const key = it.yearMonthDay.slice(0, 7)

    let bucket = acc[key]
    if (!bucket) {
      bucket = []
      acc[key] = bucket
    }

    bucket.push(it)
    return acc
  }, {})

  const keys = Object.keys(groups).sort()

  const monthLabel = (ym: string) => {
    const [y, m] = ym.split('-').map(Number)
    return new Intl.DateTimeFormat('no-NO', { month: 'long', year: 'numeric' }).format(new Date(y, (m ?? 1) - 1, 1))
  }

  return (
    <VStack
      gap="space-2"
      style={{
        background: 'var(--a-surface-neutral-subtle, #f3f3f3)',
        padding: '1rem',
        borderRadius: '0.5rem',
      }}
    >
      {title && <Heading size="medium">{title}</Heading>}
      {keys.map((key) => {
        const list = groups[key]
          .slice()
          .sort((a, b) => (a.yearMonthDay + (a.time ?? '') < b.yearMonthDay + (b.time ?? '') ? -1 : 1))
        return (
          <VStack key={key} gap="space-1">
            <strong style={{ textTransform: 'capitalize' }}>{monthLabel(key)}</strong>
            <div className={styles.previewContainer}>
              {list.map((item) => {
                const w = weekdayFromyearMonthDay(item.yearMonthDay)
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onClickItem?.(item)}
                    className={`${styles.previewBubble} ${styles[`day-${w}`]}`}
                    title={`Behandling ${item.behandlingId ?? ''}${item.status ? ` • ${item.status}` : ''}`}
                  >
                    <span className={styles.dayLabel}>{dayLabel(w)}</span>
                    <span className={styles.dateLabel}>{item.yearMonthDay}</span>
                    {item.time && <span className={styles.timeLabel}>{item.time}</span>}
                    {item.serieId && (
                      <span
                        className={styles.serieTag}
                        style={
                          {
                            '--serie-bg': fargeForSerie(item.serieId).bg,
                            '--serie-fg': fargeForSerie(item.serieId).fg,
                          } as SerieTagStyle
                        }
                      >
                        {shortSerieId(item.serieId)}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </VStack>
        )
      })}
    </VStack>
  )
}
