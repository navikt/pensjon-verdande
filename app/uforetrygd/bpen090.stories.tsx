import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import LopendeInntektsavkorting from './bpen090'

const meta: Meta = {
  title: 'Sider/Uføretrygd/BPEN090',
  component: LopendeInntektsavkorting,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () =>
    renderWithLoader(LopendeInntektsavkorting, {
      kjoremaaned: 202506,
    }),
}
