import type { Meta, StoryObj } from '@storybook/react'
import { mockDashboardResponse } from '../../../.storybook/mocks/data'
import { BehandlingerPerDagLineChart } from './BehandlingerPerDagLineChart'

const meta = {
  title: 'Komponenter/BehandlingerPerDagLineChart',
  component: BehandlingerPerDagLineChart,
} satisfies Meta<typeof BehandlingerPerDagLineChart>

export default meta
type Story = StoryObj<typeof meta>

export const Siste30Dager: Story = {
  args: {
    opprettetPerDag: mockDashboardResponse().opprettetPerDag,
    antallDager: 30,
  },
}

export const Siste7Dager: Story = {
  args: {
    opprettetPerDag: mockDashboardResponse().opprettetPerDag,
    antallDager: 7,
  },
}
