import type { Meta, StoryObj } from '@storybook/react'
import { mockBehandlingDto, mockBehandlingerPage } from '../../../.storybook/mocks/data'
import { withRouter } from '../../../.storybook/mocks/router'
import BehandlingerTable from './BehandlingerTable'

const meta = {
  title: 'Komponenter/BehandlingerTable',
  component: BehandlingerTable,
  decorators: [withRouter],
} satisfies Meta<typeof BehandlingerTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    behandlingerResponse: mockBehandlingerPage([
      mockBehandlingDto({ behandlingId: 100001, type: 'ForstegangsbehandlingAlder', status: 'UNDER_BEHANDLING' }),
      mockBehandlingDto({ behandlingId: 100002, type: 'Omregning', status: 'FULLFORT', ferdig: '2024-06-15T12:00:00' }),
      mockBehandlingDto({
        behandlingId: 100003,
        type: 'Regulering',
        status: 'FEILENDE',
        feilmelding: 'Feil ved henting av grunnlag',
      }),
    ]),
  },
}

export const UtenFortsettKnapp: Story = {
  args: {
    behandlingerResponse: mockBehandlingerPage([mockBehandlingDto({ behandlingId: 100001, status: 'FULLFORT' })]),
    inkluderFortsett: false,
  },
}

export const Tom: Story = {
  args: {
    behandlingerResponse: mockBehandlingerPage([]),
  },
}
