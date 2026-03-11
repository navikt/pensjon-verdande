import type { Meta, StoryObj } from '@storybook/react'
import type { BehandlingAntall } from '~/types'
import { mockDashboardResponse } from '../../.storybook/mocks/data'
import { renderWithLoader } from '../../.storybook/mocks/router'
import Dashboard from './route'

const meta: Meta = {
  title: 'Sider/Dashboard',
  component: Dashboard,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () =>
    renderWithLoader(Dashboard, {
      loadingDashboardResponse: mockDashboardResponse(),
    }),
}

export const Empty: Story = {
  render: () =>
    renderWithLoader(Dashboard, {
      loadingDashboardResponse: mockDashboardResponse({
        totaltAntallBehandlinger: 0,
        feilendeBehandlinger: 0,
        antallUferdigeBehandlinger: 0,
        behandlingAntall: [],
        opprettetPerDag: [],
        ukjenteBehandlingstyper: [],
      }),
    }),
}

const mangeBehandlingstyper: BehandlingAntall[] = Array.from({ length: 15 }, (_, i) => ({
  navn: `Behandlingstype ${i + 1}`,
  behandlingType: `Type${i + 1}`,
  antall: 100 - i * 5,
}))

export const MedVisAlleKnapp: Story = {
  render: () =>
    renderWithLoader(Dashboard, {
      loadingDashboardResponse: mockDashboardResponse({
        behandlingAntall: mangeBehandlingstyper,
      }),
    }),
}
