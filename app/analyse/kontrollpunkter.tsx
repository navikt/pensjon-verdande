import { BodyShort, HStack, InlineMessage, VStack } from '@navikt/ds-react'
import { useSearchParams } from 'react-router'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { toNormalizedError } from '~/common/error'
import { apiGet } from '~/services/api.server'
import { logger } from '~/services/logger.server'
import type { Route } from './+types/kontrollpunkter'
import KontrollpunktAnalyse from './components/KontrollpunktAnalyse'
import LastNedTabData from './components/LastNedTabData'
import type { KontrollpunktAnalyseResponse, KontrollpunktTidsserieResponse } from './types'
import { parseAnalyseParams } from './utils/parseAnalyseParams'

export async function loader({ request }: Route.LoaderArgs) {
  const { params, paramsAgg } = parseAnalyseParams(request)

  const [kontrollpunktResult, tidsserieResult] = await Promise.allSettled([
    apiGet<KontrollpunktAnalyseResponse>(`/api/behandling/analyse/kontrollpunkter?${params}`, request),
    apiGet<KontrollpunktTidsserieResponse>(`/api/behandling/analyse/kontrollpunkter/tidsserie?${paramsAgg}`, request),
  ])

  if (kontrollpunktResult.status === 'rejected') {
    const normalized = toNormalizedError(kontrollpunktResult.reason)
    logger.warn(`Kontrollpunkter feilet: ${normalized?.status} – ${normalized?.message}`)
    throw kontrollpunktResult.reason
  }

  let tidsserieFeil: string | null = null
  if (tidsserieResult.status === 'rejected') {
    const normalized = toNormalizedError(tidsserieResult.reason)
    tidsserieFeil = `${normalized?.status ?? 'ukjent'} – ${normalized?.message || String(tidsserieResult.reason)}`
    logger.warn(`Kontrollpunkt-tidsserie feilet: ${tidsserieFeil}`)
  }

  return {
    kontrollpunkter: kontrollpunktResult.value.kontrollpunkter,
    kontrollpunktTidsserie: tidsserieResult.status === 'fulfilled' ? tidsserieResult.value.datapunkter : [],
    tidsserieFeil,
  }
}

export default function KontrollpunkterTab({ loaderData }: Route.ComponentProps) {
  const { kontrollpunkter, kontrollpunktTidsserie, tidsserieFeil } = loaderData
  const [searchParams] = useSearchParams()
  const behandlingType = searchParams.get('behandlingType') || 'FleksibelApSak'
  const fom = searchParams.get('fom') || ''
  const tom = searchParams.get('tom') || ''

  return (
    <VStack gap="space-16">
      <BodyShort size="small" textColor="subtle">
        Kontrollpunkter opprettes når en aktivitet identifiserer situasjoner som krever oppmerksomhet. Tabellen viser de
        10 mest forekommende typene, og kakediagrammet viser fordelingen mellom statusene. Filtrer på kravstatus for å
        analysere per kravtype.
      </BodyShort>
      {tidsserieFeil && (
        <InlineMessage status="warning" size="small">
          Kontrollpunkt-tidsserie feilet: {tidsserieFeil}
        </InlineMessage>
      )}
      <KontrollpunktAnalyse data={kontrollpunkter} tidsserie={kontrollpunktTidsserie} />
      <HStack justify="end">
        <LastNedTabData
          data={{ kontrollpunkter, kontrollpunktTidsserie }}
          filnavn={`kontrollpunkter-${behandlingType}-${fom}-${tom}`}
        />
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="kontrollpunktdata" />
}
