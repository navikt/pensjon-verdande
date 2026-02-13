import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import BatchOpprett_index from './batch.inntektskontroll._index'

const mockData = {
  detteÅret: 2024,
}

const meta: Meta = {
  title: 'Sider/Inntektskontroll',
  component: BatchOpprett_index,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => renderWithLoader(BatchOpprett_index, mockData),
}
