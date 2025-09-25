import {
  BodyShort,
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Heading,
  HStack,
  Label,
  ReadMore,
  Table,
  Tag,
  VStack,
} from '@navikt/ds-react'
import { useMemo } from 'react'
import { type LoaderFunctionArgs, useLoaderData, useSearchParams } from 'react-router'
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

function valueLabel(v: string | null): string {
  return v ?? '(tom)'
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
): { value: string | null; count: number }[] {
  const map = new Map<string, number>()
  for (const r of rows) {
    const raw = r[facet]
    const key = encodeValue(raw)
    map.set(key, (map.get(key) ?? 0) + r.antall)
  }
  return [...map.entries()]
    .map(([k, count]) => ({ value: decodeValue(k), count }))
    .sort((a, b) => b.count - a.count || valueLabel(a.value).localeCompare(valueLabel(b.value)))
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

export default function ManuellBehandlingOppsummeringRoute() {
  const { rows } = useLoaderData() as LoaderData
  const [searchParams, setSearchParams] = useSearchParams()

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
    const result: Record<FacetKey, { value: string | null; count: number }[]> = {} as Record<
      FacetKey,
      { value: string | null; count: number }[]
    >
    for (const facet of FACETS) {
      const { [facet]: _omit, ...rest } = filters
      const base = applyFilters(rows, rest)
      result[facet] = distinctValuesWithCounts(base, facet)
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
          Manuell saksbehandling – oppsummering
        </Heading>
        <BodyShort>
          Filtrer på én eller flere verdier. Antall i parentes viser hvor mange rader (summert antall) som matcher gitt
          øvrige filter.
        </BodyShort>

        <HStack gap="6" align="start" wrap>
          {/* Sidebar: Facets */}
          <Box
            className="rounded-2xl shadow-sm"
            padding="4"
            style={{ minWidth: 320, maxWidth: 420, border: '1px solid var(--a-border-subtle)' }}
          >
            <VStack gap="6">
              <HStack justify="space-between" align="center">
                <Heading level="2" size="small">
                  Filtre
                </Heading>
                <Button variant="secondary" size="small" onClick={clearAll}>
                  Nullstill
                </Button>
              </HStack>

              {FACETS.map((facet) => (
                <FacetSection
                  key={facet}
                  title={facetLabel(facet)}
                  facet={facet}
                  options={facetOptions[facet]}
                  selected={new Set(searchParams.getAll(facet))}
                  onToggle={onToggle}
                />
              ))}

              <ReadMore header="Hva betyr (tom)?">
                Verdien er ikke satt i kilden (NULL). Du kan filtrere på disse ved å velge «(tom)».
              </ReadMore>
            </VStack>
          </Box>

          {/* Main: Results */}
          <VStack gap="4" style={{ flex: 1, minWidth: 420 }}>
            <HStack justify="space-between" align="center">
              <Heading level="2" size="small">
                Treff
              </Heading>
              <Tag size="medium" variant="alt1">
                Sum antall: {total.toLocaleString('nb-NO')}
              </Tag>
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
                      key={`${r.behandlingType}-${r.kategori}-${r.fagomrade}-${r.oppgaveKode}-${r.underkategoriKode}-${r.prioritetKode}-${idx}`}
                    >
                      <Table.DataCell>{r.behandlingType}</Table.DataCell>
                      <Table.DataCell>
                        <VStack gap="1">
                          <span>{r.kategoriDecode}</span>
                          <BodyShort size="small" as="span" style={{ color: 'var(--a-text-subtle)' }}>
                            {r.kategori}
                          </BodyShort>
                        </VStack>
                      </Table.DataCell>
                      <Table.DataCell>{r.fagomrade}</Table.DataCell>
                      <Table.DataCell>{r.oppgaveKode}</Table.DataCell>
                      <Table.DataCell>{valueLabel(r.underkategoriKode)}</Table.DataCell>
                      <Table.DataCell>
                        {r.prioritetKode ? (
                          <Tag size="small" variant={priorityVariant(r.prioritetKode)}>
                            {r.prioritetKode}
                          </Tag>
                        ) : (
                          <span>(tom)</span>
                        )}
                      </Table.DataCell>
                      <Table.DataCell style={{ textAlign: 'right' }}>{r.antall.toLocaleString('nb-NO')}</Table.DataCell>
                    </Table.Row>
                  ))}
              </Table.Body>
            </Table>
          </VStack>
        </HStack>
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
  options: { value: string | null; count: number }[]
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
            <Checkbox key={enc} checked={isChecked} disabled={isDisabled} onChange={() => onToggle(facet, opt.value)}>
              <HStack gap="2" align="center">
                <span>{valueLabel(opt.value)}</span>
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
