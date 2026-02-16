import type { Meta, StoryObj } from '@storybook/react'
import { mockBehandlingDto, mockBehandlingerPage } from '../../../../.storybook/mocks/data'
import { withRouter } from '../../../../.storybook/mocks/router'
import AvhengigeBehandlingerElement from './AvhengigeBehandlingerElement'

const meta = {
  title: 'Komponenter/AvhengigeBehandlingerElement',
  component: AvhengigeBehandlingerElement,
  decorators: [withRouter],
} satisfies Meta<typeof AvhengigeBehandlingerElement>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    avhengigeBehandlinger: mockBehandlingerPage([
      mockBehandlingDto({ behandlingId: 200001, type: 'Omregning', status: 'FULLFORT' }),
      mockBehandlingDto({ behandlingId: 200002, type: 'Regulering', status: 'UNDER_BEHANDLING' }),
    ]),
  },
}

export const Ingen: Story = {
  args: {
    avhengigeBehandlinger: mockBehandlingerPage([]),
  },
}
