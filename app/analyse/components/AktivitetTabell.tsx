import { BodyShort, Box, Heading, Table, VStack } from '@navikt/ds-react'
import type { ChartData, ChartOptions } from 'chart.js'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import React, { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import { decodeAktivitet } from '~/common/decodeBehandling'
import type { AktivitetStatistikk } from '../types'
import { formaterTall, formaterVarighet } from '../utils/formattering'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

type SortKey =
  | 'aktivitetType'
  | 'antallBehandlinger'
  | 'antallFullfort'
  | 'antallFeilet'
  | 'feilrate'
  | 'antallManuell'
  | 'gjennomsnittKjoringer'
  | 'totalKjoringer'
  | 'totalFeiledeKjoringer'
  | 'varighet'

function comparator(a: AktivitetStatistikk, b: AktivitetStatistikk, orderBy: SortKey): number {
  switch (orderBy) {
    case 'aktivitetType':
      return a.aktivitetType.localeCompare(b.aktivitetType)
    case 'antallBehandlinger':
      return a.antallBehandlinger - b.antallBehandlinger
    case 'antallFullfort':
      return a.antallFullfort - b.antallFullfort
    case 'antallFeilet':
      return a.antallFeilet - b.antallFeilet
    case 'feilrate':
      return (a.feilrate ?? 0) - (b.feilrate ?? 0)
    case 'antallManuell':
      return a.antallManuell - b.antallManuell
    case 'gjennomsnittKjoringer':
      return a.gjennomsnittKjoringer - b.gjennomsnittKjoringer
    case 'totalKjoringer':
      return a.totalKjoringer - b.totalKjoringer
    case 'totalFeiledeKjoringer':
      return a.totalFeiledeKjoringer - b.totalFeiledeKjoringer
    case 'varighet':
      return (a.gjennomsnittVarighetSekunder ?? 0) - (b.gjennomsnittVarighetSekunder ?? 0)
    default:
      return 0
  }
}

interface Props {
  data: AktivitetStatistikk[]
}

export default function AktivitetTabell({ data }: Props) {
  const [sort, setSort] = React.useState<{ orderBy: SortKey; direction: 'ascending' | 'descending' }>({
    orderBy: 'antallFeilet',
    direction: 'descending',
  })

  function handleSort(sortKey: string) {
    setSort((prev) =>
      prev.orderBy === sortKey
        ? { orderBy: sortKey as SortKey, direction: prev.direction === 'ascending' ? 'descending' : 'ascending' }
        : { orderBy: sortKey as SortKey, direction: 'descending' },
    )
  }

  const sorted = useMemo(() => {
    const copy = [...data]
    copy.sort((a, b) =>
      sort.direction === 'ascending' ? comparator(a, b, sort.orderBy) : comparator(b, a, sort.orderBy),
    )
    return copy
  }, [data, sort])

  const top10Feilrate = useMemo(() => {
    return [...data]
      .filter((a) => a.feilrate != null)
      .sort((a, b) => (b.feilrate ?? 0) - (a.feilrate ?? 0))
      .slice(0, 10)
  }, [data])

  const barData: ChartData<'bar'> = useMemo(() => {
    return {
      labels: top10Feilrate.map((a) => decodeAktivitet(a.aktivitetType)),
      datasets: [
        {
          label: 'Feilrate (%)',
          data: top10Feilrate.map((a) => (a.feilrate ?? 0) * 100),
          backgroundColor: 'rgba(255, 193, 102, 0.6)',
          borderColor: 'rgba(199, 115, 0, 1)',
          borderWidth: 1,
        },
      ],
    }
  }, [top10Feilrate])

  const barOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    plugins: {
      title: { display: true, text: 'Topp 10 aktiviteter etter feilrate' },
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${(ctx.parsed.x ?? 0).toFixed(1)}%`,
        },
      },
    },
    responsive: true,
    scales: {
      x: { ticks: { callback: (value) => `${value}%` } },
    },
  }

  function feilrateStyle(feilrate: number | null): React.CSSProperties {
    if (feilrate == null) return {}
    const pct = feilrate * 100
    if (pct > 5) return { backgroundColor: 'rgba(195, 0, 0, 0.15)' }
    if (pct > 1) return { backgroundColor: 'rgba(255, 193, 102, 0.2)' }
    return {}
  }

  if (data.length === 0) {
    return (
      <Box padding="space-32" style={{ textAlign: 'center' }}>
        <BodyShort>Ingen aktivitetsdata i valgt tidsrom</BodyShort>
      </Box>
    )
  }

  return (
    <VStack gap="space-24">
      {top10Feilrate.length > 0 && (
        <div style={{ maxHeight: '400px' }} role="img" aria-label="Søylediagram: Topp 10 aktiviteter etter feilrate">
          <Bar options={barOptions} data={barData} />
        </div>
      )}

      <Heading level="3" size="small">
        Aktiviteter
      </Heading>
      <Table size="small" zebraStripes sort={sort} onSortChange={handleSort}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>#</Table.ColumnHeader>
            <Table.ColumnHeader sortable sortKey="aktivitetType">
              Aktivitet
            </Table.ColumnHeader>
            <Table.ColumnHeader sortable sortKey="antallBehandlinger" align="right">
              Behandlinger
            </Table.ColumnHeader>
            <Table.ColumnHeader sortable sortKey="antallFullfort" align="right">
              Fullført
            </Table.ColumnHeader>
            <Table.ColumnHeader sortable sortKey="antallFeilet" align="right">
              Feilet
            </Table.ColumnHeader>
            <Table.ColumnHeader sortable sortKey="feilrate" align="right">
              Feilrate
            </Table.ColumnHeader>
            <Table.ColumnHeader sortable sortKey="antallManuell" align="right">
              Manuell
            </Table.ColumnHeader>
            <Table.ColumnHeader sortable sortKey="gjennomsnittKjoringer" align="right">
              Snitt kjøringer
            </Table.ColumnHeader>
            <Table.ColumnHeader sortable sortKey="totalKjoringer" align="right">
              Tot. kjøringer
            </Table.ColumnHeader>
            <Table.ColumnHeader sortable sortKey="totalFeiledeKjoringer" align="right">
              Tot. feilede
            </Table.ColumnHeader>
            <Table.ColumnHeader sortable sortKey="varighet" align="right">
              Snitt varighet
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sorted.map((a, idx) => (
            <Table.Row key={a.aktivitetType}>
              <Table.DataCell>{idx + 1}</Table.DataCell>
              <Table.DataCell>{decodeAktivitet(a.aktivitetType)}</Table.DataCell>
              <Table.DataCell align="right">{formaterTall(a.antallBehandlinger)}</Table.DataCell>
              <Table.DataCell align="right">{formaterTall(a.antallFullfort)}</Table.DataCell>
              <Table.DataCell align="right">{formaterTall(a.antallFeilet)}</Table.DataCell>
              <Table.DataCell align="right" style={feilrateStyle(a.feilrate)}>
                {a.feilrate != null ? `${(a.feilrate * 100).toFixed(1)}%` : '–'}
              </Table.DataCell>
              <Table.DataCell align="right">{formaterTall(a.antallManuell)}</Table.DataCell>
              <Table.DataCell align="right">{a.gjennomsnittKjoringer.toFixed(1)}</Table.DataCell>
              <Table.DataCell align="right">{formaterTall(a.totalKjoringer)}</Table.DataCell>
              <Table.DataCell align="right">{formaterTall(a.totalFeiledeKjoringer)}</Table.DataCell>
              <Table.DataCell align="right">{formaterVarighet(a.gjennomsnittVarighetSekunder)}</Table.DataCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </VStack>
  )
}
