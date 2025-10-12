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
import type { TagProps } from '@navikt/ds-react'
import { ActionMenu, BodyShort, Button, Chips, HStack, Table, Tag, VStack } from '@navikt/ds-react'
import type React from 'react'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { Link as ReactRouterLink } from 'react-router'
import copy from '~/common/clipboard'
import {
  isStreams,
  type LokiInstantQueryData,
  type LokiInstantQueryResponse,
  type LokiStream,
} from '~/loki/loki-query-types'
import { type TempoConfiguration, tempoUrl } from '~/loki/utils'

function hashString(str: string): string {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0
  }
  return (h >>> 0).toString(36)
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
      const parsed = JSON.parse(decodeURIComponent(urlFilters))
      if (Array.isArray(parsed)) filter = parsed
    }
  } catch {}

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
        <Button variant="tertiary-neutral" icon={<MenuElipsisVerticalIcon title="Feltmeny" />} size="small" />
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

export default function LokiLogsTable({
  initialFilters,
  initialSelectedCols,
  response,
  start,
  slutt,
  setShareUrl,
  tempoConfiguration,
}: {
  initialFilters: { key: string; value: string; mode: 'in' | 'out' }[]
  initialSelectedCols: string[]
  response: LokiInstantQueryResponse
  start: string
  slutt: string
  setShareUrl?: React.Dispatch<React.SetStateAction<string>> | undefined
  tempoConfiguration?: TempoConfiguration | null
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
        url.searchParams.set('filters', encodeURIComponent(JSON.stringify(filters)))
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
    const sorted = result.sort((a, b) => {
      if (a.stream._timestamp && b.stream._timestamp) {
        return b.stream._timestamp.localeCompare(a.stream._timestamp)
      } else {
        return 0
      }
    })

    if (filters.length === 0) return sorted
    return result.filter((s) => {
      return filters.every((f) => (f.mode === 'in' ? s.stream[f.key] === f.value : s.stream[f.key] !== f.value))
    })
  }, [result, filters])

  return (
    <>
      <HStack gap="2" align="center" wrap>
        {filters.length > 0 && (
          <Chips>
            {filters.map((f, i) => (
              <Chips.Removable
                key={`flt|${f.mode}|${f.key}|${f.value}`}
                onClick={() => removeFilter(i)}
                style={{ color: 'var(--ax-text-contrast)' }}
              >
                {`${f.mode === 'in' ? 'inkluder' : 'ekskluder'}: ${f.key}=${f.value}`}
              </Chips.Removable>
            ))}
          </Chips>
        )}
      </HStack>

      <HStack gap="2" align="center" justify="end">
        <Button
          size="xsmall"
          variant="tertiary"
          onClick={() => setSelectedCols([...DEFAULT_COLS])}
          aria-label="Nullstill kolonner til standard"
        >
          Nullstill kolonner
        </Button>
      </HStack>

      <Table size="small">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell aria-label="Detaljer" />
            {selectedCols.map((col) => (
              <Table.HeaderCell key={`head|${col}`} colSpan={2}>
                <HStack justify="space-between" align="center" gap="2">
                  <BodyShort>
                    {col === '_timestamp'
                      ? 'Tidspunkt'
                      : col === 'level'
                        ? 'Nivå'
                        : col === 'message'
                          ? 'Melding'
                          : col}
                  </BodyShort>

                  <ActionMenu>
                    <ActionMenu.Trigger>
                      <Button
                        variant="tertiary-neutral"
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
                </HStack>
              </Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {visibleResult.map((s) => {
            const msg = String(s.stream.message ?? '')
            const rowKey = `logline|${s.stream._timestamp}|${hashString(msg)}`
            return (
              <Table.ExpandableRow
                key={rowKey}
                content={
                  <VStack gap="16">
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

                    <Table size="small">
                      <Table.Body>
                        {Object.entries(s.stream)
                          .sort((a, b) => a[0].localeCompare(b[0], 'nb', { sensitivity: 'base' }))
                          .map(([key, value]) => {
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
                                          variant="tertiary-neutral"
                                          icon={<MenuElipsisVerticalIcon title="Saksmeny" />}
                                          size="small"
                                        />
                                      </ActionMenu.Trigger>
                                      <ActionMenu.Content>
                                        {(() => {
                                          return (
                                            <>
                                              <ActionMenu.Item
                                                onSelect={() => addColumn(key)}
                                                disabled={selected}
                                                icon={<PlusIcon />}
                                              >
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
                                  <BodyShort style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                                    {value}
                                  </BodyShort>
                                </Table.DataCell>
                                <Table.DataCell style={{ verticalAlign: 'top', whiteSpace: 'nowrap', width: '1%' }}>
                                  <FieldActionMenu addFilter={addFilter} col={key} value={value} />
                                </Table.DataCell>
                              </Table.Row>
                            )
                          })}
                      </Table.Body>
                    </Table>
                  </VStack>
                }
              >
                {selectedCols.map((col) => (
                  <Fragment key={`fragment|${rowKey}|${col}`}>
                    <Table.DataCell key={`cell|${rowKey}|${col}`}>
                      {col === '_timestamp'
                        ? (() => {
                            const iso = String(s.stream[col] ?? '')
                            const d = new Date(iso)
                            if (Number.isNaN(d.getTime())) return iso
                            const pad = (n: number, w = 2) => String(n).padStart(w, '0')
                            const ms = String(d.getMilliseconds()).padStart(3, '0')
                            const txt = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${ms}`
                            return <BodyShort>{txt}</BodyShort>
                          })()
                        : col === 'level'
                          ? (() => {
                              const lvl = String(s.stream[col] ?? '').toLowerCase()
                              const variant: TagProps['variant'] =
                                lvl === 'error'
                                  ? 'error'
                                  : lvl === 'warn' || lvl === 'warning'
                                    ? 'warning'
                                    : lvl === 'info'
                                      ? 'info'
                                      : 'neutral'
                              return (
                                <Tag size="small" variant={variant}>
                                  {s.stream[col] ?? ''}
                                </Tag>
                              )
                            })()
                          : String(s.stream[col] ?? '')}
                    </Table.DataCell>
                    <Table.DataCell
                      key={`cell|${rowKey}|${col}|menu`}
                      style={{ verticalAlign: 'top', whiteSpace: 'nowrap', width: '1%' }}
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
    </>
  )
}
