import {
  ArrowCirclepathReverseIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Density2Icon,
  DownloadIcon,
  FilterIcon,
} from '@navikt/aksel-icons'
import {
  BodyShort,
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  DatePicker,
  Heading,
  HStack,
  Label,
  Modal,
  Table,
  Tag,
  useRangeDatepicker,
  VStack,
} from '@navikt/ds-react'
import { sub } from 'date-fns'
import { useEffect, useMemo, useRef, useState } from 'react'
import { redirect, useSearchParams } from 'react-router'
import type { DateRange } from '~/behandlingserie/seriekalenderUtils'
import { toIsoDate } from '~/common/date'
import { decodeFagomrade } from '~/common/decode'
import { decodeBehandling } from '~/common/decodeBehandling'
import { decodeOppgaveKode, decodeOppgavePrioritet } from '~/common/decodeOppgave'
import { decodeUnderkategoriKode } from '~/common/decodeUnderkategori'
import { ManuellBehandlingActionMenu } from '~/manuell-behandling/ManuellBehandlingActionMenu'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/index'

export type ManuellBehandlingOppsummering = {
  behandlingType: string
  kategori: string
  kategoriDecode: string
  fagomrade: string
  oppgaveKode: string
  underkategoriKode: string | null
  prioritetKode: string | null
  antall: number
}

const FACETS = ['behandlingType', 'kategori', 'fagomrade', 'oppgaveKode', 'underkategoriKode', 'prioritetKode'] as const
const GROUP_PARAM = 'groupBy' as const

type FacetKey = (typeof FACETS)[number]

const identity = (s: string) => s

const facetValueTranslator: Partial<Record<FacetKey, (key: string) => string>> = {
  behandlingType: decodeBehandling,
  fagomrade: decodeFagomrade,
  oppgaveKode: decodeOppgaveKode,
  prioritetKode: decodeOppgavePrioritet,
  underkategoriKode: decodeUnderkategoriKode,
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)

  const now = new Date()

  const fomDato = url.searchParams.get('fomDato') as string
  const tomDato = url.searchParams.get('tomDato') as string

  const iso = /^\d{4}-\d{2}-\d{2}$/
  const manglendeEllerUgyldigDato = !fomDato || !tomDato || !iso.test(fomDato) || !iso.test(tomDato)

  if (manglendeEllerUgyldigDato) {
    url.searchParams.set('fomDato', fomDato ?? toIsoDate(sub(now, { days: 30 })))
    url.searchParams.set('tomDato', tomDato ?? toIsoDate(now))

    return redirect(`${url.pathname}?${url.searchParams.toString()}`)
  }

  const qs = new URLSearchParams()
  qs.set('fomDato', fomDato)
  qs.set('tomDato', tomDato)

  const rows = await apiGet<ManuellBehandlingOppsummering[]>(
    `/api/behandling/manuell-behandling/oppsummering?${qs.toString()}`,
    request,
  )

  return {
    rows,
    nowIso: now.toISOString(),
    fomDato,
    tomDato,
  }
}

const NULL_TOKEN = '__NULL__' // representerer null i URL

function encodeValue(v: string | null): string {
  return v ?? NULL_TOKEN
}

function decodeValue(v: string): string | null {
  return v === NULL_TOKEN ? null : v
}

function sumAntall(rows: ManuellBehandlingOppsummering[]): number {
  return rows.reduce((acc, r) => acc + (r.antall ?? 0), 0)
}

function applyFilters(
  rows: ManuellBehandlingOppsummering[],
  filters: Partial<Record<FacetKey, string[]>>,
): ManuellBehandlingOppsummering[] {
  return rows.filter((r) => {
    return FACETS.every((key) => {
      const sel = filters[key]
      if (!sel || sel.length === 0) return true
      const val = encodeValue(r[key])
      return sel.includes(val)
    })
  })
}

function distinctValuesWithCounts(
  rows: ManuellBehandlingOppsummering[],
  facet: FacetKey,
  decodeForFacet: (row: ManuellBehandlingOppsummering) => string | null,
): { value: string | null; label: string; count: number }[] {
  const map = new Map<string, { label: string; count: number }>()
  for (const r of rows) {
    const raw = r[facet]
    const key = encodeValue(raw)
    const decoded = decodeForFacet(r)
    const label = decoded == null ? manglendeVerdi : decoded
    map.set(key, { label, count: (map.get(key)?.count ?? 0) + r.antall })
  }
  return [...map.entries()]
    .map(([k, v]) => ({ value: decodeValue(k), label: v.label, count: v.count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'nb'))
}

function labelForFacet(facet: FacetKey, row: ManuellBehandlingOppsummering): string {
  if (facet === 'kategori') return row.kategoriDecode
  const raw = row[facet]
  if (raw == null) return manglendeVerdi
  const translator = facetValueTranslator[facet] ?? identity
  return translator(raw)
}

type GroupRow = {
  groupKey: string
  labels: Partial<Record<FacetKey, string>>
  values: Partial<Record<FacetKey, string | null>>
  antall: number
}

function groupRows(rows: ManuellBehandlingOppsummering[], keys: FacetKey[]): GroupRow[] {
  if (!keys.length) return []
  const sep = '\u001F'
  const m = new Map<string, GroupRow>()
  for (const r of rows) {
    const rawValues: Partial<Record<FacetKey, string | null>> = {}
    const labels: Partial<Record<FacetKey, string>> = {}
    for (const k of keys) {
      const raw = r[k]
      rawValues[k] = raw ?? null
      labels[k] = labelForFacet(k, r)
    }
    const key = keys.map((k) => encodeValue(rawValues[k] ?? null)).join(sep)
    const prev = m.get(key)
    if (prev) {
      prev.antall += r.antall
    } else {
      m.set(key, { groupKey: key, labels, values: rawValues, antall: r.antall })
    }
  }
  return [...m.values()].sort((a, b) => b.antall - a.antall)
}

function toggleParam(current: string[] | null, value: string): string[] | null {
  const arr = current ? [...current] : []
  const idx = arr.indexOf(value)
  if (idx >= 0) {
    arr.splice(idx, 1)
  } else {
    arr.push(value)
  }
  return arr.length ? arr : null
}

const rowKey = (r: ManuellBehandlingOppsummering) =>
  [r.behandlingType, r.kategori, r.fagomrade, r.oppgaveKode, r.underkategoriKode ?? '∅', r.prioritetKode ?? '∅'].join(
    '|',
  )

const manglendeVerdi = '–'

function countActiveFilters(filters: Partial<Record<FacetKey, string[]>>): number {
  return Object.values(filters).reduce((acc, v) => acc + ((v?.length ?? 0) > 0 ? 1 : 0), 0)
}

export default function ManuellBehandlingOppsummeringRoute({ loaderData }: Route.ComponentProps) {
  const { nowIso, rows, fomDato, tomDato } = loaderData
  const [searchParams, setSearchParams] = useSearchParams()
  const sokeModalRef = useRef<HTMLDialogElement>(null)
  const grupperModalRef = useRef<HTMLDialogElement>(null)

  const now = new Date(nowIso)

  function updateSearchParams(nextFrom: string, nextTo: string) {
    const next = new URLSearchParams(searchParams)

    next.set('fomDato', nextFrom)
    next.set('tomDato', nextTo)

    setSearchParams(next)
  }

  function onRangeChange(val?: DateRange) {
    if (val?.from && val.to) {
      updateSearchParams(toIsoDate(val.from), toIsoDate(val.to))
    }
  }

  const { datepickerProps, fromInputProps, toInputProps, setSelected } = useRangeDatepicker({
    defaultSelected: {
      from: new Date(fomDato),
      to: new Date(tomDato),
    },
    required: true,
    onRangeChange: onRangeChange,
  })

  function applyPeriod(nextFrom: string, nextTo: string) {
    setSelected({
      from: new Date(nextFrom),
      to: new Date(nextTo),
    })
    updateSearchParams(nextFrom, nextTo)
  }

  function presetLastNDays(n: number) {
    const to = toIsoDate(now)
    const from = toIsoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (n - 1)))
    applyPeriod(from, to)
  }

  function presetThisYear() {
    const from = `${now.getFullYear()}-01-01`
    const to = toIsoDate(new Date())
    applyPeriod(from, to)
  }

  const columnsWrapperRef = useRef<HTMLDivElement>(null)
  const [columnCount, setColumnCount] = useState(2)

  useEffect(() => {
    const el = columnsWrapperRef.current
    if (!el) return

    const update = () => {
      const w = el.clientWidth
      setColumnCount(w >= 1100 ? 3 : 2)
    }
    update()

    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const filters = useMemo(() => {
    const f: Partial<Record<FacetKey, string[]>> = {}
    for (const facet of FACETS) {
      const values = searchParams.getAll(facet)
      if (values.length) f[facet] = values
    }
    return f
  }, [searchParams])

  const filtered = useMemo(() => applyFilters(rows, filters), [rows, filters])

  const groupBy = useMemo(
    () =>
      searchParams
        .getAll(GROUP_PARAM)
        .filter((v): v is FacetKey => (FACETS as readonly string[]).includes(v)) as FacetKey[],
    [searchParams],
  )

  const grouped = useMemo(() => groupRows(filtered, groupBy), [filtered, groupBy])

  const facetOptions = useMemo(() => {
    const result: Record<FacetKey, { value: string | null; label: string; count: number }[]> = {} as Record<
      FacetKey,
      { value: string | null; label: string; count: number }[]
    >

    for (const facet of FACETS) {
      const { [facet]: _omit, ...rest } = filters
      const base = applyFilters(rows, rest)

      const decodeForFacet = (row: ManuellBehandlingOppsummering): string | null => {
        if (facet === 'kategori') return row.kategoriDecode

        const raw = row[facet]
        if (raw == null) return null

        const translator = facetValueTranslator[facet] ?? identity
        return translator(raw)
      }

      result[facet] = distinctValuesWithCounts(base, facet, decodeForFacet)
    }
    return result
  }, [rows, filters])

  const total = useMemo(() => sumAntall(filtered), [filtered])

  function clearAll() {
    const next = new URLSearchParams(searchParams)
    for (const f of FACETS) next.delete(f)
    next.delete(GROUP_PARAM)
    setSearchParams(next)
  }

  function clearFacetFilters() {
    const next = new URLSearchParams(searchParams)
    for (const f of FACETS) next.delete(f)
    setSearchParams(next)
  }

  function clearGrouping() {
    const next = new URLSearchParams(searchParams)
    next.delete(GROUP_PARAM)
    setSearchParams(next)
  }

  function onToggle(facet: FacetKey, rawValue: string | null) {
    const encoded = encodeValue(rawValue)
    const curr = searchParams.getAll(facet)
    const next = toggleParam(curr.length ? curr : null, encoded)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete(facet)
    if (next) {
      for (const v of next) {
        nextParams.append(facet, v)
      }
    }
    setSearchParams(nextParams)
  }

  function onToggleGroupBy(facet: FacetKey) {
    const curr = searchParams.getAll(GROUP_PARAM)
    const next = toggleParam(curr.length ? curr : null, facet)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete(GROUP_PARAM)
    if (next) {
      for (const v of next) {
        nextParams.append(GROUP_PARAM, v)
      }
    }
    setSearchParams(nextParams)
  }

  function updateGroupBy(nextOrder: FacetKey[]) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete(GROUP_PARAM)
    for (const v of nextOrder) {
      nextParams.append(GROUP_PARAM, v)
    }
    setSearchParams(nextParams)
  }

  function moveGroupBy(idx: number, delta: number) {
    const to = idx + delta
    if (to < 0 || to >= groupBy.length) return
    const next = [...groupBy]
    const [moved] = next.splice(idx, 1)
    next.splice(to, 0, moved)
    updateGroupBy(next)
  }

  return (
    <Box paddingBlock="6" paddingInline="6">
      <VStack gap="6">
        <Heading level="1" size="small">
          Manuell behandling
        </Heading>

        <BodyShort>Tabellen viser opptelling av antall oppgaver som er opprettet av behandlingene</BodyShort>

        <HStack gap="6" align="start" wrap>
          <VStack gap="4" style={{ flex: 1, minWidth: 420 }}>
            <Box.New padding="3" borderRadius="large" borderWidth="1" borderColor="neutral-subtleA">
              <HStack gap="3" align="end" wrap>
                <DatePicker {...datepickerProps}>
                  <HStack wrap gap="space-16" justify="center">
                    <DatePicker.Input size="small" {...fromInputProps} label="Fra" />
                    <DatePicker.Input size="small" {...toInputProps} label="Til" />
                  </HStack>
                </DatePicker>

                <VStack gap="space-8">
                  <Label size="small">Periode</Label>
                  <HStack gap="1" wrap>
                    <Button size="small" variant="secondary" onClick={() => presetLastNDays(7)}>
                      7 d
                    </Button>
                    <Button size="small" variant="secondary" onClick={() => presetLastNDays(30)}>
                      30 d
                    </Button>
                    <Button size="small" variant="secondary" onClick={presetThisYear}>
                      I år
                    </Button>
                  </HStack>
                </VStack>
              </HStack>
            </Box.New>

            <HStack justify="space-between" align="center">
              <Tag size="small" variant="alt1">
                Sum antall: {total.toLocaleString('nb-NO')}
              </Tag>
              <HStack gap="2">
                <Button
                  icon={<FilterIcon aria-hidden />}
                  onClick={() => sokeModalRef.current?.showModal()}
                  variant="secondary"
                  size="small"
                >
                  Søkefilter{(() => {
                    const c = countActiveFilters(filters)
                    return c ? ` (${c})` : ''
                  })()}
                </Button>
                <Button
                  icon={<Density2Icon aria-hidden />}
                  onClick={() => grupperModalRef.current?.showModal()}
                  variant="secondary"
                  size="small"
                >
                  Gruppering{groupBy.length ? ` (${groupBy.length})` : ''}
                </Button>
                <Button
                  icon={<ArrowCirclepathReverseIcon aria-hidden />}
                  onClick={clearAll}
                  variant="secondary"
                  size="small"
                >
                  Nullstill
                </Button>
              </HStack>
            </HStack>

            {groupBy.length === 0 ? (
              <Table size="small" zebraStripes>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Behandlingstype</Table.HeaderCell>
                    <Table.HeaderCell>Kategori</Table.HeaderCell>
                    <Table.HeaderCell>Fagområde</Table.HeaderCell>
                    <Table.HeaderCell>Oppgavekode</Table.HeaderCell>
                    <Table.HeaderCell>Underkategori</Table.HeaderCell>
                    <Table.HeaderCell>Prioritet</Table.HeaderCell>
                    <Table.HeaderCell style={{ textAlign: 'right' }}>Antall</Table.HeaderCell>
                    <Table.HeaderCell style={{ textAlign: 'right' }}>Andel</Table.HeaderCell>
                    <Table.ColumnHeader />
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filtered
                    .slice()
                    .sort((a, b) => b.antall - a.antall)
                    .map((r) => (
                      <Table.Row key={rowKey(r)}>
                        <Table.DataCell>{decodeBehandling(r.behandlingType)}</Table.DataCell>
                        <Table.DataCell>
                          <VStack gap="1">
                            <span>{r.kategoriDecode}</span>
                            <BodyShort size="small" as="span" textColor="subtle">
                              {r.kategori}
                            </BodyShort>
                          </VStack>
                        </Table.DataCell>
                        <Table.DataCell>{r.fagomrade}</Table.DataCell>
                        <Table.DataCell>{decodeOppgaveKode(r.oppgaveKode)}</Table.DataCell>
                        <Table.DataCell>
                          {r.underkategoriKode ? decodeUnderkategoriKode(r.underkategoriKode) : manglendeVerdi}
                        </Table.DataCell>
                        <Table.DataCell>
                          {r.prioritetKode ? (
                            <Tag size="small" variant={priorityVariant(r.prioritetKode)}>
                              {decodeOppgavePrioritet(r.prioritetKode)}
                            </Tag>
                          ) : (
                            <span>{manglendeVerdi}</span>
                          )}
                        </Table.DataCell>
                        <Table.DataCell style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                          {r.antall.toLocaleString('nb-NO')}
                        </Table.DataCell>
                        <Table.DataCell style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                          {((r.antall * 100) / total).toFixed(1)} %
                        </Table.DataCell>
                        <Table.DataCell>
                          <ManuellBehandlingActionMenu />
                        </Table.DataCell>
                      </Table.Row>
                    ))}
                </Table.Body>
              </Table>
            ) : (
              <Table size="small" zebraStripes>
                <Table.Header>
                  <Table.Row>
                    {groupBy.map((g) => (
                      <Table.HeaderCell key={`h-${g}`}>{facetLabel(g)}</Table.HeaderCell>
                    ))}
                    <Table.HeaderCell style={{ textAlign: 'right' }}>Antall</Table.HeaderCell>
                    <Table.HeaderCell style={{ textAlign: 'right' }}>Andel</Table.HeaderCell>
                    <Table.ColumnHeader />
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {grouped.map((gr) => (
                    <Table.Row key={`gr-${gr.groupKey}`}>
                      {groupBy.map((g) => (
                        <Table.DataCell key={`c-${gr.groupKey}-${g}`}>{gr.labels[g] ?? manglendeVerdi}</Table.DataCell>
                      ))}
                      <Table.DataCell style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {gr.antall.toLocaleString('nb-NO')}
                      </Table.DataCell>
                      <Table.DataCell style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {((gr.antall * 100) / total).toFixed(1)} %
                      </Table.DataCell>
                      <Table.DataCell>
                        <ManuellBehandlingActionMenu />
                      </Table.DataCell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
          </VStack>
        </HStack>

        <HStack justify="end">
          <Button
            size="small"
            icon={<DownloadIcon />}
            as="a"
            href={`/manuell-behandling-uttrekk?${searchParams.toString()}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Last ned uttrekk
          </Button>
        </HStack>

        <Modal ref={sokeModalRef} header={{ heading: 'Søkefilter' }} width={1440}>
          <Modal.Body>
            <div ref={columnsWrapperRef} style={{ overflow: 'auto', paddingRight: 8 }}>
              <div
                style={{
                  columnCount: columnCount,
                  columnGap: 24,
                  columnFill: 'balance',
                }}
              >
                {FACETS.map((facet) => (
                  <div key={facet} style={{ breakInside: 'avoid' }}>
                    <FacetSection
                      title={facetLabel(facet)}
                      facet={facet}
                      options={facetOptions[facet]}
                      selected={new Set(searchParams.getAll(facet))}
                      onToggle={onToggle}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <HStack gap="3">
              <Button variant="secondary" onClick={clearFacetFilters}>
                Nullstill
              </Button>
              <Button variant="primary" onClick={() => sokeModalRef.current?.close()}>
                Lukk
              </Button>
            </HStack>
          </Modal.Footer>
        </Modal>
        <Modal ref={grupperModalRef} header={{ heading: 'Gruppering' }} width={720}>
          <Modal.Body>
            <VStack gap="4">
              <Box>
                <Label size="small">Grupper etter</Label>
                <CheckboxGroup legend="" hideLegend size="small" value={searchParams.getAll(GROUP_PARAM)}>
                  {FACETS.map((f) => (
                    <Checkbox key={`gb-${f}`} value={f} onChange={() => onToggleGroupBy(f)}>
                      {facetLabel(f)}
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </Box>

              <Box.New padding="3" borderRadius="large" borderColor="warning">
                <Label size="small">Rekkefølge</Label>
                {groupBy.length === 0 ? (
                  <BodyShort size="small" textColor="subtle">
                    Ingen dimensjoner valgt ennå.
                  </BodyShort>
                ) : (
                  <ol style={{ listStyle: 'none', padding: 0, margin: '8px 0 0 0' }}>
                    {groupBy.map((g, idx) => (
                      <li
                        key={`order-${g}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                          padding: '6px 10px',
                          marginBottom: 6,
                          border: '1px solid var(--ax-border-neutral-subtle)',
                          borderRadius: 6,
                          background: 'var(--ax-bg-accent-soft)',
                          userSelect: 'none',
                        }}
                      >
                        <span aria-hidden style={{ fontFamily: 'monospace' }}>
                          ≡
                        </span>
                        <span style={{ flex: 1 }}>{facetLabel(g)}</span>
                        <HStack gap="1" align="center">
                          <Button
                            size="xsmall"
                            variant="tertiary"
                            icon={<ChevronUpIcon aria-hidden />}
                            aria-label={`Flytt ${facetLabel(g)} opp`}
                            onClick={(e) => {
                              e.preventDefault()
                              moveGroupBy(idx, -1)
                            }}
                            disabled={idx === 0}
                          />
                          <Button
                            size="xsmall"
                            variant="tertiary"
                            icon={<ChevronDownIcon aria-hidden />}
                            aria-label={`Flytt ${facetLabel(g)} ned`}
                            onClick={(e) => {
                              e.preventDefault()
                              moveGroupBy(idx, 1)
                            }}
                            disabled={idx === groupBy.length - 1}
                          />
                        </HStack>
                      </li>
                    ))}
                  </ol>
                )}
              </Box.New>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <HStack gap="3">
              <Button variant="secondary" onClick={clearGrouping}>
                Nullstill gruppering
              </Button>
              <Button variant="primary" onClick={() => grupperModalRef.current?.close()}>
                Lukk
              </Button>
            </HStack>
          </Modal.Footer>
        </Modal>
      </VStack>
    </Box>
  )
}

function FacetSection({
  title,
  facet,
  options,
  selected,
  onToggle,
}: {
  title: string
  facet: FacetKey
  options: { value: string | null; label: string; count: number }[]
  selected: Set<string>
  onToggle: (facet: FacetKey, value: string | null) => void
}) {
  return (
    <VStack gap="2">
      <Label size="small">{title}</Label>
      <CheckboxGroup legend="" hideLegend size="small" value={[...selected]}>
        {options.map((opt) => {
          const enc = encodeValue(opt.value)
          const isDisabled = opt.count === 0
          return (
            <Checkbox key={enc} disabled={isDisabled} value={enc} onChange={() => onToggle(facet, opt.value)}>
              <HStack gap="2" align="center">
                <span>{opt.label}</span>
                <Tag size="xsmall" variant="neutral">
                  {opt.count.toLocaleString('nb-NO')}
                </Tag>
              </HStack>
            </Checkbox>
          )
        })}
      </CheckboxGroup>
    </VStack>
  )
}

function facetLabel(f: FacetKey): string {
  switch (f) {
    case 'behandlingType':
      return 'Behandlingstype'
    case 'kategori':
      return 'Kategori'
    case 'fagomrade':
      return 'Fagområde'
    case 'oppgaveKode':
      return 'Oppgavekode'
    case 'underkategoriKode':
      return 'Underkategori'
    case 'prioritetKode':
      return 'Prioritet'
  }
}

function priorityVariant(v?: string | null): 'info' | 'success' | 'warning' | 'error' | 'neutral' | 'alt1' | 'alt2' {
  const up = v?.toUpperCase()
  if (up === 'HOY' || up === 'HØY') return 'warning'
  if (up === 'LAV') return 'info'
  return 'neutral'
}
