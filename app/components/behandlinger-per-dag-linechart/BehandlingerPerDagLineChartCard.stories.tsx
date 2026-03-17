import type { Meta, StoryObj } from '@storybook/react'
import type { DatoAntall } from '~/types'
import { withRouter } from '../../../.storybook/mocks/router'
import { BehandlingerPerDagLineChartCard } from './BehandlingerPerDagLineChartCard'

const meta = {
  title: 'Komponenter/BehandlingerPerDagLineChartCard',
  component: BehandlingerPerDagLineChartCard,
  decorators: [withRouter],
} satisfies Meta<typeof BehandlingerPerDagLineChartCard>

export default meta
type Story = StoryObj<typeof meta>

const mockOpprettetPerDag: DatoAntall[] = [
  { dato: '2024-06-10', antall: 12 },
  { dato: '2024-06-11', antall: 18 },
  { dato: '2024-06-12', antall: 9 },
  { dato: '2024-06-13', antall: 25 },
  { dato: '2024-06-14', antall: 14 },
  { dato: '2024-06-15', antall: 7 },
]

export const Default: Story = {
  args: {
    opprettetPerDag: mockOpprettetPerDag,
  },
}

export const FixedHeight: Story = {
  args: {
    opprettetPerDag: mockOpprettetPerDag,
    chartHeight: 180,
  },
}
