import { BodyShort, HStack, VStack } from '@navikt/ds-react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/statustrend'
import LastNedTabData from './components/LastNedTabData'
import StatusTrendChart from './components/StatusTrendChart'
import type { TidsserieResponse } from './types'
import { parseAnalyseParams } from './utils/parseAnalyseParams'

export async function loader({ request }: Route.LoaderArgs) {
  const { paramsAgg } = parseAnalyseParams(request)
  const response = await apiGet<TidsserieResponse>(`/api/behandling/analyse/tidsserie?${paramsAgg}`, request)
  return { tidsserie: response.datapunkter }
}

export default function StatustrendTab({ loaderData }: Route.ComponentProps) {
  const { tidsserie } = loaderData
  const [searchParams] = useSearchParams()
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Fordeling av behandlingsstatuser over tid. Hver søyle viser antall behandlinger per status i perioden. Bruk
        dette for å identifisere trender i feilrate og gjennomstrømning.
      </BodyShort>
      <StatusTrendChart data={tidsserie} />
      <HStack justify="end">
        <LastNedTabData data={tidsserie} filnavn={`statustrend-${behandlingType}-${fom}-${tom}`} />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="statustrend-data" />
}
