import type { Meta, StoryObj } from '@storybook/react'
import type { DatoAntall } from '~/types'
import { BehandlingerPerDagLineChart } from './BehandlingerPerDagLineChart'

const meta = {
  title: 'Komponenter/BehandlingerPerDagLineChart',
  component: BehandlingerPerDagLineChart,
} satisfies Meta<typeof BehandlingerPerDagLineChart>

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

export const Siste30Dager: Story = {
  args: {
    opprettetPerDag: mockOpprettetPerDag,
    antallDager: 30,
  },
}

export const Siste7Dager: Story = {
  args: {
    opprettetPerDag: mockOpprettetPerDag,
    antallDager: 7,
  },
}
