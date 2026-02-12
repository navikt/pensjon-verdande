import type { Meta, StoryObj } from '@storybook/react'
import { mockBehandlingDto, mockBehandlingerPage } from '../../.storybook/mocks/data'
import { renderWithLoader } from '../../.storybook/mocks/router'
import BehandlingerStatus from './batcher'

const meta: Meta = {
  title: 'Sider/Batcher',
  component: BehandlingerStatus,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () =>
    renderWithLoader(BehandlingerStatus, {
      behandlinger: mockBehandlingerPage([
        mockBehandlingDto({
          behandlingId: 200001,
          type: 'Regulering',
          status: 'UNDER_BEHANDLING',
          opprettetAv: 'BATCH',
        }),
        mockBehandlingDto({
          behandlingId: 200002,
          type: 'Omregning',
          status: 'FULLFORT',
          opprettetAv: 'BATCH',
          ferdig: '2024-06-15T14:00:00',
        }),
      ]),
    }),
}

export const Empty: Story = {
  render: () =>
    renderWithLoader(BehandlingerStatus, {
      behandlinger: mockBehandlingerPage([], { empty: true }),
    }),
}
