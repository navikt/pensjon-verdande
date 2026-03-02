import {
  ClipboardFillIcon,
  CogFillIcon,
  ExclamationmarkTriangleFillIcon,
  QuestionmarkDiamondFillIcon,
} from '@navikt/aksel-icons'
import { BodyShort, Box, Heading, HGrid, Skeleton, VStack } from '@navikt/ds-react'
import React from 'react'
import { Await } from 'react-router'
import { formatNumber } from '~/common/number'
import { BehandlingAntallTableCard } from '~/components/behandling-antall-table/BehandlingAntallTableCard'
import { BehandlingerPerDagLineChartCard } from '~/components/behandlinger-per-dag-linechart/BehandlingerPerDagLineChartCard'
import { DashboardCard } from '~/components/dashboard-card/DashboardCard'
import { getDashboardSummary } from '~/services/dashboard.server'
import type { Route } from './+types/route'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Dashboard | Verdande' }]
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  return {
    loadingDashboardResponse: getDashboardSummary(request),
  }
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { loadingDashboardResponse } = loaderData

  return (
    <React.Suspense
      fallback={
        <VStack gap="space-24">
          <HGrid gap="space-24" columns={4}>
            <Skeleton variant="rounded" width="100%" height={70} />
            <Skeleton variant="rounded" width="100%" height={70} />
            <Skeleton variant="rounded" width="100%" height={70} />
            <Skeleton variant="rounded" width="100%" height={70} />
          </HGrid>
          <HGrid gap="space-24" style={{ paddingTop: '12px' }} columns={2}>
            <Skeleton variant="rounded" width="100%" height={550} />
            <Skeleton variant="rounded" width="100%" height={1024} />
          </HGrid>
        </VStack>
      }
    >
      <Await resolve={loadingDashboardResponse}>
        {(dashboardResponse) => {
          return (
            dashboardResponse && (
              <VStack gap="space-24">
                <HGrid gap="space-24" columns={4}>
                  <DashboardCard
                    iconBackgroundColor={'var(--ax-bg-success-strong)'}
                    title="Totalt"
                    value={formatNumber(dashboardResponse.totaltAntallBehandlinger)}
                    icon={ClipboardFillIcon}
                  />
                  <DashboardCard
                    iconBackgroundColor={'var(--ax-bg-accent-strong)'}
                    title="Under behandling"
                    value={formatNumber(dashboardResponse.antallUferdigeBehandlinger)}
                    icon={CogFillIcon}
                  />
                  <DashboardCard
                    iconBackgroundColor={'var(--ax-bg-danger-strong)'}
                    title="Feilende"
                    value={formatNumber(dashboardResponse.feilendeBehandlinger)}
                    icon={ExclamationmarkTriangleFillIcon}
                  />
                  <DashboardCard
                    iconBackgroundColor={'var(--ax-bg-warning-strong)'}
                    title="Ukjente typer"
                    value={formatNumber(dashboardResponse.ukjenteBehandlingstyper.length)}
                    icon={QuestionmarkDiamondFillIcon}
                  />
                </HGrid>
                <HGrid gap="space-24" columns={2}>
                  <BehandlingerPerDagLineChartCard opprettetPerDag={dashboardResponse.opprettetPerDag} />
                  <BehandlingAntallTableCard behandlingAntall={dashboardResponse.behandlingAntall} />
                </HGrid>
              </VStack>
            )
          )
        }}
      </Await>
    </React.Suspense>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (error instanceof Error && error.message === 'Server Timeout') {
    return (
      <Box style={{ paddingTop: '0.5em' }}>
        <Heading size={'medium'}>Tidsavbrudd</Heading>
        <BodyShort>Det tok for lang tid å laste dataene til dashboardet. Prøv igjen senere</BodyShort>
      </Box>
    )
  } else {
    return (
      <Box style={{ paddingTop: '0.5em' }}>
        <Heading size={'medium'}>Feil ved lasting av data</Heading>
        <BodyShort>Feil ved lasting av dataene til dashboardet. Prøv igjen senere</BodyShort>
      </Box>
    )
  }
}
