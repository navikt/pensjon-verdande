import { BodyShort, Heading, HStack, VStack } from '@navikt/ds-react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/tidspunkt'
import LastNedTabData from './components/LastNedTabData'
import TidspunktHeatmap from './components/TidspunktHeatmap'
import type { TidspunktAnalyseResponse } from './types'
import { parseAnalyseParams } from './utils/parseAnalyseParams'

export async function loader({ request }: Route.LoaderArgs) {
  const { params } = parseAnalyseParams(request)
  return await apiGet<TidspunktAnalyseResponse>(`/api/behandling/analyse/tidspunkt?${params}`, request)
}

const UKEDAGER = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag']

export default function TidspunktTab({ loaderData }: Route.ComponentProps) {
  const data = loaderData
  const [searchParams] = useSearchParams()
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''

  const totalBehandlinger = data.datapunkter.reduce((sum, d) => sum + d.antall, 0)
  const totalFeilet = data.datapunkter.reduce((sum, d) => sum + d.antallFeilet, 0)
  const totalBatch = data.datapunkter.reduce((sum, d) => sum + d.antallBatch, 0)
  const feilrate = totalBehandlinger > 0 ? `${((totalFeilet / totalBehandlinger) * 100).toFixed(1)}%` : '–'
  const batchAndel = totalBehandlinger > 0 ? `${((totalBatch / totalBehandlinger) * 100).toFixed(1)}%` : '–'

  // Find peak hour
  const peak = data.datapunkter.length > 0 ? [...data.datapunkter].sort((a, b) => b.antall - a.antall)[0] : null
  const peakLabel = peak ? `${UKEDAGER[peak.ukedag - 1]} kl. ${peak.time.toString().padStart(2, '0')}` : '–'

  // Weekday vs weekend
  const hverdager = data.datapunkter.filter((d) => d.ukedag >= 1 && d.ukedag <= 5).reduce((s, d) => s + d.antall, 0)
  const helg = data.datapunkter.filter((d) => d.ukedag >= 6).reduce((s, d) => s + d.antall, 0)

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Tidspunktanalyse viser når behandlinger opprettes fordelt på ukedag og time. Heatmapet gir et overblikk over
        belastningsmønstre — bruk det til å planlegge vedlikehold, batchkjøringer og kapasitetsstyring.
      </BodyShort>

      <HStack gap="space-24" wrap>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {totalBehandlinger.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small">Totalt</BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {feilrate}
          </Heading>
          <BodyShort size="small">Feilrate</BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {batchAndel}
          </Heading>
          <BodyShort size="small">Batch</BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '140px' }}>
          <Heading level="3" size="medium">
            {peakLabel}
          </Heading>
          <BodyShort size="small">Høyeste volum</BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '120px' }}>
          <Heading level="3" size="large">
            {hverdager.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small">Hverdager</BodyShort>
        </VStack>
        <VStack gap="space-4" align="center" style={{ minWidth: '100px' }}>
          <Heading level="3" size="large">
            {helg.toLocaleString('nb-NO')}
          </Heading>
          <BodyShort size="small">Helg</BodyShort>
        </VStack>
      </HStack>

      <VStack gap="space-8">
        <Heading level="3" size="small">
          Behandlingsvolum per ukedag og time
        </Heading>
        <BodyShort size="small" textColor="subtle">
          Fargene viser relativt volum — mørkere farge betyr flere behandlinger. Hold musepekeren over en rute for
          nøyaktig antall.
        </BodyShort>
        <TidspunktHeatmap data={data.datapunkter} />
      </VStack>

      <HStack justify="end">
        <LastNedTabData data={data.datapunkter} filnavn={`tidspunkt-${behandlingType}-${fom}-${tom}`} />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="tidspunktdata" />
}
