import { BodyShort, Box, Heading, HStack, InlineMessage, VStack } from '@navikt/ds-react'
import { AnalyseErrorAlert } from '~/analyse/utils/AnalyseErrorAlert'
import { toNormalizedError } from '~/common/error'
import { apiGet } from '~/services/api.server'
import { logger } from '~/services/logger.server'
import type { Route } from './+types/nokkeltall'
import type { BehandlingOppsummeringResponse } from './types'
import { formaterTall, formaterVarighet } from './utils/formattering'
import { parseAnalyseParams } from './utils/parseAnalyseParams'

export async function loader({ request }: Route.LoaderArgs) {
  const { params } = parseAnalyseParams(request)

  let oppsummering: BehandlingOppsummeringResponse | null = null
  let oppsummeringFeil: string | null = null

  try {
    oppsummering = await apiGet<BehandlingOppsummeringResponse>(
      `/api/behandling/analyse/oppsummering?${params}`,
      request,
    )
  } catch (e) {
    const normalized = toNormalizedError(e)
    oppsummeringFeil = `${normalized?.status ?? 'ukjent'} – ${normalized?.message || String(e)}`
    logger.warn(`Analyse oppsummering feilet: ${oppsummeringFeil}`)
  }

  return { oppsummering, oppsummeringFeil }
}

const kpiKortConfig = [
  { key: 'totalt', label: 'Totalt', color: 'var(--ax-border-neutral)' },
  { key: 'fullfort', label: 'Fullført', color: 'var(--ax-border-success)' },
  { key: 'feilet', label: 'Feilet', color: 'var(--ax-border-warning)' },
  { key: 'varighet', label: 'Snitt varighet', color: 'var(--ax-border-info)' },
] as const

export default function Nokkeltall({ loaderData }: Route.ComponentProps) {
  const { oppsummering, oppsummeringFeil } = loaderData

  function kpiValue(key: string): string {
    if (!oppsummering) return '–'
    switch (key) {
      case 'totalt':
        return formaterTall(oppsummering.totaltAntall)
      case 'fullfort':
        return formaterTall(oppsummering.statusFordeling?.FULLFORT)
      case 'feilet':
        return formaterTall(oppsummering.statusFordeling?.FEILET)
      case 'varighet':
        return formaterVarighet(oppsummering.varighet?.gjennomsnittSekunder)
      default:
        return '–'
    }
  }

  return (
    <VStack gap="space-16">
      {oppsummeringFeil && (
        <InlineMessage status="warning" size="small">
          <BodyShort size="small">Oppsummering feilet: {oppsummeringFeil}</BodyShort>
        </InlineMessage>
      )}

      <BodyShort size="small" textColor="subtle">
        Aggregerte tall for valgt tidsrom. Totalt antall opprettede behandlinger, antall fullførte, antall feilende og
        gjennomsnittlig behandlingstid.
      </BodyShort>

      <HStack gap="space-16" wrap>
        {kpiKortConfig.map(({ key, label, color }) => (
          <Box
            key={key}
            borderWidth="2"
            padding="space-16"
            borderRadius="4"
            style={{ borderColor: color, minWidth: '140px' }}
          >
            <VStack gap="space-8">
              <BodyShort size="small" weight="semibold">
                {label}
              </BodyShort>
              <Heading level="3" size="large">
                {kpiValue(key)}
              </Heading>
            </VStack>
          </Box>
        ))}
      </HStack>
    </VStack>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AnalyseErrorAlert error={error} label="nøkkeltall" />
}
