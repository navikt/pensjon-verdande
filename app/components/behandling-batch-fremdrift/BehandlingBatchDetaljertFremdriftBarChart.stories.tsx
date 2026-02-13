import type { Meta, StoryObj } from '@storybook/react'
import { BehandlingBatchDetaljertFremdriftBarChart } from './BehandlingBatchDetaljertFremdriftBarChart'

const meta = {
  title: 'Komponenter/BehandlingBatchDetaljertFremdriftBarChart',
  component: BehandlingBatchDetaljertFremdriftBarChart,
} satisfies Meta<typeof BehandlingBatchDetaljertFremdriftBarChart>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    detaljertFremdrift: {
      ferdig: 75,
      totalt: 100,
      behandlingerDetaljertFremdrift: [
        {
          level: 0,
          behandlingCode: 'Regulering',
          ferdig: 50,
          totalt: 60,
          debug: 0,
          fullfort: 45,
          opprettet: 5,
          stoppet: 2,
          underBehandling: 5,
          feilende: 3,
        },
        {
          level: 1,
          behandlingCode: 'Omregning',
          ferdig: 25,
          totalt: 40,
          debug: 1,
          fullfort: 20,
          opprettet: 3,
          stoppet: 1,
          underBehandling: 10,
          feilende: 5,
        },
      ],
    },
  },
}
