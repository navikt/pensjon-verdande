import type { Meta, StoryObj } from '@storybook/react'
import { mockBehandlingDto, mockBehandlingerPage } from '../../.storybook/mocks/data'
import { renderWithLoader } from '../../.storybook/mocks/router'
import BehandlingerStatus from './behandlinger.$status'

const meta: Meta = {
  title: 'Sider/Behandlinger/Etter status',
  component: BehandlingerStatus,
}

export default meta
type Story = StoryObj

export const UnderBehandling: Story = {
  render: () =>
    renderWithLoader(BehandlingerStatus, {
      behandlinger: mockBehandlingerPage([
        mockBehandlingDto({ behandlingId: 100001, status: 'UNDER_BEHANDLING', type: 'ForstegangsbehandlingAlder' }),
        mockBehandlingDto({ behandlingId: 100002, status: 'UNDER_BEHANDLING', type: 'Omregning' }),
      ]),
    }),
}

export const Empty: Story = {
  render: () =>
    renderWithLoader(BehandlingerStatus, {
      behandlinger: mockBehandlingerPage([], { empty: true }),
    }),
}
