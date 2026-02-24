import { Heading, VStack } from '@navikt/ds-react'
import styles from './bubbles.module.css'

export type BubbleItem = {
  id: string
  yearMonthDay: string // YYYY-MM-DD
  time?: string // HH:mm
  tagText?: string // f.eks "USA · 67+ · Alder+Uføre"
  tagColorKey?: string // stabil farge per type
  status?: 'FERDIG' | 'KJØRER' | 'FEILET' | 'OPPRETTET'
  antallPersoner?: number
  description?: string // valgfri tekst i bobla (f.eks "Grunnlag", "Søk", "Kjøring")
  selected?: boolean // for steg 3 (multi-select)
}

type Props = {
  title?: string
  items: BubbleItem[]
  emptyText?: string
  onClickItem?: (item: BubbleItem) => void
}

function hash(s?: string) {
  if (!s) return 0
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

const PALETT = [
  '#0044CC',
  '#FF3B30',
  '#2DD36F',
  '#FFA500',
  '#8E44AD',
  '#00BFFF',
  '#FF69B4',
  '#32CD32',
  '#FFD700',
  '#FF4500',
  '#00CED1',
  '#9B870C',
  '#1E90FF',
  '#AD1457',
  '#20B2AA',
  '#C71585',
  '#FF8C00',
  '#6A5ACD',
]

function tagColors(key?: string) {
  const bg = PALETT[hash(key) % PALETT.length]
  return { bg, fg: '#fff' }
}

function weekdayFromYmd(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1).getDay()
}

function dayLabel(w: number) {
  return ['SØN', 'MAN', 'TIR', 'ONS', 'TOR', 'FRE', 'LØR'][w] ?? ''
}

function monthLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  return new Intl.DateTimeFormat('no-NO', { month: 'long', year: 'numeric' }).format(new Date(y, (m ?? 1) - 1, 1))
}

export default function LeveattestKontroll({ title, items, emptyText, onClickItem }: Props) {
  if (!items?.length) {
    return (
      <VStack gap="space-8">
        {title && <Heading size="xsmall">{title}</Heading>}
        <span style={{ opacity: 0.7 }}>{emptyText ?? 'Ingen elementer.'}</span>
      </VStack>
    )
  }

  const groups = items.reduce<Record<string, BubbleItem[]>>((acc, it) => {
    const key = it.yearMonthDay.slice(0, 7)
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(it)
    return acc
  }, {})

  const keys = Object.keys(groups).sort()

  const bubbleClass = (it: BubbleItem) => {
    const cls = [styles.bubble]
    if (it.status === 'KJØRER') cls.push(styles.statusRunning)
    if (it.status === 'FEILET') cls.push(styles.statusFailed)
    if (it.selected) cls.push(styles.selected)
    return cls.join(' ')
  }

  return (
    <VStack gap="space-8" className={styles.wrapper}>
      {title && <Heading size="medium">{title}</Heading>}

      {keys.map((key) => {
        const list = groups[key]
          .slice()
          .sort((a, b) => (a.yearMonthDay + (a.time ?? '') < b.yearMonthDay + (b.time ?? '') ? -1 : 1))

        return (
          <VStack key={key} gap="space-4">
            <div className={styles.groupTitle}>{monthLabel(key)}</div>

            <div className={styles.grid}>
              {list.map((it) => {
                const w = weekdayFromYmd(it.yearMonthDay)
                const { bg, fg } = tagColors(it.tagColorKey ?? it.tagText)

                const tooltipParts = [
                  it.description,
                  it.tagText,
                  it.status ? `Status: ${it.status}` : undefined,
                  it.antallPersoner != null ? `${it.antallPersoner} personer` : undefined,
                ].filter(Boolean)

                return (
                  <button
                    key={it.id}
                    type="button"
                    className={bubbleClass(it)}
                    onClick={() => onClickItem?.(it)}
                    title={tooltipParts.join(' • ')}
                  >
                    <div className={styles.topRow}>
                      <span className={styles.day}>{dayLabel(w)}</span>
                      <span className={styles.date}>{it.yearMonthDay}</span>
                      {it.time && <span className={styles.time}>{it.time}</span>}
                    </div>

                    {it.description && <div className={styles.meta}>{it.description}</div>}
                    {it.antallPersoner != null && <div className={styles.count}>{it.antallPersoner} personer</div>}

                    {it.tagText && (
                      <span className={styles.tag} style={{ backgroundColor: bg, color: fg }}>
                        {it.tagText}
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
