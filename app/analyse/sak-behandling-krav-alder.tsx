import { BodyShort, Chips, Heading, HStack, Table, ToggleGroup, VStack } from '@navikt/ds-react'
import { useCallback, useMemo, useState } from 'react'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { decodeBehandling } from '~/common/decodeBehandling'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/sak-behandling-krav-alder'
import LastNedTabData from './components/LastNedTabData'
import type { BehandlingKravAlderResponse } from './types'
import { type AlderVisning, alderLabel, aldersgruppeSortering, tilAldersgruppe } from './utils/alderUtils'
import { parseSakAnalyseParams } from './utils/parseSakAnalyseParams'
import { useSortableTable } from './utils/useSortableTable'

export async function loader({ request }: Route.LoaderArgs) {
  const { params } = parseSakAnalyseParams(request)
  return await apiGet<BehandlingKravAlderResponse>(`/api/behandling/analyse/krav-alder?${params}`, request)
}

type Dimensjon = 'sakType' | 'behandlingType' | 'kravGjelder'

const dimensjoner: { key: Dimensjon; label: string }[] = [
  { key: 'sakType', label: 'Sakstype' },
  { key: 'behandlingType', label: 'Behandlingstype' },
  { key: 'kravGjelder', label: 'Kravtype' },
]

type GruppertRad = Record<string, string | number>

function grupperRader(
  rader: BehandlingKravAlderResponse['rader'],
  aktiveDimensjoner: Set<Dimensjon>,
  alderVisning: AlderVisning,
): GruppertRad[] {
  const map = new Map<string, GruppertRad>()
  for (const r of rader) {
    const alderVerdi = alderVisning === 'gruppe' ? tilAldersgruppe(r.alder) : alderLabel(r.alder)
    const keyParts: string[] = []
    const rad: GruppertRad = { alder: alderVerdi, antall: 0 }

    for (const d of dimensjoner) {
      if (aktiveDimensjoner.has(d.key)) {
        rad[d.key] = r[d.key]
        keyParts.push(r[d.key])
      }
    }
    keyParts.push(alderVerdi)
    const key = keyParts.join('|')

    const existing = map.get(key)
    if (existing) {
      ;(existing.antall as number) += r.antall
    } else {
      rad.antall = r.antall
      map.set(key, rad)
    }
  }
  return [...map.values()]
}

export default function BehandlingKravAlderTab({ loaderData }: Route.ComponentProps) {
  const data = loaderData
  const [alderVisning, setAlderVisning] = useState<AlderVisning>('gruppe')
  const [aktiveDimensjoner, setAktiveDimensjoner] = useState<Set<Dimensjon>>(
    new Set(['sakType', 'behandlingType', 'kravGjelder']),
  )
  const totalAntall = data.rader.reduce((s, r) => s + r.antall, 0)

  const gruppert = useMemo(
    () => grupperRader(data.rader, aktiveDimensjoner, alderVisning),
    [data.rader, aktiveDimensjoner, alderVisning],
  )

  const toggleDimensjon = (key: Dimensjon) => {
    setAktiveDimensjoner((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const getValue = useCallback(
    (item: GruppertRad, key: string): number | string | null => {
      if (key === 'alder') {
        return alderVisning === 'gruppe' ? (aldersgruppeSortering[item.alder as string] ?? 99) : (item.alder as string)
      }
      if (key === 'antall') return item.antall as number
      return (item[key] as string) ?? null
    },
    [alderVisning],
  )

  const { sort, handleSort, sorted } = useSortableTable(gruppert, 'antall', 'descending', getValue)

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Viser behandlinger med tilknyttet krav, fordelt på alder ved kravmottak. Velg hvilke dimensjoner som skal vises.
      </BodyShort>

      <HStack gap="space-24" wrap align="center">
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {totalAntall.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small">Totalt behandlinger</BodyShort>
        </VStack>
        <ToggleGroup size="small" value={alderVisning} onChange={(v) => setAlderVisning(v as AlderVisning)}>
          <ToggleGroup.Item value="gruppe">Aldersgruppe</ToggleGroup.Item>
          <ToggleGroup.Item value="aar">Per år</ToggleGroup.Item>
        </ToggleGroup>
      </HStack>

      <HStack gap="space-8" align="center">
        <BodyShort size="small" weight="semibold">
          Gruppér etter:
        </BodyShort>
        <Chips size="small">
          {dimensjoner.map((d) => (
            <Chips.Toggle key={d.key} selected={aktiveDimensjoner.has(d.key)} onClick={() => toggleDimensjon(d.key)}>
              {d.label}
            </Chips.Toggle>
          ))}
        </Chips>
      </HStack>

      {gruppert.length > 0 && (
        <Table size="small" zebraStripes sort={sort} onSortChange={handleSort}>
          <Table.Header>
            <Table.Row>
              {aktiveDimensjoner.has('sakType') && (
                <Table.ColumnHeader sortable sortKey="sakType">
                  Sakstype
                </Table.ColumnHeader>
              )}
              {aktiveDimensjoner.has('behandlingType') && (
                <Table.ColumnHeader sortable sortKey="behandlingType">
                  Behandlingstype
                </Table.ColumnHeader>
              )}
              {aktiveDimensjoner.has('kravGjelder') && (
                <Table.ColumnHeader sortable sortKey="kravGjelder">
                  Kravtype
                </Table.ColumnHeader>
              )}
              <Table.ColumnHeader sortable sortKey="alder">
                {alderVisning === 'gruppe' ? 'Aldersgruppe' : 'Alder'}
              </Table.ColumnHeader>
              <Table.ColumnHeader sortable sortKey="antall" align="right">
                Antall
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sorted.map((r, i) => (
              <Table.Row key={`${r.sakType}-${r.behandlingType}-${r.kravGjelder}-${r.alder}-${i}`}>
                {aktiveDimensjoner.has('sakType') && <Table.DataCell>{r.sakType}</Table.DataCell>}
                {aktiveDimensjoner.has('behandlingType') && (
                  <Table.DataCell>{decodeBehandling(r.behandlingType as string)}</Table.DataCell>
                )}
                {aktiveDimensjoner.has('kravGjelder') && <Table.DataCell>{r.kravGjelder}</Table.DataCell>}
                <Table.DataCell>{r.alder}</Table.DataCell>
                <Table.DataCell align="right">{(r.antall as number).toLocaleString('nb-NO')}</Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      <HStack justify="end">
        <LastNedTabData data={gruppert} filnavn="behandling-krav-alder" />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="behandlinger med krav og aldersfordeling" />
}
