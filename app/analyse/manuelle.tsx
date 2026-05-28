import { BodyShort, HStack, VStack } from '@navikt/ds-react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/manuelle'
import LastNedTabData from './components/LastNedTabData'
import ManuelleOppgaverTabell from './components/ManuelleOppgaverTabell'
import type { ManuellOppgaveAnalyseResponse } from './types'
import { parseAnalyseParams } from './utils/parseAnalyseParams'

export async function loader({ request }: Route.LoaderArgs) {
  const { params } = parseAnalyseParams(request)
  const response = await apiGet<ManuellOppgaveAnalyseResponse>(
    `/api/behandling/analyse/manuelle-oppgaver?${params}`,
    request,
  )
  return { manuelleOppgaver: response.oppgaver }
}

export default function ManuelleTab({ loaderData }: Route.ComponentProps) {
  const { manuelleOppgaver } = loaderData
  const [searchParams] = useSearchParams()
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Aktiviteter som har sendt behandlinger til manuell saksbehandling. Klikk på en rad for å se hvilke
        kontrollpunkttyper som utløste den manuelle oppgaven. Mange manuelle oppgaver kan indikere behov for bedre
        automatisering.
      </BodyShort>
      <ManuelleOppgaverTabell data={manuelleOppgaver} />
      <HStack justify="end">
        <LastNedTabData data={manuelleOppgaver} filnavn={`manuelle-oppgaver-${behandlingType}-${fom}-${tom}`} />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="data for manuelle oppgaver" />
}
