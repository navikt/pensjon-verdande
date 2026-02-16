import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import FastsettForventetInntekt from './bpen091'

const meta: Meta = {
  title: 'Sider/Uføretrygd/BPEN091',
  component: FastsettForventetInntekt,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () =>
    renderWithLoader(FastsettForventetInntekt, {
      lastYear: 2024,
    }),
}
