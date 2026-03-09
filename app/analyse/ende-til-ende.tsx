import { BodyShort, HStack, VStack } from '@navikt/ds-react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/ende-til-ende'
import EndeTilEndeChart from './components/EndeTilEndeChart'
import LastNedTabData from './components/LastNedTabData'
import type { EndeTilEndeAnalyseResponse } from './types'
import { parseAnalyseParams } from './utils/parseAnalyseParams'

export async function loader({ request }: Route.LoaderArgs) {
  const { paramsAgg } = parseAnalyseParams(request)
  const endeTilEnde = await apiGet<EndeTilEndeAnalyseResponse>(
    `/api/behandling/analyse/ende-til-ende?${paramsAgg}`,
    request,
  )
  return { endeTilEnde }
}

export default function EndeTilEndeTab({ loaderData }: Route.ComponentProps) {
  const { endeTilEnde } = loaderData
  const [searchParams] = useSearchParams()
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Total saksbehandlingstid fra krav mottas til vedtak er iverksatt, brutt ned i fasene mottak → opprettet,
        opprettet → ferdig og ferdig → iverksatt. Kun behandlinger med fullført vedtak og kjent mottaksdato er
        inkludert. Filtrer på kravstatus for å sammenligne kravtyper.
      </BodyShort>
      <EndeTilEndeChart data={endeTilEnde} />
      <HStack justify="end">
        <LastNedTabData data={endeTilEnde} filnavn={`ende-til-ende-${behandlingType}-${fom}-${tom}`} />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="ende-til-ende-data" />
}
