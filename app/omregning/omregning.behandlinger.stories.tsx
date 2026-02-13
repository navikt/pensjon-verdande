import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import BehandlingerStatus from './omregning.behandlinger'

const mockBehandlinger = {
  content: [],
  pageable: 'INSTANCE',
  totalPages: 0,
  totalElements: 0,
  last: true,
  first: true,
  numberOfElements: 0,
  number: 0,
  size: 5,
  empty: true,
  behandlingStatuser: ['OPPRETTET', 'UNDER_BEHANDLING', 'FULLFORT'],
  behandlingTyper: ['OmregningBehandling'],
  sort: { unsorted: true, sorted: false, empty: true },
}

const meta: Meta = {
  title: 'Sider/Omregning/Behandlinger',
  component: BehandlingerStatus,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () =>
    renderWithLoader(BehandlingerStatus, {
      behandlinger: mockBehandlinger,
    }),
}
