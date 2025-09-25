import { FilterIcon } from '@navikt/aksel-icons'
import {
  BodyShort,
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Heading,
  HStack,
  Label,
  Modal,
  Table,
  Tag,
  VStack,
} from '@navikt/ds-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { type LoaderFunctionArgs, useLoaderData, useSearchParams } from 'react-router'
import { decodeFagomrade } from '~/common/decode'
import { decodeBehandling } from '~/common/decodeBehandling'
import { decodeOppgaveKode, decodeOppgavePrioritet } from '~/common/decodeOppgave'
import { decodeUnderkategoriKode } from '~/common/decodeUnderkategori'
import { apiGet } from '~/services/api.server'

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

type FacetKey = (typeof FACETS)[number]

const identity = (s: string) => s

const facetValueTranslator: Partial<Record<FacetKey, (key: string) => string>> = {
  behandlingType: decodeBehandling,
  fagomrade: decodeFagomrade,
  oppgaveKode: decodeOppgaveKode,
  prioritetKode: decodeOppgavePrioritet,
  underkategoriKode: decodeUnderkategoriKode,
}

type LoaderData = {
  rows: ManuellBehandlingOppsummering[]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const rows = await apiGet<ManuellBehandlingOppsummering[]>('/api/behandling/manuell-behandling/oppsummering', request)
  return { rows }
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
    const prev = map.get(key)
    if (prev) {
      prev.count += r.antall
    } else {
      map.set(key, { label, count: r.antall })
    }
  }
  return [...map.entries()]
    .map(([k, v]) => ({ value: decodeValue(k), label: v.label, count: v.count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
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

const manglendeVerdi = '–'

export default function ManuellBehandlingOppsummeringRoute() {
  const { rows } = useLoaderData() as LoaderData
  const [searchParams, setSearchParams] = useSearchParams()
  const sokeModalRef = useRef<HTMLDialogElement>(null)

  const columnsWrapperRef = useRef<HTMLDivElement>(null)
  const [columnCount, setColumnCount] = useState(2)

  useEffect(() => {
    const el = columnsWrapperRef.current
    if (!el) return

    const update = () => {
      // Bruk bredde som heuristikk: >= 1100px => 3 kolonner, ellers 2
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
    setSearchParams({})
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

  return (
    <Box paddingBlock="6" paddingInline="6">
      <VStack gap="6">
        <Heading level="1" size="large">
          Manuell saksbehandling
        </Heading>
        <BodyShort>Tabellen viser opptelling av antall oppgaver som er opprettet av behandlingene</BodyShort>

        <HStack gap="6" align="start" wrap>
          <VStack gap="4" style={{ flex: 1, minWidth: 420 }}>
            <HStack justify="space-between" align="center">
              <Tag size="medium" variant="alt1">
                Sum antall: {total.toLocaleString('nb-NO')}
              </Tag>
              <Button
                icon={<FilterIcon aria-hidden />}
                onClick={() => sokeModalRef.current?.showModal()}
                variant="secondary"
                size="small"
              >
                Søkefilter
              </Button>
            </HStack>

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
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filtered
                  .slice()
                  .sort((a, b) => b.antall - a.antall)
                  .map((r, idx) => (
                    <Table.Row
                      key={`${decodeBehandling(r.behandlingType)}-${r.kategori}-${r.fagomrade}-${r.oppgaveKode}-${r.underkategoriKode}-${r.prioritetKode}-${idx}`}
                    >
                      <Table.DataCell>{decodeBehandling(r.behandlingType)}</Table.DataCell>
                      <Table.DataCell>
                        <VStack gap="1">
                          <span>{r.kategoriDecode}</span>
                          <BodyShort size="small" as="span" style={{ color: 'var(--a-text-subtle)' }}>
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
                      <Table.DataCell style={{ textAlign: 'right' }}>{r.antall.toLocaleString('nb-NO')}</Table.DataCell>
                    </Table.Row>
                  ))}
              </Table.Body>
            </Table>
          </VStack>
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
              <Button
                variant="secondary"
                onClick={() => {
                  clearAll()
                  sokeModalRef.current?.close()
                }}
              >
                Nullstill
              </Button>
              <Button variant="primary" onClick={() => sokeModalRef.current?.close()}>
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
      <CheckboxGroup legend="" hideLegend size="small">
        {options.map((opt) => {
          const enc = encodeValue(opt.value)
          const isChecked = selected.has(enc)
          const isDisabled = opt.count === 0
          return (
            <Checkbox
              key={enc}
              checked={isChecked}
              disabled={isDisabled}
              value={opt.value}
              onChange={() => onToggle(facet, opt.value)}
            >
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

function priorityVariant(v: string): 'info' | 'success' | 'warning' | 'error' | 'neutral' | 'alt1' | 'alt2' {
  switch (v.toUpperCase()) {
    case 'HOY':
    case 'HØY':
      return 'warning'
    case 'LAV':
      return 'info'
    default:
      return 'neutral'
  }
}
