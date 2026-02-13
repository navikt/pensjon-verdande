import type { Meta, StoryObj } from '@storybook/react'
import { mockBehandlingDto, mockBehandlingerPage } from '../../.storybook/mocks/data'
import { renderWithLoader } from '../../.storybook/mocks/router'
import AvhengigeBehandlinger from './behandlinger._index'

const meta: Meta = {
  title: 'Sider/Behandlinger',
  component: AvhengigeBehandlinger,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () =>
    renderWithLoader(AvhengigeBehandlinger, {
      behandlinger: mockBehandlingerPage([
        mockBehandlingDto({ behandlingId: 100001, type: 'ForstegangsbehandlingAlder', status: 'UNDER_BEHANDLING' }),
        mockBehandlingDto({
          behandlingId: 100002,
          type: 'Omregning',
          status: 'FULLFORT',
          ferdig: '2024-06-15T12:00:00',
        }),
        mockBehandlingDto({
          behandlingId: 100003,
          type: 'Regulering',
          status: 'STOPPET',
          stoppet: '2024-06-14T08:00:00',
        }),
      ]),
    }),
}

export const Empty: Story = {
  render: () =>
    renderWithLoader(AvhengigeBehandlinger, {
      behandlinger: mockBehandlingerPage([], { empty: true }),
    }),
}
