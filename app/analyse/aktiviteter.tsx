import { BodyShort, HStack, VStack } from '@navikt/ds-react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/aktiviteter'
import AktivitetTabell from './components/AktivitetTabell'
import LastNedTabData from './components/LastNedTabData'
import type { AktivitetAnalyseResponse } from './types'
import { parseAnalyseParams } from './utils/parseAnalyseParams'

export async function loader({ request }: Route.LoaderArgs) {
  const { params } = parseAnalyseParams(request)
  const response = await apiGet<AktivitetAnalyseResponse>(`/api/behandling/analyse/aktiviteter?${params}`, request)
  return { aktiviteter: response.aktiviteter }
}

export default function AktiviteterTab({ loaderData }: Route.ComponentProps) {
  const { aktiviteter } = loaderData
  const [searchParams] = useSearchParams()
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Statistikk per aktivitet (steg) i behandlingen. Feilrate er andel kjøringer som feilet — høy feilrate kan tyde
        på ustabil integrasjon eller datakvalitetsproblem. «Feilet» viser antall behandlinger der aktiviteten har feilet
        minst én gang.
      </BodyShort>
      <AktivitetTabell data={aktiviteter} />
      <HStack justify="end">
        <LastNedTabData data={aktiviteter} filnavn={`aktiviteter-${behandlingType}-${fom}-${tom}`} />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="aktivitetsdata" />
}
