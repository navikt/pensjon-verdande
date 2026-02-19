import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import BehandlingOpprett_index from './behandlingserie'
import { DEFAULT_SERIE_VALG } from './serieValg'

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
      serieValg: DEFAULT_SERIE_VALG,
      tillateBehandlinger: ['DagligAvstemming'],
    }),
}

export const Empty: Story = {
  render: () =>
    renderWithLoader(BehandlingOpprett_index, {
      behandlingSerier: [],
      serieValg: DEFAULT_SERIE_VALG,
      tillateBehandlinger: ['DagligAvstemming'],
    }),
}

export const MedRegelAdvarsler: Story = {
  render: () =>
    renderWithLoader(BehandlingOpprett_index, {
      behandlingSerier: [],
      serieValg: {
        dagIMaanedRegler: [{ type: 'AFTER', dag: 15 }],
        maksBehandlingerPerMnd: 3,
        ekskluderteMaaneder: [6, 7, 12],
        enableRangeVelger: true,
      },
      tillateBehandlinger: ['DagligAvstemming'],
    }),
}
