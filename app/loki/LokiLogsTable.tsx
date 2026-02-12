import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ExternalLinkIcon,
  FilesIcon,
  MenuElipsisVerticalIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  PlusIcon,
  XMarkIcon,
} from '@navikt/aksel-icons'
import type { SortState, TagProps } from '@navikt/ds-react'
import { ActionMenu, BodyShort, Button, Chips, HStack, Table, Tag, VStack } from '@navikt/ds-react'
import type React from 'react'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { Link as ReactRouterLink } from 'react-router'
import copy from '~/common/clipboard'
import { isSameDay } from '~/common/date'
import {
  isStreams,
  type LokiInstantQueryData,
  type LokiInstantQueryResponse,
  type LokiStream,
} from '~/loki/loki-query-types'
import { type TempoConfiguration, tempoUrl } from '~/loki/utils'
import styles from './LokiLogsTable.module.css'

function hashString(str: string): string {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0
  }
  return (h >>> 0).toString(36)
}

function columnLooksNumeric(streamArray: LokiStream[], value: string): boolean {
  const v = streamArray.find((s) => s.stream[value])?.stream[value]?.trim()
  return !!(v && /^-?\d+(?:[.,]\d+)?$/.test(v))
}

export function selectedColumns(url: string) {
  const sp = new URL(url).searchParams
  const urlCols = sp.get('cols')

  return urlCols
    ? urlCols
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
    : ['_timestamp', 'level', 'message']
}

export function selectedFilters(url: string) {
  const sp = new URL(url).searchParams
  const urlFilters = sp.get('filters')

  let filter: { key: string; value: string; mode: 'in' | 'out' }[] = []
  try {
    if (urlFilters) {
      const parsed = JSON.parse(urlFilters)
      if (Array.isArray(parsed)) filter = parsed
    }
  } catch {
    // ignore
  }

  return filter
}

type FilterMode = 'in' | 'out'

function FieldActionMenu({
  addFilter,
  col,
  value,
}: {
  addFilter: (mode: FilterMode, key: string, value: string) => void
  col: string
  value: string
}) {
  return (
    <ActionMenu>
      <ActionMenu.Trigger>
        <Button
          data-color="neutral"
          variant="tertiary"
          icon={<MenuElipsisVerticalIcon title="Feltmeny" />}
          size="small"
        />
      </ActionMenu.Trigger>
      <ActionMenu.Content>
        <ActionMenu.Item onSelect={() => addFilter('in', col, value)} icon={<PlusCircleIcon />}>
          Inkluder verdi
        </ActionMenu.Item>
        <ActionMenu.Item onSelect={() => addFilter('out', col, value)} icon={<MinusCircleIcon />}>
          Ekskluder verdi
        </ActionMenu.Item>
        <ActionMenu.Item onSelect={() => copy(value)} icon={<FilesIcon />}>
          Kopier
        </ActionMenu.Item>
      </ActionMenu.Content>
    </ActionMenu>
  )
}

function MessageTable({
  s,
  isSelected,
  rowKey,
  HIDE_IN_DETAILS,
  addColumn,
  removeColumn,
  addFilter,
}: {
  s: LokiStream
  isSelected: (key: string) => boolean
  rowKey: string
  HIDE_IN_DETAILS: Set<string>
  addColumn: (key: string) => void
  removeColumn: (key: string) => void
  addFilter: (mode: FilterMode, key: string, value: string) => void
}) {
  const entries = useMemo(
    () => Object.entries(s.stream).sort((a, b) => a[0].localeCompare(b[0], 'nb', { sensitivity: 'base' })),
    [s.stream],
  )

  return (
    <Table size="small">
      <Table.Body>
        {entries.map(([key, value]) => {
          const selected = isSelected(key)
          return (
            <Table.Row key={`details|${rowKey}|${key}`}>
              <Table.HeaderCell style={{ verticalAlign: 'top', whiteSpace: 'nowrap', width: '1%' }}>
                <BodyShort>{key}</BodyShort>
              </Table.HeaderCell>
              <Table.HeaderCell style={{ verticalAlign: 'top', whiteSpace: 'nowrap', width: '1%' }}>
                {!HIDE_IN_DETAILS.has(key) && (
                  <ActionMenu>
                    <ActionMenu.Trigger>
                      <Button
                        data-color="neutral"
                        variant="tertiary"
                        icon={<MenuElipsisVerticalIcon title="Saksmeny" />}
                        size="small"
                      />
                    </ActionMenu.Trigger>
                    <ActionMenu.Content>
                      {(() => {
                        return (
                          <>
                            <ActionMenu.Item onSelect={() => addColumn(key)} disabled={selected} icon={<PlusIcon />}>
                              Legg til
                            </ActionMenu.Item>
                            <ActionMenu.Item
                              onSelect={() => removeColumn(key)}
                              disabled={!selected}
                              icon={<XMarkIcon />}
                            >
                              Fjern
                            </ActionMenu.Item>
                          </>
                        )
                      })()}
                    </ActionMenu.Content>
                  </ActionMenu>
                )}
              </Table.HeaderCell>
              <Table.DataCell style={{ verticalAlign: 'top', width: 'auto' }}>
                <BodyShort style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{value}</BodyShort>
              </Table.DataCell>
              <Table.DataCell style={{ verticalAlign: 'top', whiteSpace: 'nowrap', width: '1%' }}>
                <FieldActionMenu addFilter={addFilter} col={key} value={value} />
              </Table.DataCell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}

function HeaderActionMenu({
  selectedCols,
  col,
  moveColumn,
  removeColumn,
}: {
  selectedCols: string[]
  col: string
  moveColumn: (col: string, dir: 'left' | 'right') => void
  removeColumn: (key: string) => void
}) {
  return (
    <ActionMenu>
      <ActionMenu.Trigger>
        <Button
          data-color="neutral"
          variant="tertiary"
          icon={<MenuElipsisVerticalIcon title="Saksmeny" />}
          size="small"
        />
      </ActionMenu.Trigger>
      <ActionMenu.Content>
        {(() => {
          const pos = selectedCols.indexOf(col)
          const canMoveLeft = pos > 0
          const canMoveRight = pos > -1 && pos < selectedCols.length - 1
          return (
            <>
              <ActionMenu.Item
                onSelect={() => moveColumn(col, 'left')}
                disabled={!canMoveLeft}
                icon={<ArrowLeftIcon />}
              >
                Flytt til venstre
              </ActionMenu.Item>
              <ActionMenu.Item
                onSelect={() => moveColumn(col, 'right')}
                disabled={!canMoveRight}
                icon={<ArrowRightIcon />}
              >
                Flytt til høyre
              </ActionMenu.Item>
              <ActionMenu.Item onSelect={() => removeColumn(col)} icon={<XMarkIcon />}>
                Fjern
              </ActionMenu.Item>
            </>
          )
        })()}
      </ActionMenu.Content>
    </ActionMenu>
  )
}

function MessageDetails({
  tempoConfiguration,
  s,
  start,
  slutt,
  isSelected,
  rowKey,
  HIDE_IN_DETAILS,
  addColumn,
  removeColumn,
  addFilter,
}: {
  tempoConfiguration?: TempoConfiguration | null
  s: LokiStream
  start: string
  slutt: string
  isSelected: (key: string) => boolean
  rowKey: string
  HIDE_IN_DETAILS: Set<string>
  addColumn: (key: string) => void
  removeColumn: (key: string) => void
  addFilter: (mode: FilterMode, key: string, value: string) => void
}) {
  return (
    <VStack gap="space-64">
      {tempoConfiguration && s.stream.trace_id && (
        <HStack>
          <Button
            as={ReactRouterLink}
            size="small"
            variant="tertiary"
            to={tempoUrl(tempoConfiguration, start, slutt, s.stream.trace_id)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Se trace i Tempo
            <ExternalLinkIcon title={'Se trace i Tempo'} />
          </Button>
        </HStack>
      )}
      <MessageTable
        s={s}
        isSelected={isSelected}
        rowKey={rowKey}
        HIDE_IN_DETAILS={HIDE_IN_DETAILS}
        addColumn={addColumn}
        removeColumn={removeColumn}
        addFilter={addFilter}
      />
    </VStack>
  )
}

function levelVariant(value?: unknown | null): TagProps['variant'] {
  if (value === null || value === undefined) {
    return 'neutral'
  } else {
    switch (String(value).toLowerCase()) {
      case 'error':
        return 'error'
      case 'warn':
      case 'warning':
        return 'warning'
      case 'info':
        return 'info'
      default:
        return 'neutral'
    }
  }
}

const pad = (n: number, w = 2) => String(n).padStart(w, '0')

function decodeFieldValue(visFullDato: boolean, col: string, s: LokiStream) {
  switch (col) {
    case '_timestamp': {
      const iso = String(s.stream[col] ?? '')
      const d = new Date(iso)
      if (Number.isNaN(d.getTime())) {
        return <span>{iso}</span>
      }

      const ms = String(d.getMilliseconds()).padStart(3, '0')
      if (visFullDato) {
        return (
          <BodyShort>{`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${ms}`}</BodyShort>
        )
      } else {
        return <BodyShort>{`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${ms}`}</BodyShort>
      }
    }
    case 'level': {
      return (
        <Tag size="small" variant={levelVariant(s.stream[col])}>
          {s.stream[col] ?? ''}
        </Tag>
      )
    }
    default:
      return <span>{String(s.stream[col] ?? '')}</span>
  }
}

export default function LokiLogsTable({
  initialFilters,
  initialSelectedCols,
  response,
  start,
  slutt,
  setShareUrl,
  tempoConfiguration,
  visAlltidFullDato,
}: {
  initialFilters: { key: string; value: string; mode: 'in' | 'out' }[]
  initialSelectedCols: string[]
  response: LokiInstantQueryResponse
  start: string
  slutt: string
  setShareUrl?: React.Dispatch<React.SetStateAction<string>> | undefined
  tempoConfiguration?: TempoConfiguration | null
  visAlltidFullDato?: boolean | null
}) {
  const DEFAULT_COLS = ['_timestamp', 'level', 'message'] as const
  const [selectedCols, setSelectedCols] = useState<string[]>(initialSelectedCols ?? [...DEFAULT_COLS])

  type ActiveFilter = { key: string; value: string; mode: FilterMode }
  const [filters, setFilters] = useState<ActiveFilter[]>(initialFilters ?? [])

  const data = response.data as LokiInstantQueryData
  const result: LokiStream[] = response.status === 'success' && isStreams(data) ? (data.result as LokiStream[]) : []

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('cols', selectedCols.join(','))
      if (filters.length > 0) {
        url.searchParams.set('filters', JSON.stringify(filters))
      } else {
        url.searchParams.delete('filters')
      }
      const next = url.toString()
      setShareUrl?.(next)
      window.history.replaceState({}, '', next)
    } catch {
      // ignore
    }
  }, [selectedCols, filters, setShareUrl])

  const addColumn = (key: string) => {
    setSelectedCols((prev) => (prev.includes(key) ? prev : [...prev, key]))
  }

  const removeColumn = (key: string) => {
    setSelectedCols((prev) => prev.filter((c) => c !== key))
  }

  const moveColumn = (col: string, dir: 'left' | 'right') => {
    setSelectedCols((prev) => {
      const idx = prev.indexOf(col)
      if (idx === -1) return prev
      const target = dir === 'left' ? idx - 1 : idx + 1
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  const isSelected = (key: string) => selectedCols.includes(key)

  const HIDE_IN_DETAILS = new Set(['stack_trace'])

  const addFilter = (mode: FilterMode, key: string, value: string) => {
    setFilters((prev) =>
      prev.some((f) => f.key === key && f.value === value && f.mode === mode) ? prev : [...prev, { key, value, mode }],
    )
  }
  const removeFilter = (idx: number) => setFilters((prev) => prev.filter((_, i) => i !== idx))

  const visibleResult = useMemo(() => {
    if (filters.length === 0) return result
    return result.filter((s) => {
      return filters.every((f) => (f.mode === 'in' ? s.stream[f.key] === f.value : s.stream[f.key] !== f.value))
    })
  }, [result, filters])

  const numericColumns = useMemo(() => {
    return selectedCols.filter((col) => columnLooksNumeric(visibleResult, col))
  }, [selectedCols, visibleResult])

  const [sort, setSort] = useState<SortState>({ orderBy: '_timestamp', direction: 'descending' })

  const sortedData = useMemo(() => {
    const rows = [...visibleResult]
    if (!sort) return rows
    const { orderBy, direction } = sort
    const sgn = direction === 'ascending' ? 1 : -1

    return rows.sort((a, b) => {
      const av = String(a.stream[orderBy] ?? '')
      const bv = String(b.stream[orderBy] ?? '')

      if (orderBy === '_timestamp') {
        const ad = new Date(av).valueOf()
        const bd = new Date(bv).valueOf()
        return (ad - bd) * sgn
      }

      const nA = av.replace(',', '.')
      const nB = bv.replace(',', '.')
      const isNumA = /^-?\d+(?:[.,]\d+)?$/.test(av.trim())
      const isNumB = /^-?\d+(?:[.,]\d+)?$/.test(bv.trim())
      if (isNumA && isNumB) {
        return (parseFloat(nA) - parseFloat(nB)) * sgn
      }

      return av.localeCompare(bv, 'nb', { numeric: true, sensitivity: 'base' }) * sgn
    })
  }, [visibleResult, sort])

  const allLogsAreFromTheSameDay = useMemo(() => {
    const timestamp = sortedData.map((s) => s.stream._timestamp).sort((a, b) => a.localeCompare(b))
    if (timestamp.length <= 1) return true
    return isSameDay(timestamp[0], timestamp[timestamp.length - 1])
  }, [sortedData])

  function onSortChange(sortKey: string) {
    setSort({
      orderBy: sortKey,
      direction: sort.orderBy === sortKey && sort.direction === 'ascending' ? 'descending' : 'ascending',
    })
  }

  return (
    <>
      <HStack gap="space-8" align="center" wrap>
        {filters.length > 0 && (
          <Chips>
            {filters.map((f, i) => (
              <Chips.Removable key={`flt|${f.mode}|${f.key}|${f.value}`} onClick={() => removeFilter(i)}>
                {`${f.mode === 'in' ? 'inkluder' : 'ekskluder'}: ${f.key}=${f.value}`}
              </Chips.Removable>
            ))}
          </Chips>
        )}
      </HStack>
      <HStack gap="space-8" align="center" justify="end">
        <Button
          size="xsmall"
          variant="tertiary"
          onClick={() => setSelectedCols([...DEFAULT_COLS])}
          aria-label="Nullstill kolonner til standard"
        >
          Nullstill kolonner
        </Button>
      </HStack>
      <HStack as="div" className={styles.tableScroller} wrap={false} align="stretch">
        <Table className={styles.table} size="small" sort={sort ?? undefined} onSortChange={onSortChange}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell aria-label="Detaljer" />
              {selectedCols.map((col) => (
                <Fragment key={`head|${col}`}>
                  <Table.ColumnHeader align={numericColumns.includes(col) ? 'right' : 'left'} sortable sortKey={col}>
                    {col === '_timestamp'
                      ? 'Tidspunkt'
                      : col === 'level'
                        ? 'Nivå'
                        : col === 'message'
                          ? 'Melding'
                          : col}
                  </Table.ColumnHeader>
                  <Table.HeaderCell className={styles.displayOnHover}>
                    <HeaderActionMenu
                      selectedCols={selectedCols}
                      col={col}
                      moveColumn={moveColumn}
                      removeColumn={removeColumn}
                    />
                  </Table.HeaderCell>
                </Fragment>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sortedData.map((s) => {
              const msg = String(s.stream.message ?? '')
              const rowKey = `logline|${s.stream._timestamp}|${hashString(msg)}`
              return (
                <Table.ExpandableRow
                  key={rowKey}
                  content={
                    <MessageDetails
                      tempoConfiguration={tempoConfiguration}
                      s={s}
                      start={start}
                      slutt={slutt}
                      isSelected={isSelected}
                      rowKey={rowKey}
                      HIDE_IN_DETAILS={HIDE_IN_DETAILS}
                      addColumn={addColumn}
                      removeColumn={removeColumn}
                      addFilter={addFilter}
                    />
                  }
                >
                  {selectedCols.map((col) => (
                    <Fragment key={`fragment|${rowKey}|${col}`}>
                      <Table.DataCell align={numericColumns.includes(col) ? 'right' : 'left'}>
                        {decodeFieldValue(visAlltidFullDato || !allLogsAreFromTheSameDay, col, s)}
                      </Table.DataCell>
                      <Table.DataCell
                        style={{ verticalAlign: 'top', whiteSpace: 'nowrap', width: '1%' }}
                        className={styles.displayOnHover}
                      >
                        <FieldActionMenu addFilter={addFilter} col={col} value={String(s.stream[col] ?? '')} />
                      </Table.DataCell>
                    </Fragment>
                  ))}
                </Table.ExpandableRow>
              )
            })}
          </Table.Body>
        </Table>
      </HStack>
    </>
  )
}
