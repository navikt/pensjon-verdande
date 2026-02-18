import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import VarselRegelendring2026 from './varsel-regelendring2026'

const meta: Meta = {
  title: 'Sider/Uføretrygd/Varsel-regelendring2026',
  component: VarselRegelendring2026,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => renderWithLoader(VarselRegelendring2026, {}),
}
