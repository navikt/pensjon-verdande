import { BodyShort, Heading, HStack, Skeleton, Table, VStack } from '@navikt/ds-react'
import React, { useCallback } from 'react'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/mottakere-alder'
import LastNedTabData from './components/LastNedTabData'
import type { AlderspensjonMottakereDatapunkt, AlderspensjonMottakereResponse } from './types'
import { formaterPeriodeLabel, formaterTall } from './utils/formattering'
import { parseAlderspensjonParams } from './utils/parseAlderspensjonParams'
import { useSortableTable } from './utils/useSortableTable'

const MottakereAlderChart = React.lazy(() => import('./components/MottakereAlderChart'))

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Alderspensjon — mottakere | Verdande' }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const { paramsAgg } = parseAlderspensjonParams(request)
  return await apiGet<AlderspensjonMottakereResponse>(`/api/sak/analyse/alderspensjon-mottakere?${paramsAgg}`, request)
}

type Rad = AlderspensjonMottakereDatapunkt & {
  nettoEndring: number
  snittBruttoPerMnd: number | null
}

function berikRader(datapunkter: AlderspensjonMottakereDatapunkt[]): Rad[] {
  return datapunkter.map((d) => ({
    ...d,
    nettoEndring: d.antallNye - d.antallOpphor,
    snittBruttoPerMnd:
      d.gjennomsnittBruttoPerAarNyeMottakere == null ? null : d.gjennomsnittBruttoPerAarNyeMottakere / 12,
  }))
}

function formaterNok(value: number | null | undefined): string {
  if (value == null) return '–'
  return `${value.toLocaleString('nb-NO', { maximumFractionDigits: 0 })} kr`
}

export default function MottakereAlderTab({ loaderData }: Route.ComponentProps) {
  const datapunkter = loaderData.datapunkter
  const rader = React.useMemo(() => berikRader(datapunkter), [datapunkter])

  const totalNye = rader.reduce((s, r) => s + r.antallNye, 0)
  const totalOpphor = rader.reduce((s, r) => s + r.antallOpphor, 0)
  const nettoEndring = totalNye - totalOpphor

  // Vektet snitt brutto over perioder som har verdi (vekt = antallNye).
  // Vi sporer også hvor mange nye mottakere som ikke inngår i snittet (perioder
  // der gjennomsnittBruttoPerAarNyeMottakere er null) for tydelig KPI-kommunikasjon.
  const { sumBrutto, antallMedBrutto, antallUtenBrutto } = rader.reduce(
    (acc, r) => {
      if (r.gjennomsnittBruttoPerAarNyeMottakere != null) {
        acc.sumBrutto += r.gjennomsnittBruttoPerAarNyeMottakere * r.antallNye
        acc.antallMedBrutto += r.antallNye
      } else {
        acc.antallUtenBrutto += r.antallNye
      }
      return acc
    },
    { sumBrutto: 0, antallMedBrutto: 0, antallUtenBrutto: 0 },
  )
  const vektetSnittBruttoPerAar = antallMedBrutto > 0 ? sumBrutto / antallMedBrutto : null
  const vektetSnittBruttoPerMnd = vektetSnittBruttoPerAar == null ? null : vektetSnittBruttoPerAar / 12
  const dekningstekst =
    antallMedBrutto > 0 && antallUtenBrutto > 0
      ? `${antallMedBrutto.toLocaleString('nb-NO')} av ${(antallMedBrutto + antallUtenBrutto).toLocaleString('nb-NO')} nye inngår`
      : null

  const getValue = useCallback((item: Rad, key: string): number | string | null => {
    if (key === 'periodeFra') return item.periodeFra
    if (
      key === 'antallNye' ||
      key === 'antallOpphor' ||
      key === 'nettoEndring' ||
      key === 'gjennomsnittBruttoPerAarNyeMottakere' ||
      key === 'snittBruttoPerMnd'
    ) {
      return (item[key] as number | null) ?? null
    }
    return null
  }, [])

  const { sort, handleSort, sorted } = useSortableTable(rader, 'periodeFra', 'ascending', getValue)

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Tidsserie over nye mottakere (vedtakstype FORGANG) og opphør (vedtakstype OPPHOR) for sakstype ALDER, samt snitt
        utbetaling for nye mottakere i perioden. Aggregeres på virkningsdato (DATO_VIRK_FOM). Data fra pensjon-pen
        (T_VEDTAK + T_BEREGNING).
      </BodyShort>

      <HStack gap="space-32" wrap>
        <VStack gap="space-4" align="center" style={{ minWidth: '140px' }}>
          <Heading level="3" size="large">
            {totalNye.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small">Totalt nye mottakere</BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '140px' }}>
          <Heading level="3" size="large">
            {totalOpphor.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small">Totalt opphør</BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '140px' }}>
          <Heading level="3" size="large">
            {nettoEndring >= 0 ? '+' : ''}
            {nettoEndring.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small">Netto endring</BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '180px' }}>
          <Heading level="3" size="large">
            {formaterNok(vektetSnittBruttoPerMnd)}
          </Heading>
          <BodyShort size="small">Snitt brutto/mnd, nye (vektet)</BodyShort>
          {dekningstekst && (
            <BodyShort size="small" textColor="subtle">
              {dekningstekst}
            </BodyShort>
          )}
        </VStack>
      </HStack>

      <VStack gap="space-8">
        <Heading level="3" size="small">
          Tilvekst, avgang og snitt utbetaling
        </Heading>
        <BodyShort size="small" textColor="subtle">
          Linjer viser nye mottakere og opphør per periode. Søyler viser snitt månedlig brutto for nye mottakere (NOK).
        </BodyShort>
        <React.Suspense fallback={<Skeleton variant="rounded" width="100%" height={320} />}>
          <MottakereAlderChart data={datapunkter} />
        </React.Suspense>
      </VStack>

      {rader.length > 0 && (
        <Table size="small" zebraStripes sort={sort} onSortChange={handleSort}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader sortable sortKey="periodeFra">
                Periode
              </Table.ColumnHeader>
              <Table.ColumnHeader sortable sortKey="antallNye" align="right">
                Nye
              </Table.ColumnHeader>
              <Table.ColumnHeader sortable sortKey="antallOpphor" align="right">
                Opphør
              </Table.ColumnHeader>
              <Table.ColumnHeader sortable sortKey="nettoEndring" align="right">
                Netto
              </Table.ColumnHeader>
              <Table.ColumnHeader sortable sortKey="gjennomsnittBruttoPerAarNyeMottakere" align="right">
                Snitt brutto/år (nye)
              </Table.ColumnHeader>
              <Table.ColumnHeader sortable sortKey="snittBruttoPerMnd" align="right">
                Snitt brutto/mnd (nye)
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sorted.map((r) => (
              <Table.Row key={r.periodeFra}>
                <Table.DataCell>{formaterPeriodeLabel(r.periodeFra)}</Table.DataCell>
                <Table.DataCell align="right">{formaterTall(r.antallNye)}</Table.DataCell>
                <Table.DataCell align="right">{formaterTall(r.antallOpphor)}</Table.DataCell>
                <Table.DataCell align="right">
                  {r.nettoEndring >= 0 ? '+' : ''}
                  {r.nettoEndring.toLocaleString('nb-NO')}
                </Table.DataCell>
                <Table.DataCell align="right">{formaterNok(r.gjennomsnittBruttoPerAarNyeMottakere)}</Table.DataCell>
                <Table.DataCell align="right">{formaterNok(r.snittBruttoPerMnd)}</Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      <HStack justify="end">
        <LastNedTabData data={rader} filnavn="alderspensjon-mottakere" />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="alderspensjon-mottakere" />
}
