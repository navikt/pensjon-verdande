import { BodyShort, HStack, Table, VStack } from '@navikt/ds-react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/auto-brev'
import LastNedTabData from './components/LastNedTabData'
import type { AutoBrevAnalyseResponse } from './types'
import { formaterProsent, formaterTall } from './utils/formattering'
import { parseAnalyseParams } from './utils/parseAnalyseParams'

export async function loader({ request }: Route.LoaderArgs) {
  const { params } = parseAnalyseParams(request)
  const response = await apiGet<AutoBrevAnalyseResponse>(`/api/behandling/analyse/auto-brev?${params}`, request)
  return { brevStatistikk: response.brevStatistikk }
}

export default function AutoBrevTab({ loaderData }: Route.ComponentProps) {
  const { brevStatistikk } = loaderData
  const [searchParams] = useSearchParams()
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''

  const total = brevStatistikk.reduce((sum, r) => sum + r.antall, 0)

  if (brevStatistikk.length === 0) {
    return (
      <VStack gap="space-16">
        <BodyShort size="small" textColor="subtle">
          Oversikt over automatisk bestilte brev per brevkode i valgt periode.
        </BodyShort>
        <BodyShort>Ingen autobrev funnet i valgt tidsrom.</BodyShort>
      </VStack>
    )
  }

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Oversikt over automatisk bestilte brev per brevkode i valgt periode. Totalt {formaterTall(total)} brev.
      </BodyShort>
      <Table size="small" zebraStripes sort={undefined}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Brevkode</Table.ColumnHeader>
            <Table.ColumnHeader align="right">Antall</Table.ColumnHeader>
            <Table.ColumnHeader align="right">Andel</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {brevStatistikk.map((r) => (
            <Table.Row key={r.brevkode}>
              <Table.DataCell>{r.brevkode}</Table.DataCell>
              <Table.DataCell align="right">{formaterTall(r.antall)}</Table.DataCell>
              <Table.DataCell align="right">{total === 0 ? '–' : formaterProsent(r.antall, total)}</Table.DataCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <HStack justify="end">
        <LastNedTabData data={brevStatistikk} filnavn={`auto-brev-${behandlingType}-${fom}-${tom}`} />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="data for autobrev" />
}
