import { BodyShort, Heading, HStack, VStack } from '@navikt/ds-react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/automatisering'
import AutomatiseringsChart from './components/AutomatiseringsChart'
import LastNedTabData from './components/LastNedTabData'
import type { AutomatiseringsAnalyseResponse } from './types'
import { parseAnalyseParams } from './utils/parseAnalyseParams'

export async function loader({ request }: Route.LoaderArgs) {
  const { paramsAgg } = parseAnalyseParams(request)
  return await apiGet<AutomatiseringsAnalyseResponse>(`/api/behandling/analyse/automatisering?${paramsAgg}`, request)
}

export default function AutomatiseringTab({ loaderData }: Route.ComponentProps) {
  const data = loaderData
  const [searchParams] = useSearchParams()
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''

  const prosent = data.automatiseringsgrad != null ? `${(data.automatiseringsgrad * 100).toFixed(1)} %` : '–'

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Andel av fullførte behandlinger som gjennomføres uten manuell intervensjon. En høy automatiseringsgrad betyr at
        systemet håndterer saker effektivt uten saksbehandler. Manuell betyr at minst én manuell oppgave ble opprettet.
      </BodyShort>

      <HStack gap="space-24" wrap>
        <VStack gap="space-4" align="center" style={{ minWidth: '120px' }}>
          <Heading level="3" size="xlarge">
            {prosent}
          </Heading>
          <BodyShort size="small" weight="semibold">
            Automatiseringsgrad
          </BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {data.totaltAntall.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small">Fullført totalt</BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {data.automatiskFullfort.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small">Automatisk</BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {data.manuellBehandlet.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small">Manuell</BodyShort>
        </VStack>
      </HStack>

      <AutomatiseringsChart data={data.datapunkter} />
      <HStack justify="end">
        <LastNedTabData data={data.datapunkter} filnavn={`automatisering-${behandlingType}-${fom}-${tom}`} />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="automatiseringsdata" />
}
