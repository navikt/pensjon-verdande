import type { ActionFunctionArgs } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import { getDashboardSummary } from '~/services/behandling.server'
import { useLoaderData } from 'react-router';
import { HGrid } from '@navikt/ds-react'
import {
  ClipboardFillIcon,
  CogFillIcon,
  ExclamationmarkTriangleFillIcon,
  XMarkOctagonFillIcon,
} from '@navikt/aksel-icons'
import { formatNumber } from '~/common/number'
import { DashboardCard } from '~/components/dashboard-card/DashboardCard'
import { BehandlingAntallTableCard } from '~/components/behandling-antall-table/BehandlingAntallTableCard'
import { BehandlingerPerDagLineChartCard } from '~/components/behandlinger-per-dag-linechart/BehandlingerPerDagLineChartCard'

export const loader = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const dashboardResponse = await getDashboardSummary(accessToken)
  if (!dashboardResponse) {
    throw new Response('Not Found', { status: 404 })
  }

  return { dashboardResponse: dashboardResponse }
}

export default function Dashboard() {
  const { dashboardResponse } = useLoaderData<typeof loader>()

  return (
    <div>
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
    </div>
  )
}
