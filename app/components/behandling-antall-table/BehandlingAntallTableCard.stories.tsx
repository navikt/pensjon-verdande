import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from '../../../.storybook/mocks/router'
import { BehandlingAntallTableCard } from './BehandlingAntallTableCard'

const meta = {
  title: 'Komponenter/BehandlingAntallTableCard',
  component: BehandlingAntallTableCard,
  decorators: [withRouter],
} satisfies Meta<typeof BehandlingAntallTableCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    behandlingAntall: [
      { navn: 'Førstegangsbehandling Alder', behandlingType: 'ForstegangsbehandlingAlder', antall: 42 },
      { navn: 'Omregning', behandlingType: 'Omregning', antall: 128 },
      { navn: 'Regulering', behandlingType: 'Regulering', antall: 15 },
    ],
  },
}
