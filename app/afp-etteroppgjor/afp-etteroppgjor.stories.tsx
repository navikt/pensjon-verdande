import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import EtteroppgjorOversikt from './afp-etteroppgjor'

const meta: Meta = {
  title: 'Sider/AFP etteroppgjør',
  component: EtteroppgjorOversikt,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () =>
    renderWithLoader(EtteroppgjorOversikt, {
      etteroppgjor: [
        {
          behandlingId: 1001,
          kjorear: 2024,
          opprettet: '2024-06-01T08:00:00',
          sisteKjoring: '2024-06-01T10:00:00',
          status: 'FULLFORT',
          ferdig: '2024-06-01T12:00:00',
        },
        {
          behandlingId: 1002,
          kjorear: 2023,
          opprettet: '2023-06-01T08:00:00',
          status: 'UNDER_BEHANDLING',
        },
      ],
    }),
}

export const Empty: Story = {
  render: () =>
    renderWithLoader(EtteroppgjorOversikt, {
      etteroppgjor: [],
    }),
}
