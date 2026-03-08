import { BodyShort, Heading, HStack, VStack } from '@navikt/ds-react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/ko'
import KoChart from './components/KoChart'
import LastNedTabData from './components/LastNedTabData'
import type { KoAnalyseResponse } from './types'
import { formaterVarighet } from './utils/formattering'
import { parseAnalyseParams } from './utils/parseAnalyseParams'

export async function loader({ request }: Route.LoaderArgs) {
  const { paramsAgg } = parseAnalyseParams(request)
  return await apiGet<KoAnalyseResponse>(`/api/behandling/analyse/ko?${paramsAgg}`, request)
}

export default function KoTab({ loaderData }: Route.ComponentProps) {
  const data = loaderData
  const [searchParams] = useSearchParams()
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''

  const totalOpprettet = data.datapunkter.reduce((sum, d) => sum + d.opprettet, 0)
  const totalFullfort = data.datapunkter.reduce((sum, d) => sum + d.fullfort, 0)
  const nonNullVentetid = data.datapunkter.filter((d) => d.gjennomsnittVentetidSekunder != null)
  const totalVentetidWeight = nonNullVentetid.reduce((sum, d) => sum + d.opprettet, 0)
  const snittVentetid =
    totalVentetidWeight > 0
      ? nonNullVentetid.reduce((sum, d) => sum + (d.gjennomsnittVentetidSekunder ?? 0) * d.opprettet, 0) /
        totalVentetidWeight
      : null

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Gjennomstrømning viser forholdet mellom opprettede og fullførte behandlinger per periode. Dersom opprettet
        overstiger fullført over tid, vokser køen. Ventetid måler tiden fra behandlingen opprettes til første kjøring
        starter.
      </BodyShort>

      <HStack gap="space-24" wrap>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {totalOpprettet.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small">Opprettet</BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {totalFullfort.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small">Fullført</BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '120px' }}>
          <Heading level="3" size="large">
            {formaterVarighet(snittVentetid)}
          </Heading>
          <BodyShort size="small">Snitt ventetid</BodyShort>
        </VStack>
      </HStack>

      <KoChart data={data.datapunkter} />
      <HStack justify="end">
        <LastNedTabData data={data.datapunkter} filnavn={`ko-${behandlingType}-${fom}-${tom}`} />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="kødata" />
}
