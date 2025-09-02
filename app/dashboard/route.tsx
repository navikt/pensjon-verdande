import { type ActionFunctionArgs, Await, useLoaderData } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { getDashboardSummary, hentKalenderHendelser } from '~/services/behandling.server'
import { HGrid, Skeleton, VStack } from '@navikt/ds-react'
import {
  ClipboardFillIcon,
  CogFillIcon,
  ExclamationmarkTriangleFillIcon,
  QuestionmarkDiamondFillIcon,
} from '@navikt/aksel-icons'
import { formatNumber } from '~/common/number'
import { DashboardCard } from '~/components/dashboard-card/DashboardCard'
import { BehandlingAntallTableCard } from '~/components/behandling-antall-table/BehandlingAntallTableCard'
import {
  BehandlingerPerDagLineChartCard,
} from '~/components/behandlinger-per-dag-linechart/BehandlingerPerDagLineChartCard'
import React from 'react'
import Kalender, { forsteOgSisteDatoForKalender } from '~/components/kalender/Kalender'

export const loader = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const dashboardResponse = getDashboardSummary(accessToken)
  if (!dashboardResponse) {
    throw new Response('Not Found', { status: 404 })
  }

  const { searchParams } = new URL(request.url)

  const dato = searchParams.get('dato')

  const startDato = dato ? new Date(dato) : new Date()

  const { forsteDato, sisteDato } = forsteOgSisteDatoForKalender(startDato)

  return {
    loadingDashboardResponse: dashboardResponse,
    kalenderHendelser: await hentKalenderHendelser({accessToken: accessToken}, {
      fom: forsteDato,
      tom: sisteDato,
    }),
    startDato: startDato,
  }
}

export default function Dashboard() {
  const { kalenderHendelser, loadingDashboardResponse, startDato } = useLoaderData<typeof loader>()

  return (
    <React.Suspense fallback={
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
    }>
      <Await resolve={loadingDashboardResponse}>
        {(dashboardResponse) => {
          return dashboardResponse && (
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
                <BehandlingerPerDagLineChartCard
                  opprettetPerDag={dashboardResponse.opprettetPerDag}
                />
                <Kalender
                    kalenderHendelser={kalenderHendelser}
                    maksAntallPerDag={6}
                    startDato={startDato}
                    visKlokkeSlett={false}></Kalender>
              </VStack>
              <VStack gap="6">
                <BehandlingAntallTableCard
                  behandlingAntall={dashboardResponse.behandlingAntall}
                />
              </VStack>
            </HGrid>
            </VStack>
          )
        }}
      </Await>
    </React.Suspense>
  )
}
