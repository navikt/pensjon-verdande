import { ActionFunctionArgs, Await } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { getDashboardSummary } from '~/services/behandling.server'
import { useLoaderData } from 'react-router'
import { HGrid, Skeleton } from '@navikt/ds-react'
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
import { da } from 'date-fns/locale'

export const loader = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const dashboardResponse = getDashboardSummary(accessToken)
  if (!dashboardResponse) {
    throw new Response('Not Found', { status: 404 })
  }

  return { loadingDashboardResponse: dashboardResponse }
}

export default function Dashboard() {
  const { loadingDashboardResponse } = useLoaderData<typeof loader>()

  return (
    <React.Suspense fallback={
      <div>
        <HGrid gap="2" columns={4}>
          <Skeleton variant="rounded" width="100%" height={70} />
          <Skeleton variant="rounded" width="100%" height={70} />
          <Skeleton variant="rounded" width="100%" height={70} />
          <Skeleton variant="rounded" width="100%" height={70} />
        </HGrid>
        <div className={'flex-grid'} style={{ paddingTop: '12px' }}>
          <div className={'col'}>
            <Skeleton variant="rounded" width="100%" height={329} />
          </div>
          <div className={'col'}>
            <Skeleton variant="rounded" width="100%" height={1024} />
          </div>
        </div>
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
            <div className={'flex-grid'} style={{ paddingTop: '12px' }}>
              <div className={'col'}>
                <BehandlingerPerDagLineChartCard
                  opprettetPerDag={dashboardResponse.opprettetPerDag}
                />
              </div>
              <div className={'col'}>
                <BehandlingAntallTableCard
                  behandlingAntall={dashboardResponse.behandlingAntall}
                />
              </div>
            </div>
          </div>)
        }
        }
      </Await>
    </React.Suspense>
  )
}
