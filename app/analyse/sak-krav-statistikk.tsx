import {
  BodyShort,
  Chips,
  Heading,
  HStack,
  Skeleton,
  Table,
  TextField,
  ToggleGroup,
  UNSAFE_Combobox,
  VStack,
} from '@navikt/ds-react'
import React, { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/sak-krav-statistikk'
import LastNedTabData from './components/LastNedTabData'
import type { BehandlingstidPerTypeDatapunkt, KravStatistikkRad, KravStatistikkResponse } from './types'
import { type AlderVisning, alderLabel, aldersgruppeSortering, tilAldersgruppe } from './utils/alderUtils'
import { parseSakAnalyseParams } from './utils/parseSakAnalyseParams'
import { useSortableTable } from './utils/useSortableTable'

const BehandlingstidChart = React.lazy(() => import('./components/BehandlingstidChart'))

export async function loader({ request }: Route.LoaderArgs) {
  const { paramsAgg } = parseSakAnalyseParams(request)
  return await apiGet<KravStatistikkResponse>(`/api/sak/analyse/krav?${paramsAgg}`, request)
}

type Dimensjon = 'sakType' | 'kravGjelder' | 'kravStatus' | 'behandlingType' | 'vedtakStatus' | 'alder'

const dimensjoner: { key: Dimensjon; label: string }[] = [
  { key: 'sakType', label: 'Sakstype' },
  { key: 'kravGjelder', label: 'Kravtype' },
  { key: 'kravStatus', label: 'Kravstatus' },
  { key: 'behandlingType', label: 'Behandlingstype' },
  { key: 'vedtakStatus', label: 'Vedtaksstatus' },
  { key: 'alder', label: 'Alder' },
]

type GruppertRad = Record<string, string | number | null>

const typeColorMap: Record<string, { border: string; bg: string }> = {
  AUTO: { border: 'rgba(54, 162, 235, 1)', bg: 'rgba(54, 162, 235, 0.15)' },
  DEL_AUTO: { border: 'rgba(255, 159, 64, 1)', bg: 'rgba(255, 159, 64, 0.15)' },
  MAN: { border: 'rgba(255, 99, 132, 1)', bg: 'rgba(255, 99, 132, 0.15)' },
}

const typeLabelMap: Record<string, string> = {
  AUTO: 'Automatisk',
  DEL_AUTO: 'Del-automatisk',
  MAN: 'Manuell',
}

function formatDager(value: number | null | undefined): string {
  if (value == null) return '–'
  return value.toFixed(1)
}

/** Aggreger kravstatistikk-rader til BehandlingstidPerTypeDatapunkt for diagramvisning. */
function aggregerBehandlingstid(
  rader: KravStatistikkRad[],
  grupperingFn: (r: KravStatistikkRad) => string,
): BehandlingstidPerTypeDatapunkt[] {
  const map = new Map<string, { antall: number; sumDager: number; antallMedVedtak: number }>()

  for (const r of rader) {
    if (!r.periodeFra) continue
    const gruppe = grupperingFn(r)
    const key = `${r.periodeFra}|${gruppe}`
    const existing = map.get(key)
    if (existing) {
      existing.antall += r.antall
      if (r.gjennomsnittDager != null) {
        existing.sumDager += r.gjennomsnittDager * r.antall
        existing.antallMedVedtak += r.antall
      }
    } else {
      map.set(key, {
        antall: r.antall,
        sumDager: r.gjennomsnittDager != null ? r.gjennomsnittDager * r.antall : 0,
        antallMedVedtak: r.gjennomsnittDager != null ? r.antall : 0,
      })
    }
  }

  return [...map.entries()].map(([key, v]) => {
    const [periodeFra, behandlingsType] = key.split('|')
    return {
      periodeFra,
      behandlingsType,
      antall: v.antall,
      gjennomsnittDager: v.antallMedVedtak > 0 ? v.sumDager / v.antallMedVedtak : null,
      medianDager: null,
      p90Dager: null,
      p95Dager: null,
    }
  })
}

function grupperRader(
  rader: KravStatistikkResponse['krav'],
  aktiveDimensjoner: Set<Dimensjon>,
  alderVisning: AlderVisning,
): GruppertRad[] {
  const map = new Map<string, GruppertRad>()

  for (const r of rader) {
    const keyParts: string[] = []
    const rad: GruppertRad = { antall: 0, _sumDager: 0, _antallMedVedtak: 0 }

    for (const d of dimensjoner) {
      if (!aktiveDimensjoner.has(d.key)) continue
      if (d.key === 'alder') {
        const alderVerdi = alderVisning === 'gruppe' ? tilAldersgruppe(r.alder) : alderLabel(r.alder)
        rad.alder = alderVerdi
        keyParts.push(alderVerdi)
      } else {
        rad[d.key] = r[d.key]
        keyParts.push(r[d.key])
      }
    }
    const key = keyParts.join('|') || '__total__'

    const existing = map.get(key)
    if (existing) {
      ;(existing.antall as number) += r.antall
      if (r.gjennomsnittDager != null) {
        ;(existing._sumDager as number) += r.gjennomsnittDager * r.antall
        ;(existing._antallMedVedtak as number) += r.antall
      }
      // Percentiler kan ikke slås sammen — null ut ved aggregering
      existing.medianDager = null
      existing.p90Dager = null
      existing.p95Dager = null
    } else {
      rad.antall = r.antall
      if (r.gjennomsnittDager != null) {
        rad._sumDager = r.gjennomsnittDager * r.antall
        rad._antallMedVedtak = r.antall
      }
      rad.medianDager = r.medianDager
      rad.p90Dager = r.p90Dager
      rad.p95Dager = r.p95Dager
      map.set(key, rad)
    }
  }

  // Beregn vektet gjennomsnitt for alle rader
  for (const rad of map.values()) {
    const sum = rad._sumDager as number
    const n = rad._antallMedVedtak as number
    rad.gjennomsnittDager = n > 0 ? sum / n : null
    delete rad._sumDager
    delete rad._antallMedVedtak
  }

  return [...map.values()]
}

export default function KravStatistikkTab({ loaderData }: Route.ComponentProps) {
  const data = loaderData
  const [aktiveDimensjoner, setAktiveDimensjoner] = useState<Set<Dimensjon>>(
    new Set(['sakType', 'kravGjelder', 'kravStatus', 'behandlingType']),
  )
  const [alderVisning, setAlderVisning] = useState<AlderVisning>('gruppe')

  // Behandlingstid-diagram — aldersfilter
  const [fraAlderInput, setFraAlderInput] = useState('60')
  const [tilAlderInput, setTilAlderInput] = useState('80')
  const fraAlder = Number.parseInt(fraAlderInput, 10) || 0
  const tilAlder = Number.parseInt(tilAlderInput, 10) || 120

  // Client-side filtre for kravstatus og vedtaksstatus
  const [filtrerteKravStatuser, setFiltrerteKravStatuser] = useState<string[]>([])
  const [filtrerteVedtakStatuser, setFiltrerteVedtakStatuser] = useState<string[]>([])

  // Behandlingstype-filter fra URL (satt i layout)
  const [searchParams] = useSearchParams()
  const behandlingstyper = useMemo(() => searchParams.getAll('behandlingType'), [searchParams])

  // Unike verdier for combobox-options
  const kravStatusOptions = useMemo(() => [...new Set(data.krav.map((r) => r.kravStatus))].sort(), [data.krav])
  const vedtakStatusOptions = useMemo(() => [...new Set(data.krav.map((r) => r.vedtakStatus))].sort(), [data.krav])

  // Filtrerte rader basert på valgte statuser og behandlingstyper
  const filtrerteRader = useMemo(() => {
    let rader = data.krav
    if (behandlingstyper.length > 0) rader = rader.filter((r) => behandlingstyper.includes(r.behandlingType))
    if (filtrerteKravStatuser.length > 0) rader = rader.filter((r) => filtrerteKravStatuser.includes(r.kravStatus))
    if (filtrerteVedtakStatuser.length > 0)
      rader = rader.filter((r) => filtrerteVedtakStatuser.includes(r.vedtakStatus))
    return rader
  }, [data.krav, behandlingstyper, filtrerteKravStatuser, filtrerteVedtakStatuser])

  const totalAntall = filtrerteRader.reduce((s, t) => s + t.antall, 0)

  const gruppert = useMemo(
    () => grupperRader(filtrerteRader, aktiveDimensjoner, alderVisning),
    [filtrerteRader, aktiveDimensjoner, alderVisning],
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
      if (
        key === 'antall' ||
        key === 'gjennomsnittDager' ||
        key === 'medianDager' ||
        key === 'p90Dager' ||
        key === 'p95Dager'
      ) {
        return (item[key] as number) ?? null
      }
      return (item[key] as string) ?? null
    },
    [alderVisning],
  )

  const { sort, handleSort, sorted } = useSortableTable(gruppert, 'antall', 'descending', getValue)

  const alderAktiv = aktiveDimensjoner.has('alder')

  // Behandlingstid per type
  const btPerType: BehandlingstidPerTypeDatapunkt[] = useMemo(
    () => aggregerBehandlingstid(filtrerteRader, (r) => r.behandlingType),
    [filtrerteRader],
  )

  // Behandlingstid per aldersgruppe
  const btPerAldersgruppe: BehandlingstidPerTypeDatapunkt[] = useMemo(
    () => aggregerBehandlingstid(filtrerteRader, (r) => tilAldersgruppe(r.alder)),
    [filtrerteRader],
  )

  // Behandlingstid per alder (med aldersfilter)
  const btPerAlder: BehandlingstidPerTypeDatapunkt[] = useMemo(
    () =>
      aggregerBehandlingstid(
        filtrerteRader.filter((r) => r.alder >= fraAlder && r.alder <= tilAlder),
        (r) => String(r.alder),
      ),
    [filtrerteRader, fraAlder, tilAlder],
  )

  const alderChartProps = useMemo(() => {
    const alderKeys = [...new Set(btPerAlder.map((d) => d.behandlingsType))]
    return {
      colorMap: undefined,
      labelMap: Object.fromEntries(alderKeys.map((k) => [k, k === '-1' ? 'Ukjent' : `${k} år`])),
      sortOrder: Object.fromEntries(alderKeys.map((k) => [k, k === '-1' ? -1 : Number.parseInt(k, 10)])),
    }
  }, [btPerAlder])

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Statistikk over krav i pensjon-pen med dimensjoner og behandlingstid. Snitt beregnes som vektet gjennomsnitt ved
        aggregering. Median, P90 og P95 vises med &laquo;–&raquo; når rader er aggregert.
      </BodyShort>

      <HStack gap="space-16" wrap>
        <UNSAFE_Combobox
          label="Kravstatus"
          size="small"
          options={kravStatusOptions}
          isMultiSelect
          selectedOptions={filtrerteKravStatuser}
          onToggleSelected={(option, isSelected) =>
            setFiltrerteKravStatuser((prev) => (isSelected ? [...prev, option] : prev.filter((s) => s !== option)))
          }
        />
        <UNSAFE_Combobox
          label="Vedtaksstatus"
          size="small"
          options={vedtakStatusOptions}
          isMultiSelect
          selectedOptions={filtrerteVedtakStatuser}
          onToggleSelected={(option, isSelected) =>
            setFiltrerteVedtakStatuser((prev) => (isSelected ? [...prev, option] : prev.filter((s) => s !== option)))
          }
        />
      </HStack>

      {btPerType.length > 0 && (
        <VStack gap="space-8">
          <Heading level="3" size="small">
            Behandlingstid per behandlingstype
          </Heading>
          <BodyShort size="small" textColor="subtle">
            Vektet snitt saksbehandlingstid (kravmottatt → vedtak) per periode, brutt ned på behandlingstype.
          </BodyShort>
          <React.Suspense fallback={<Skeleton variant="rounded" width="100%" height={280} />}>
            <BehandlingstidChart
              data={btPerType}
              metric="gjennomsnittDager"
              title="Snitt behandlingstid (dager)"
              colorMap={typeColorMap}
              labelMap={typeLabelMap}
            />
          </React.Suspense>
        </VStack>
      )}

      {btPerAldersgruppe.length > 0 && (
        <VStack gap="space-8">
          <Heading level="3" size="small">
            Behandlingstid per aldersgruppe
          </Heading>
          <BodyShort size="small" textColor="subtle">
            Vektet snitt saksbehandlingstid per periode, brutt ned på aldersgruppe ved kravmottak.
          </BodyShort>
          <React.Suspense fallback={<Skeleton variant="rounded" width="100%" height={280} />}>
            <BehandlingstidChart
              data={btPerAldersgruppe}
              metric="gjennomsnittDager"
              title="Snitt behandlingstid (dager)"
              sortOrder={aldersgruppeSortering}
            />
          </React.Suspense>
        </VStack>
      )}

      {btPerAlder.length > 0 && (
        <VStack gap="space-8">
          <HStack gap="space-16" wrap align="end">
            <Heading level="3" size="small">
              Behandlingstid per alder
            </Heading>
            <TextField
              label="Fra alder"
              size="small"
              type="number"
              value={fraAlderInput}
              onChange={(e) => setFraAlderInput(e.target.value)}
              style={{ width: 90 }}
              htmlSize={4}
            />
            <TextField
              label="Til alder"
              size="small"
              type="number"
              value={tilAlderInput}
              onChange={(e) => setTilAlderInput(e.target.value)}
              style={{ width: 90 }}
              htmlSize={4}
            />
          </HStack>
          <BodyShort size="small" textColor="subtle">
            Vektet snitt saksbehandlingstid per periode, brutt ned på eksakt alder ved kravmottak.
          </BodyShort>
          <React.Suspense fallback={<Skeleton variant="rounded" width="100%" height={280} />}>
            <BehandlingstidChart
              data={btPerAlder}
              metric="gjennomsnittDager"
              title="Snitt behandlingstid (dager)"
              {...alderChartProps}
            />
          </React.Suspense>
        </VStack>
      )}

      <HStack gap="space-24" wrap align="center">
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {totalAntall.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small">Totalt krav</BodyShort>
        </VStack>
        {alderAktiv && (
          <ToggleGroup size="small" value={alderVisning} onChange={(v) => setAlderVisning(v as AlderVisning)}>
            <ToggleGroup.Item value="gruppe">Aldersgruppe</ToggleGroup.Item>
            <ToggleGroup.Item value="aar">Per år</ToggleGroup.Item>
          </ToggleGroup>
        )}
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
              {aktiveDimensjoner.has('kravGjelder') && (
                <Table.ColumnHeader sortable sortKey="kravGjelder">
                  Kravtype
                </Table.ColumnHeader>
              )}
              {aktiveDimensjoner.has('kravStatus') && (
                <Table.ColumnHeader sortable sortKey="kravStatus">
                  Kravstatus
                </Table.ColumnHeader>
              )}
              {aktiveDimensjoner.has('behandlingType') && (
                <Table.ColumnHeader sortable sortKey="behandlingType">
                  Behandlingstype
                </Table.ColumnHeader>
              )}
              {aktiveDimensjoner.has('vedtakStatus') && (
                <Table.ColumnHeader sortable sortKey="vedtakStatus">
                  Vedtaksstatus
                </Table.ColumnHeader>
              )}
              {alderAktiv && (
                <Table.ColumnHeader sortable sortKey="alder">
                  {alderVisning === 'gruppe' ? 'Aldersgruppe' : 'Alder'}
                </Table.ColumnHeader>
              )}
              <Table.ColumnHeader sortable sortKey="antall" align="right">
                Antall
              </Table.ColumnHeader>
              <Table.ColumnHeader sortable sortKey="gjennomsnittDager" align="right">
                Snitt (dager)
              </Table.ColumnHeader>
              <Table.ColumnHeader sortable sortKey="medianDager" align="right">
                Median
              </Table.ColumnHeader>
              <Table.ColumnHeader sortable sortKey="p90Dager" align="right">
                P90
              </Table.ColumnHeader>
              <Table.ColumnHeader sortable sortKey="p95Dager" align="right">
                P95
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sorted.map((r, i) => (
              <Table.Row
                key={`${r.sakType}-${r.kravGjelder}-${r.kravStatus}-${r.behandlingType}-${r.vedtakStatus}-${r.alder}-${i}`}
              >
                {aktiveDimensjoner.has('sakType') && <Table.DataCell>{r.sakType}</Table.DataCell>}
                {aktiveDimensjoner.has('kravGjelder') && <Table.DataCell>{r.kravGjelder}</Table.DataCell>}
                {aktiveDimensjoner.has('kravStatus') && <Table.DataCell>{r.kravStatus}</Table.DataCell>}
                {aktiveDimensjoner.has('behandlingType') && <Table.DataCell>{r.behandlingType}</Table.DataCell>}
                {aktiveDimensjoner.has('vedtakStatus') && <Table.DataCell>{r.vedtakStatus}</Table.DataCell>}
                {alderAktiv && <Table.DataCell>{r.alder}</Table.DataCell>}
                <Table.DataCell align="right">{(r.antall as number).toLocaleString('nb-NO')}</Table.DataCell>
                <Table.DataCell align="right">{formatDager(r.gjennomsnittDager as number | null)}</Table.DataCell>
                <Table.DataCell align="right">{formatDager(r.medianDager as number | null)}</Table.DataCell>
                <Table.DataCell align="right">{formatDager(r.p90Dager as number | null)}</Table.DataCell>
                <Table.DataCell align="right">{formatDager(r.p95Dager as number | null)}</Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      <HStack justify="end">
        <LastNedTabData data={gruppert} filnavn="krav-statistikk" />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="kravstatistikk" />
}
