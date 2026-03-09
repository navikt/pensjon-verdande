import { BodyShort, HStack, VStack } from '@navikt/ds-react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/varighet'
import LastNedTabData from './components/LastNedTabData'
import VarighetChart from './components/VarighetChart'
import type { VarighetAnalyseResponse } from './types'
import { parseAnalyseParams } from './utils/parseAnalyseParams'

export async function loader({ request }: Route.LoaderArgs) {
  const { paramsAgg } = parseAnalyseParams(request)
  const response = await apiGet<VarighetAnalyseResponse>(`/api/behandling/analyse/varighet?${paramsAgg}`, request)
  return { varighet: response.datapunkter }
}

export default function VarighetTab({ loaderData }: Route.ComponentProps) {
  const { varighet } = loaderData
  const [searchParams] = useSearchParams()
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Behandlingstid fra opprettet til fullført. Viser gjennomsnitt, median, P90 og P95 over tid. Median er mest
        robust mot ekstremverdier, mens P90/P95 viser halen i fordelingen.
      </BodyShort>
      <VarighetChart data={varighet} />
      <HStack justify="end">
        <LastNedTabData data={varighet} filnavn={`varighet-${behandlingType}-${fom}-${tom}`} />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="varighetsdata" />
}
