import type { Meta, StoryObj } from '@storybook/react'
import type { KalenderHendelser } from '~/components/kalender/types'
import { mockDashboardResponse } from '../../.storybook/mocks/data'
import { renderWithLoader } from '../../.storybook/mocks/router'
import Dashboard from './route'

const mockKalenderHendelser: KalenderHendelser = {
  offentligeFridager: [{ dato: '2024-06-17', navn: 'Pinsedag' }],
  kalenderBehandlinger: [
    { behandlingId: 100001, type: 'ForstegangsbehandlingAlder', kjoreDato: '2024-06-15T09:00:00' },
    { behandlingId: 100002, type: 'Omregning', kjoreDato: '2024-06-16T10:00:00' },
    { behandlingId: 100003, type: 'Regulering', kjoreDato: '2024-06-18T08:00:00' },
  ],
}

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
      kalenderHendelser: mockKalenderHendelser,
      startDato: new Date('2024-06-15'),
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
      kalenderHendelser: { offentligeFridager: [], kalenderBehandlinger: [] },
      startDato: new Date('2024-06-15'),
    }),
}
