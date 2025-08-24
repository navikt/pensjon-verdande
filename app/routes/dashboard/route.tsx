import { ActionFunctionArgs, Await, useLoaderData } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger, getDashboardSummary, hentKalenderHendelser } from '~/services/behandling.server'
import { Box, HGrid, Skeleton, VStack } from '@navikt/ds-react'
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

  let { searchParams } = new URL(request.url)

  const dato = searchParams.get('dato')

  let startDato = dato ? new Date(dato) : new Date()

  let { forsteDato, sisteDato } = forsteOgSisteDatoForKalender(startDato)

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
      <VStack gap="2">
        <HGrid gap="2" columns={4}>
          <Skeleton variant="rounded" width="100%" height={70} />
          <Skeleton variant="rounded" width="100%" height={70} />
          <Skeleton variant="rounded" width="100%" height={70} />
          <Skeleton variant="rounded" width="100%" height={70} />
        </HGrid>
        <HGrid gap="2" style={{ paddingTop: '12px' }} columns={2}>
          <VStack gap="2">
            <Skeleton variant="rounded" width="100%" height={550} />
            <Skeleton variant="rounded" width="100%" height={550} />
          </VStack>
          <VStack gap="2">
            <Skeleton variant="rounded" width="100%" height={1024} />
          </VStack>
        </HGrid>
      </VStack>
    }>
      <Await resolve={loadingDashboardResponse}>
        {(dashboardResponse) => {
          if (!dashboardResponse) return (<></>)
          return (
            <VStack gap="2">
            <HGrid gap="2" columns={4}>
              <DashboardCard
                iconBackgroundColor={'var(--a-green-400)'}
                title="Totalt"
                value={formatNumber(dashboardResponse.totaltAntallBehandlinger)}
                icon={ClipboardFillIcon}
              />
              <DashboardCard
                iconBackgroundColor={'var(--a-surface-action)'}
                title="Under behandling"
                value={formatNumber(dashboardResponse.antallUferdigeBehandlinger)}
                icon={CogFillIcon}
              />
              <DashboardCard
                iconBackgroundColor={'var(--a-surface-danger)'}
                title="Feilende"
                value={formatNumber(dashboardResponse.feilendeBehandlinger)}
                icon={ExclamationmarkTriangleFillIcon}
              />
              <DashboardCard
                iconBackgroundColor={'var(--a-surface-warning)'}
                title="Ukjente typer"
                value={formatNumber(dashboardResponse.ukjenteBehandlingstyper.length)}
                icon={QuestionmarkDiamondFillIcon}
              />
            </HGrid>

            <HGrid gap="2" columns={2}>
              <VStack gap="2">
                <BehandlingerPerDagLineChartCard
                  opprettetPerDag={dashboardResponse.opprettetPerDag}
                />
                <Box
                  background={'surface-default'}
                  borderRadius="medium"
                  shadow="medium"
                  style={{
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    width: '100%',
                  }}
                >
                  <Kalender
                    kalenderHendelser={kalenderHendelser}
                    maksAntallPerDag={6}
                    startDato={startDato}
                    visKlokkeSlett={false}
                  ></Kalender>
                </Box>
              </VStack>
              <VStack gap="2">
                <BehandlingAntallTableCard
                  behandlingAntall={dashboardResponse.behandlingAntall}
                />
              </VStack>
            </HGrid>
            </VStack>)
        }
        }
      </Await>
    </React.Suspense>
  )
}
