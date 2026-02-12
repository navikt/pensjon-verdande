import type { Meta, StoryObj } from '@storybook/react'
import { mockBehandlingerPage } from '../../.storybook/mocks/data'
import { renderWithLoader } from '../../.storybook/mocks/router'
import BatchOpprett_index from './aldersovergang._index'

const meta: Meta = {
  title: 'Sider/Aldersovergang',
  component: BatchOpprett_index,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () =>
    renderWithLoader(BatchOpprett_index, {
      behandlinger: mockBehandlingerPage(),
      maneder: ['2025-01', '2025-02', '2025-03'],
      erBegrensUtplukkLovlig: true,
      kanOverstyreBehandlingsmaned: false,
      defaultMonth: '2025-01',
    }),
}
