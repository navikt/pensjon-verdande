import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import HvilendeRettPage from './hvilende-rett'

const meta: Meta = {
  title: 'Sider/Uføretrygd/Hvilende rett',
  component: HvilendeRettPage,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => renderWithLoader(HvilendeRettPage, {}),
}
