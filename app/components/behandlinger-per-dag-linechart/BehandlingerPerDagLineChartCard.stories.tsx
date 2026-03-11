import type { Meta, StoryObj } from '@storybook/react'
import { mockDashboardResponse } from '../../../.storybook/mocks/data'
import { withRouter } from '../../../.storybook/mocks/router'
import { BehandlingerPerDagLineChartCard } from './BehandlingerPerDagLineChartCard'

const meta = {
  title: 'Komponenter/BehandlingerPerDagLineChartCard',
  component: BehandlingerPerDagLineChartCard,
  decorators: [withRouter],
} satisfies Meta<typeof BehandlingerPerDagLineChartCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    opprettetPerDag: mockDashboardResponse().opprettetPerDag,
  },
}

export const FixedHeight: Story = {
  args: {
    opprettetPerDag: mockDashboardResponse().opprettetPerDag,
    chartHeight: 180,
  },
}
