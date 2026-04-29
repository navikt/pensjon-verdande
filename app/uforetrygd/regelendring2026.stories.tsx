import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import Regelendring2026 from './regelendring2026'

const meta: Meta = {
  title: 'Sider/Uføretrygd/regelendring2026',
  component: Regelendring2026,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => renderWithLoader(Regelendring2026, {}),
}
