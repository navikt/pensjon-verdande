import {
  ClipboardFillIcon,
  CogFillIcon,
  ExclamationmarkTriangleFillIcon,
  QuestionmarkDiamondFillIcon,
} from '@navikt/aksel-icons'
import { BodyShort, Box, Heading, HGrid, Skeleton, VStack } from '@navikt/ds-react'
import React from 'react'
import { Await } from 'react-router'
import type { BrevTidsserieResponse, TidsserieResponse } from '~/analyse/types'
import { formatNumber } from '~/common/number'
import { AktivitetChartCard } from '~/components/aktivitet-chart/AktivitetChartCard'
import { BrevChartCard } from '~/components/brev-chart/BrevChartCard'
import { formatLocalIso } from '~/components/chart-utils/formatLocalIso'
import { velgAggregering } from '~/components/chart-utils/velgAggregering'
import { DashboardCard } from '~/components/dashboard-card/DashboardCard'
import { apiGet } from '~/services/api.server'
import type {
  AntallUferdigeBehandlingerResponse,
  FeilendeBehandlingerResponse,
  TotaltAntallBehandlingerResponse,
  UkjenteBehandlingstyperResponse,
} from '~/types'
import type { Route } from './+types/route'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Dashboard | Verdande' }]
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const defaultTimer = 24
  const fom = new Date()
  fom.setTime(fom.getTime() - defaultTimer * 60 * 60 * 1000)

  const tidsserieParams = new URLSearchParams({
    fom: formatLocalIso(fom),
    tom: formatLocalIso(new Date()),
    aggregering: velgAggregering(defaultTimer),
  })

  const dashboardResponse = Promise.all([
    apiGet<TotaltAntallBehandlingerResponse>('/api/behandling/oppsummering-totalt-antall-behandlinger', request).then(
      (it) => it.totaltAntallBehandlinger,
    ),
    apiGet<FeilendeBehandlingerResponse>('/api/behandling/oppsummering-feilende-behandlinger', request).then(
      (it) => it.feilendeBehandlinger,
    ),
    apiGet<UkjenteBehandlingstyperResponse>('/api/behandling/oppsummering-ukjente-behandlingstyper', request).then(
      (it) => it.ukjenteBehandlingstyper,
    ),
    apiGet<AntallUferdigeBehandlingerResponse>(
      '/api/behandling/oppsummering-antall-uferdige-behandlinger',
      request,
    ).then((it) => it.antallUferdigeBehandlinger),
    apiGet<TidsserieResponse>(`/api/behandling/analyse/tidsserie?${tidsserieParams}`, request).then(
      (it) => it.datapunkter,
    ),
    apiGet<BrevTidsserieResponse>(`/api/behandling/analyse/brev-tidsserie?${tidsserieParams}`, request).then(
      (it) => it.datapunkter,
    ),
  ]).then((it) => ({
    totaltAntallBehandlinger: it[0],
    feilendeBehandlinger: it[1],
    ukjenteBehandlingstyper: it[2],
    antallUferdigeBehandlinger: it[3],
    aktivitetDatapunkter: it[4],
    brevDatapunkter: it[5],
  }))

  return {
    loadingDashboardResponse: dashboardResponse,
  }
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { loadingDashboardResponse } = loaderData

  return (
    <React.Suspense
      fallback={
        <VStack gap="space-24">
          <HGrid gap="space-24" columns={{ xs: 1, sm: 2, lg: 4 }}>
            <Skeleton variant="rounded" width="100%" height={70} />
            <Skeleton variant="rounded" width="100%" height={70} />
            <Skeleton variant="rounded" width="100%" height={70} />
            <Skeleton variant="rounded" width="100%" height={70} />
          </HGrid>
          <HGrid gap="space-24" style={{ paddingTop: '12px' }} columns={{ xs: 1, md: 2 }}>
            <Skeleton variant="rounded" width="100%" height={550} />
            <Skeleton variant="rounded" width="100%" height={550} />
          </HGrid>
        </VStack>
      }
    >
      <Await resolve={loadingDashboardResponse}>
        {(dashboardResponse) => {
          return (
            dashboardResponse && (
              <VStack gap="space-24">
                <HGrid gap="space-24" columns={{ xs: 1, sm: 2, lg: 4 }}>
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
                <HGrid gap="space-24" columns={{ xs: 1, md: 2 }}>
                  <AktivitetChartCard datapunkter={dashboardResponse.aktivitetDatapunkter} />
                  <BrevChartCard datapunkter={dashboardResponse.brevDatapunkter} />
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
