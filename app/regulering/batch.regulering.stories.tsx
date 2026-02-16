import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import OpprettReguleringBatchRoute from './batch.regulering'

const mockData = {
  regulering: {
    steg: 1,
    uttrekk: null,
    orkestreringer: [],
    avviksgrenser: [],
  },
}

const meta: Meta = {
  title: 'Sider/Regulering',
  component: OpprettReguleringBatchRoute,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => renderWithLoader(OpprettReguleringBatchRoute, mockData, '/batch/regulering/uttrekk'),
}
