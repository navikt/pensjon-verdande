import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from '../../../.storybook/mocks/router'
import BehandlingAntallTable from './BehandlingAntallTable'

const meta = {
  title: 'Komponenter/BehandlingAntallTable',
  component: BehandlingAntallTable,
  decorators: [withRouter],
} satisfies Meta<typeof BehandlingAntallTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    oppsummering: [
      { navn: 'Førstegangsbehandling Alder', behandlingType: 'ForstegangsbehandlingAlder', antall: 42 },
      { navn: 'Omregning', behandlingType: 'Omregning', antall: 128 },
      { navn: 'Regulering', behandlingType: 'Regulering', antall: 15 },
    ],
  },
}

export const MedUkjentType: Story = {
  args: {
    oppsummering: [
      { navn: 'Førstegangsbehandling Alder', behandlingType: 'ForstegangsbehandlingAlder', antall: 42 },
      { navn: 'GammelType', behandlingType: null, antall: 5 },
    ],
  },
}
