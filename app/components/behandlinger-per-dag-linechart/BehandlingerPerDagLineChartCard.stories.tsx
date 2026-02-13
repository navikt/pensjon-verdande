import type { Meta, StoryObj } from '@storybook/react'
import { mockDashboardResponse } from '../../../.storybook/mocks/data'
import { BehandlingerPerDagLineChartCard } from './BehandlingerPerDagLineChartCard'

const meta = {
  title: 'Komponenter/BehandlingerPerDagLineChartCard',
  component: BehandlingerPerDagLineChartCard,
} satisfies Meta<typeof BehandlingerPerDagLineChartCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    opprettetPerDag: mockDashboardResponse().opprettetPerDag,
  },
}
