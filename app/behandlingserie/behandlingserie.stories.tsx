import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import BehandlingOpprett_index from './behandlingserie'

const meta: Meta = {
  title: 'Sider/Behandlingserie',
  component: BehandlingOpprett_index,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () =>
    renderWithLoader(BehandlingOpprett_index, {
      behandlingSerier: [
        {
          behandlingSerieId: '1',
          behandlingCode: 'DagligAvstemming',
          regelmessighet: 'range',
          opprettetAv: 'VERDANDE',
          opprettet: '2024-06-01T08:00:00',
          startDato: '2024-06-01',
          sluttDato: '2024-12-31',
          behandlinger: [
            {
              behandlingId: 5001,
              status: 'OPPRETTET',
              behandlingSerieId: '1',
              behandlingCode: 'DagligAvstemming',
              planlagtStartet: '2024-07-01T10:00:00',
            },
          ],
        },
      ],
    }),
}

export const Empty: Story = {
  render: () =>
    renderWithLoader(BehandlingOpprett_index, {
      behandlingSerier: [],
    }),
}
