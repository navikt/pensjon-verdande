import { ActionFunctionArgs, Await } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger, getDashboardSummary } from '~/services/behandling.server'
import { useLoaderData } from 'react-router'
import { Box, HGrid, HStack, Skeleton, VStack } from '@navikt/ds-react'
import {
  ClipboardFillIcon,
  CogFillIcon,
  ExclamationmarkTriangleFillIcon,
  XMarkOctagonFillIcon,
} from '@navikt/aksel-icons'
import { formatNumber } from '~/common/number'
import { DashboardCard } from '~/components/dashboard-card/DashboardCard'
import { BehandlingAntallTableCard } from '~/components/behandling-antall-table/BehandlingAntallTableCard'
import {
  BehandlingerPerDagLineChartCard,
} from '~/components/behandlinger-per-dag-linechart/BehandlingerPerDagLineChartCard'
import React from 'react'
import Kalender from '~/components/kalender/Kalender'
import { BehandlingerPage } from '~/types'
import { PlanlagtOppgave } from '~/components/kalender/types'
import { decodeBehandling } from '~/common/decodeBehandling'

export const loader = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const dashboardResponse = getDashboardSummary(accessToken)
  if (!dashboardResponse) {
    throw new Response('Not Found', { status: 404 })
  }

  // TODO: Quick and dirty hack for å hente batch-behandlinger for en måned (antar at det er mindre enn 100 i prod for en måned), uten å legge til et api i pen
  // Erstatt med et eget endepunkt i pen som henter batch-behandlinger for en måned
  const behandlinger: BehandlingerPage = await getBehandlinger(
    accessToken,
    null,
    null,
    null,
    null,
    true,
    0,
    100,
    'opprettet,desc'
  )

  function behandlingerAsOppgaver(): PlanlagtOppgave[] {
    return behandlinger.content.map(behandling => ({
      tidspunkt: new Date(behandling.opprettet),
      type: decodeBehandling(behandling.type),
      kjoremonster: "Automatisk",
    }))
  }


  return {
    loadingDashboardResponse: dashboardResponse,
    planlagteOppgaver: behandlingerAsOppgaver()
  }
}

export default function Dashboard() {
  const { loadingDashboardResponse, planlagteOppgaver } = useLoaderData<typeof loader>()

  return (
    <React.Suspense fallback={
      <div>
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
      </div>
    }>
      <Await resolve={loadingDashboardResponse}>
        {(dashboardResponse) => {
          if (!dashboardResponse) return (<></>)
          return (<div>
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
                iconBackgroundColor={'var(--a-surface-warning)'}
                title="Feilende"
                value={formatNumber(dashboardResponse.feilendeBehandlinger)}
                icon={ExclamationmarkTriangleFillIcon}
              />
              <DashboardCard
                iconBackgroundColor={'var(--a-surface-danger)'}
                title="Ukjente typer"
                value={formatNumber(dashboardResponse.ukjenteBehandlingstyper.length)}
                icon={XMarkOctagonFillIcon}
              />
            </HGrid>

            <HGrid gap="2" style={{ paddingTop: '12px' }} columns={2}>
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
                <Kalender planlagteOppgaver={planlagteOppgaver} visKlokkeslett={false}></Kalender>
                </Box>
              </VStack>
              <VStack gap="2">
                <BehandlingAntallTableCard
                  behandlingAntall={dashboardResponse.behandlingAntall}
                />
              </VStack>
            </HGrid>
          </div>)
        }
        }
      </Await>
    </React.Suspense>
  )
}
