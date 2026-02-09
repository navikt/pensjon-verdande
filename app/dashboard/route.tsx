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
import Kalender, { forsteOgSisteDatoForKalender } from '~/components/kalender/Kalender'
import { getDashboardSummary, hentKalenderHendelser } from '~/services/behandling.server'
import type { Route } from './+types/route'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const dashboardResponse = getDashboardSummary(request)
  if (!dashboardResponse) {
    throw new Response('Not Found', { status: 404 })
  }

  const { searchParams } = new URL(request.url)

  const dato = searchParams.get('dato')

  const startDato = dato ? new Date(dato) : new Date()

  const { forsteDato, sisteDato } = forsteOgSisteDatoForKalender(startDato)

  return {
    loadingDashboardResponse: dashboardResponse,
    kalenderHendelser: await hentKalenderHendelser(request, {
      fom: forsteDato,
      tom: sisteDato,
    }),
    startDato: startDato,
  }
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { kalenderHendelser, loadingDashboardResponse, startDato } = loaderData

  return (
    <React.Suspense
      fallback={
        <VStack gap="6">
          <HGrid gap="6" columns={4}>
            <Skeleton variant="rounded" width="100%" height={70} />
            <Skeleton variant="rounded" width="100%" height={70} />
            <Skeleton variant="rounded" width="100%" height={70} />
            <Skeleton variant="rounded" width="100%" height={70} />
          </HGrid>
          <HGrid gap="6" style={{ paddingTop: '12px' }} columns={2}>
            <VStack gap="6">
              <Skeleton variant="rounded" width="100%" height={550} />
              <Skeleton variant="rounded" width="100%" height={550} />
            </VStack>
            <VStack gap="6">
              <Skeleton variant="rounded" width="100%" height={1024} />
            </VStack>
          </HGrid>
        </VStack>
      }
    >
      <Await resolve={loadingDashboardResponse}>
        {(dashboardResponse) => {
          return (
            dashboardResponse && (
              <VStack gap="6">
                <HGrid gap="6" columns={4}>
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

                <HGrid gap="6" columns={2}>
                  <VStack gap="6">
                    <BehandlingerPerDagLineChartCard opprettetPerDag={dashboardResponse.opprettetPerDag} />
                    <Kalender
                      kalenderHendelser={kalenderHendelser}
                      maksAntallPerDag={6}
                      startDato={startDato}
                      visKlokkeSlett={false}
                    ></Kalender>
                  </VStack>
                  <VStack gap="6">
                    <BehandlingAntallTableCard behandlingAntall={dashboardResponse.behandlingAntall} />
                  </VStack>
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
  console.log({ error })
  if (error instanceof Error && error.message === 'Server Timeout') {
    return (
      <Box.New style={{ paddingTop: '0.5em' }}>
        <Heading size={'medium'}>Tidsavbrudd</Heading>
        <BodyShort>Det tok for lang tid å laste dataene til dashboardet. Prøv igjen senere</BodyShort>
      </Box.New>
    )
  } else {
    return (
      <Box.New style={{ paddingTop: '0.5em' }}>
        <Heading size={'medium'}>Feil ved lasting av data</Heading>
        <BodyShort>Feil ved lasting av dataene til dashboardet. Prøv igjen senere</BodyShort>
      </Box.New>
    )
  }
}
