import { BodyShort, Heading, HStack, Select, Skeleton, Table, TextField, ToggleGroup, VStack } from '@navikt/ds-react'
import React, { Suspense, useMemo, useState } from 'react'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { aldersgruppeSortering } from '~/analyse/utils/alderUtils'
import { apiGet } from '~/services/api.server'
import { logger } from '~/services/logger.server'
import type { Route } from './+types/sak-behandlingstid'
import LastNedTabData from './components/LastNedTabData'
import type { BehandlingstidPerTypeResponse, SaksbehandlingstidResponse } from './types'
import { parseSakAnalyseParams } from './utils/parseSakAnalyseParams'

const BehandlingstidChart = React.lazy(() => import('./components/BehandlingstidChart'))

type Metric = 'gjennomsnittDager' | 'medianDager' | 'p90Dager' | 'p95Dager'
type Gruppering = 'type' | 'aldersgruppe' | 'alder'

const metricLabels: Record<Metric, string> = {
  gjennomsnittDager: 'Snitt',
  medianDager: 'Median',
  p90Dager: 'P90',
  p95Dager: 'P95',
}

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

function alderAarLabel(key: string): string {
  return key === '-1' ? 'Ukjent' : `${key} år`
}

function alderAarSortOrder(keys: string[]): Record<string, number> {
  const order: Record<string, number> = {}
  for (const key of keys) {
    order[key] = key === '-1' ? -1 : Number.parseInt(key, 10)
  }
  return order
}

export async function loader({ request }: Route.LoaderArgs) {
  const { paramsAgg } = parseSakAnalyseParams(request)
  const tabell = await apiGet<SaksbehandlingstidResponse>(`/api/sak/analyse/behandlingstid?${paramsAgg}`, request)

  let perTypeMottatt: BehandlingstidPerTypeResponse | null = null
  let perTypeVedtak: BehandlingstidPerTypeResponse | null = null
  let perAlderGruppeMottatt: BehandlingstidPerTypeResponse | null = null
  let perAlderGruppeVedtak: BehandlingstidPerTypeResponse | null = null
  let perAlderAarMottatt: BehandlingstidPerTypeResponse | null = null
  let perAlderAarVedtak: BehandlingstidPerTypeResponse | null = null
  try {
    ;[
      perTypeMottatt,
      perTypeVedtak,
      perAlderGruppeMottatt,
      perAlderGruppeVedtak,
      perAlderAarMottatt,
      perAlderAarVedtak,
    ] = await Promise.all([
      apiGet<BehandlingstidPerTypeResponse>(
        `/api/sak/analyse/behandlingstid-per-type?${paramsAgg}&datoType=MOTTATT`,
        request,
      ),
      apiGet<BehandlingstidPerTypeResponse>(
        `/api/sak/analyse/behandlingstid-per-type?${paramsAgg}&datoType=VEDTAK`,
        request,
      ),
      apiGet<BehandlingstidPerTypeResponse>(
        `/api/sak/analyse/behandlingstid-per-alder?${paramsAgg}&datoType=MOTTATT&alderGruppering=GRUPPE`,
        request,
      ),
      apiGet<BehandlingstidPerTypeResponse>(
        `/api/sak/analyse/behandlingstid-per-alder?${paramsAgg}&datoType=VEDTAK&alderGruppering=GRUPPE`,
        request,
      ),
      apiGet<BehandlingstidPerTypeResponse>(
        `/api/sak/analyse/behandlingstid-per-alder?${paramsAgg}&datoType=MOTTATT&alderGruppering=AAR`,
        request,
      ),
      apiGet<BehandlingstidPerTypeResponse>(
        `/api/sak/analyse/behandlingstid-per-alder?${paramsAgg}&datoType=VEDTAK&alderGruppering=AAR`,
        request,
      ),
    ])
  } catch (e) {
    logger.warn(`Behandlingstid per type/alder feilet: ${String(e)}`)
  }

  return {
    tabell,
    perTypeMottatt,
    perTypeVedtak,
    perAlderGruppeMottatt,
    perAlderGruppeVedtak,
    perAlderAarMottatt,
    perAlderAarVedtak,
  }
}

function formaterDager(dager: number | null): string {
  if (dager == null) return '–'
  if (dager < 1) return `${(dager * 24).toFixed(1)} timer`
  return `${dager.toFixed(1)} dager`
}

function filtrerPerAar(
  data: BehandlingstidPerTypeResponse | null,
  fraAlder: number,
  tilAlder: number,
): BehandlingstidPerTypeResponse | null {
  if (!data) return null
  return {
    datapunkter: data.datapunkter.filter((d) => {
      const alder = Number.parseInt(d.behandlingType, 10)
      if (Number.isNaN(alder)) return false
      return alder >= fraAlder && alder <= tilAlder
    }),
  }
}

export default function SakBehandlingstidTab({ loaderData }: Route.ComponentProps) {
  const {
    tabell,
    perTypeMottatt,
    perTypeVedtak,
    perAlderGruppeMottatt,
    perAlderGruppeVedtak,
    perAlderAarMottatt,
    perAlderAarVedtak,
  } = loaderData
  const totalVedtak = tabell.datapunkter.reduce((s, d) => s + d.antall, 0)
  const [metric, setMetric] = useState<Metric>('gjennomsnittDager')
  const [gruppering, setGruppering] = useState<Gruppering>('type')
  const [fraAlderInput, setFraAlderInput] = useState('60')
  const [tilAlderInput, setTilAlderInput] = useState('80')

  const fraAlder = Number.parseInt(fraAlderInput, 10) || 0
  const tilAlder = Number.parseInt(tilAlderInput, 10) || 120

  const filteredMottattAar = useMemo(
    () => filtrerPerAar(perAlderAarMottatt, fraAlder, tilAlder),
    [perAlderAarMottatt, fraAlder, tilAlder],
  )
  const filteredVedtakAar = useMemo(
    () => filtrerPerAar(perAlderAarVedtak, fraAlder, tilAlder),
    [perAlderAarVedtak, fraAlder, tilAlder],
  )

  const mottattData =
    gruppering === 'type' ? perTypeMottatt : gruppering === 'aldersgruppe' ? perAlderGruppeMottatt : filteredMottattAar
  const vedtakData =
    gruppering === 'type' ? perTypeVedtak : gruppering === 'aldersgruppe' ? perAlderGruppeVedtak : filteredVedtakAar

  const alderAarKeys = [
    ...new Set([
      ...(filteredMottattAar?.datapunkter.map((d) => d.behandlingType) ?? []),
      ...(filteredVedtakAar?.datapunkter.map((d) => d.behandlingType) ?? []),
    ]),
  ]

  const chartProps =
    gruppering === 'type'
      ? { colorMap: typeColorMap, labelMap: typeLabelMap, sortOrder: undefined }
      : gruppering === 'aldersgruppe'
        ? { colorMap: undefined, labelMap: undefined, sortOrder: aldersgruppeSortering }
        : {
            colorMap: undefined,
            labelMap: Object.fromEntries(alderAarKeys.map((k) => [k, alderAarLabel(k)])),
            sortOrder: alderAarSortOrder(alderAarKeys),
          }

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Saksbehandlingstid måler tid fra krav er mottatt til vedtak er fattet. Valgt periode bestemmer hvilke vedtak som
        telles (basert på vedtaksdato), mens behandlingstiden kan strekke seg langt utenfor perioden — f.eks. et krav
        mottatt i 2021 med vedtak i 2026 gir ca. 1800 dagers behandlingstid. Høye verdier for snitt, P90 og P95 betyr at
        noen saker har lang total saksbehandlingstid, ikke at de ble behandlet i så mange dager innenfor perioden.
        Dekker kun vedtak som har tilknyttet kravhode med mottattdato.
      </BodyShort>

      <HStack gap="space-24" wrap align="end">
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {totalVedtak.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small">Vedtak med krav</BodyShort>
        </VStack>
        <Select
          label="Mål"
          size="small"
          value={metric}
          onChange={(e) => setMetric(e.target.value as Metric)}
          style={{ width: 160 }}
        >
          {Object.entries(metricLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
        <ToggleGroup size="small" value={gruppering} onChange={(v) => setGruppering(v as Gruppering)}>
          <ToggleGroup.Item value="type">Per type</ToggleGroup.Item>
          <ToggleGroup.Item value="aldersgruppe">Per aldersgruppe</ToggleGroup.Item>
          <ToggleGroup.Item value="alder">Per alder</ToggleGroup.Item>
        </ToggleGroup>
        {gruppering === 'alder' && (
          <>
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
          </>
        )}
      </HStack>

      {(vedtakData?.datapunkter.length ?? 0) > 0 || (mottattData?.datapunkter.length ?? 0) > 0 ? (
        <Suspense fallback={<Skeleton variant="rounded" width="100%" height={280} />}>
          <HStack gap="space-16" wrap>
            {mottattData && mottattData.datapunkter.length > 0 && (
              <VStack gap="space-4" style={{ flex: 1, minWidth: 400 }}>
                <BehandlingstidChart
                  data={mottattData.datapunkter}
                  metric={metric}
                  title={`${metricLabels[metric]} behandlingstid etter mottattdato`}
                  {...chartProps}
                />
              </VStack>
            )}
            {vedtakData && vedtakData.datapunkter.length > 0 && (
              <VStack gap="space-4" style={{ flex: 1, minWidth: 400 }}>
                <BehandlingstidChart
                  data={vedtakData.datapunkter}
                  metric={metric}
                  title={`${metricLabels[metric]} behandlingstid etter vedtaksdato`}
                  {...chartProps}
                />
              </VStack>
            )}
          </HStack>
        </Suspense>
      ) : null}

      {tabell.datapunkter.length > 0 && (
        <Table size="small" zebraStripes>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Periode</Table.ColumnHeader>
              <Table.ColumnHeader align="right">Antall</Table.ColumnHeader>
              <Table.ColumnHeader align="right">Snitt</Table.ColumnHeader>
              <Table.ColumnHeader align="right">Median</Table.ColumnHeader>
              <Table.ColumnHeader align="right">P90</Table.ColumnHeader>
              <Table.ColumnHeader align="right">P95</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {tabell.datapunkter.map((d) => (
              <Table.Row key={d.periodeFra}>
                <Table.DataCell>{d.periodeFra.substring(0, 10)}</Table.DataCell>
                <Table.DataCell align="right">{d.antall.toLocaleString('nb-NO')}</Table.DataCell>
                <Table.DataCell align="right">{formaterDager(d.gjennomsnittDager)}</Table.DataCell>
                <Table.DataCell align="right">{formaterDager(d.medianDager)}</Table.DataCell>
                <Table.DataCell align="right">{formaterDager(d.p90Dager)}</Table.DataCell>
                <Table.DataCell align="right">{formaterDager(d.p95Dager)}</Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      <HStack justify="end">
        <LastNedTabData data={tabell.datapunkter} filnavn="saksbehandlingstid" />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="saksbehandlingstid" />
}
