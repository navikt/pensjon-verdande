import type { Meta, StoryObj } from '@storybook/react'
import { mockBehandlingDto, mockBehandlingerPage } from '../../.storybook/mocks/data'
import { renderWithLoader } from '../../.storybook/mocks/router'
import Sok from './sok'

const meta: Meta = {
  title: 'Sider/Søk',
  component: Sok,
}

export default meta
type Story = StoryObj

export const WithResults: Story = {
  render: () =>
    renderWithLoader(Sok, {
      behandlinger: mockBehandlingerPage([
        mockBehandlingDto({ behandlingId: 100001, fnr: '12345678901', type: 'ForstegangsbehandlingAlder' }),
        mockBehandlingDto({ behandlingId: 100002, fnr: '12345678901', type: 'Omregning', status: 'FULLFORT' }),
      ]),
    }),
}

export const NoResults: Story = {
  render: () =>
    renderWithLoader(Sok, {
      behandlinger: null,
    }),
}
